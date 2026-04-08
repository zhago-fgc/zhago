package service

import (
	"fmt"
	"net/url"
	"strings"
	"time"
	"zhago/internal/constant"
	"zhago/internal/domain/model"
	"zhago/internal/startgg"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StartGGImportService struct {
	db *gorm.DB
}

func NewStartGGImportService(db *gorm.DB) *StartGGImportService {
	return &StartGGImportService{db: db}
}

// ImportTournament imports a start.gg tournament URL into Zhago.
// It creates a Zhago Event, one Tournament per start.gg event,
// resolves/creates Players, and populates Sets.
func (s *StartGGImportService) ImportTournament(rawURL, token string) error {
	slug, err := extractSlug(rawURL)
	if err != nil {
		return err
	}

	client := startgg.NewClient(token)

	resp, err := client.GetTournamentEvents(slug)
	if err != nil {
		return fmt.Errorf("import: fetch tournament: %w", err)
	}
	if resp.Tournament.Name == "" {
		return fmt.Errorf("import: tournament not found for slug %q", slug)
	}

	// Create Zhago Event from start.gg tournament
	event := &model.Event{
		ID:        uuid.NewString(),
		Name:      resp.Tournament.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.db.Create(event).Error; err != nil {
		return fmt.Errorf("import: create event: %w", err)
	}

	for _, sggEvent := range resp.Tournament.Events {
		if err := s.importEvent(client, event.ID, sggEvent); err != nil {
			return fmt.Errorf("import: event %q: %w", sggEvent.Name, err)
		}
	}

	return nil
}

func (s *StartGGImportService) importEvent(client *startgg.Client, eventID string, sggEvent startgg.Event) error {
	// Create Zhago Tournament from start.gg event
	tourn := &model.Tournament{
		ID:        uuid.NewString(),
		EventID:   eventID,
		Name:      sggEvent.Name,
		Game:      sggEvent.Videogame.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.db.Create(tourn).Error; err != nil {
		return fmt.Errorf("create tournament: %w", err)
	}

	// Fetch entrants and resolve to Zhago Players
	entrants, err := client.GetAllEntrants(sggEvent.ID)
	if err != nil {
		return fmt.Errorf("fetch entrants: %w", err)
	}

	// entrantID → zhago player ID
	entrantMap := make(map[int]string, len(entrants))
	for _, entrant := range entrants {
		if len(entrant.Participants) == 0 {
			continue
		}
		p := entrant.Participants[0]
		playerID, err := s.resolvePlayer(p)
		if err != nil {
			return fmt.Errorf("resolve player %q: %w", p.GamerTag, err)
		}
		entrantMap[entrant.ID] = playerID
	}

	// Fetch sets and create Zhago Sets
	sets, err := client.GetAllSets(sggEvent.ID)
	if err != nil {
		return fmt.Errorf("fetch sets: %w", err)
	}

	for _, sggSet := range sets {
		if err := s.importSet(tourn.ID, sggSet, entrantMap); err != nil {
			// Non-fatal: log and continue (incomplete sets are common mid-tournament)
			continue
		}
	}

	return nil
}

func (s *StartGGImportService) importSet(tournID string, sggSet startgg.Set, entrantMap map[int]string) error {
	if len(sggSet.Slots) < 2 || sggSet.Slots[0].Entrant == nil || sggSet.Slots[1].Entrant == nil {
		return fmt.Errorf("set %d: incomplete slots", sggSet.ID)
	}

	p1ID, ok1 := entrantMap[sggSet.Slots[0].Entrant.ID]
	p2ID, ok2 := entrantMap[sggSet.Slots[1].Entrant.ID]
	if !ok1 || !ok2 {
		return fmt.Errorf("set %d: unknown entrant", sggSet.ID)
	}

	set := &model.Set{
		ID:           uuid.NewString(),
		TournamentID: tournID,
		Player1ID:    p1ID,
		Player2ID:    p2ID,
		Round:        sggSet.FullRoundText,
		RoundOrder:   sggSet.Round,
		ExternalID:   fmt.Sprintf("%d", sggSet.ID),
		BestOf:       3,
		CreatedAt:    time.Now(),
	}

	// Populate scores from displayScore if the set is completed
	if sggSet.WinnerID != 0 {
		p1Score, p2Score := parseDisplayScore(sggSet.DisplayScore,
			sggSet.Slots[0].Entrant.Participants, sggSet.Slots[1].Entrant.Participants)
		set.Player1Score = p1Score
		set.Player2Score = p2Score

		if entrantMap[sggSet.WinnerID] == p1ID {
			set.WinnerID = p1ID
		} else {
			set.WinnerID = p2ID
		}
	}

	return s.db.Create(set).Error
}

// resolvePlayer finds an existing player by their start.gg player ID alias,
// or creates a new one if not found.
func (s *StartGGImportService) resolvePlayer(p startgg.Participant) (string, error) {
	externalID := fmt.Sprintf("%d", p.Player.ID)

	var alias model.PlayerAlias
	err := s.db.Where("source = ? AND external_id = ?", constant.SourceStartGG, externalID).
		First(&alias).Error

	if err == nil {
		return alias.PlayerID, nil
	}

	// 2. Fall back to case-insensitive tag match against existing players.
	// Handles manually-added players who registered on start.gg under the same tag.
	var existing model.Player
	if err := s.db.Where("LOWER(tag) = LOWER(?)", p.GamerTag).First(&existing).Error; err == nil {
		// Link this start.gg player ID to the existing player for future imports.
		linkAlias := &model.PlayerAlias{
			ID:         uuid.NewString(),
			PlayerID:   existing.ID,
			Alias:      p.GamerTag,
			Source:     constant.SourceStartGG,
			ExternalID: externalID,
		}
		s.db.Create(linkAlias)
		return existing.ID, nil
	}

	// 3. Create new player
	player := &model.Player{
		ID:        uuid.NewString(),
		Tag:       p.GamerTag,
		Team:      p.Prefix,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.db.Create(player).Error; err != nil {
		return "", err
	}

	newAlias := &model.PlayerAlias{
		ID:         uuid.NewString(),
		PlayerID:   player.ID,
		Alias:      p.GamerTag,
		Source:     constant.SourceStartGG,
		ExternalID: externalID,
	}
	if err := s.db.Create(newAlias).Error; err != nil {
		return "", err
	}

	return player.ID, nil
}

// extractSlug pulls the tournament slug from a start.gg URL.
// Accepts full URLs (https://start.gg/tournament/slug) or bare slugs.
func extractSlug(raw string) (string, error) {
	if !strings.HasPrefix(raw, "http") {
		return strings.TrimPrefix(raw, "tournament/"), nil
	}

	u, err := url.Parse(raw)
	if err != nil {
		return "", fmt.Errorf("invalid URL: %w", err)
	}

	parts := strings.Split(strings.Trim(u.Path, "/"), "/")
	// path: /tournament/<slug>[/event/...]
	if len(parts) >= 2 && parts[0] == "tournament" {
		return parts[1], nil
	}
	return "", fmt.Errorf("could not extract tournament slug from %q", raw)
}

// parseDisplayScore extracts scores from start.gg's displayScore string.
// Format is typically "Tag1 2 - Tag2 1". Falls back to 0-0 on parse failure.
func parseDisplayScore(display string, p1Participants, p2Participants []startgg.Participant) (int, int) {
	if len(p1Participants) == 0 || len(p2Participants) == 0 {
		return 0, 0
	}

	var p1Score, p2Score int
	tag1 := p1Participants[0].GamerTag
	tag2 := p2Participants[0].GamerTag

	// Try "Tag1 N - Tag2 M" pattern
	pattern := fmt.Sprintf("%s %%d - %s %%d", tag1, tag2)
	if n, _ := fmt.Sscanf(display, pattern, &p1Score, &p2Score); n == 2 {
		return p1Score, p2Score
	}
	pattern = fmt.Sprintf("%s %%d - %s %%d", tag2, tag1)
	if n, _ := fmt.Sscanf(display, pattern, &p2Score, &p1Score); n == 2 {
		return p1Score, p2Score
	}

	return 0, 0
}
