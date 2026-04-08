package startgg

import "fmt"

const perPage = 50

func (c *Client) GetTournamentEvents(slug string) (*TournamentEventsResponse, error) {
	var out TournamentEventsResponse
	err := c.query(queryTournamentEvents, map[string]any{"slug": slug}, &out)
	return &out, err
}

func (c *Client) GetAllEntrants(eventID int) ([]Entrant, error) {
	var all []Entrant
	for page := 1; ; page++ {
		var out EventEntrantsResponse
		err := c.query(queryEventEntrants, map[string]any{
			"eventId": fmt.Sprintf("%d", eventID),
			"page":    page,
			"perPage": perPage,
		}, &out)
		if err != nil {
			return nil, err
		}
		all = append(all, out.Event.Entrants.Nodes...)
		if page >= out.Event.Entrants.PageInfo.TotalPages {
			break
		}
	}
	return all, nil
}

func (c *Client) GetAllSets(eventID int) ([]Set, error) {
	var all []Set
	for page := 1; ; page++ {
		var out EventSetsResponse
		err := c.query(queryEventSets, map[string]any{
			"eventId": fmt.Sprintf("%d", eventID),
			"page":    page,
			"perPage": perPage,
		}, &out)
		if err != nil {
			return nil, err
		}
		all = append(all, out.Event.Sets.Nodes...)
		if page >= out.Event.Sets.PageInfo.TotalPages {
			break
		}
	}
	return all, nil
}
