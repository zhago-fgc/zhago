package startgg

// Tournament query response

type TournamentEventsResponse struct {
	Tournament struct {
		ID     int    `json:"id"`
		Name   string `json:"name"`
		Events []Event `json:"events"`
	} `json:"tournament"`
}

type Event struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	NumEntrants int    `json:"numEntrants"`
	State       string `json:"state"`
	Videogame   struct {
		Name string `json:"name"`
	} `json:"videogame"`
}

// Entrants query response

type EventEntrantsResponse struct {
	Event struct {
		Entrants struct {
			PageInfo  PageInfo  `json:"pageInfo"`
			Nodes    []Entrant `json:"nodes"`
		} `json:"entrants"`
	} `json:"event"`
}

type Entrant struct {
	ID           int           `json:"id"`
	Participants []Participant `json:"participants"`
}

type Participant struct {
	GamerTag string `json:"gamerTag"`
	Prefix   string `json:"prefix"`
	Player   struct {
		ID int `json:"id"`
	} `json:"player"`
	User *struct {
		GenderPronoun string `json:"genderPronoun"`
	} `json:"user"`
}

// Sets query response

type EventSetsResponse struct {
	Event struct {
		Sets struct {
			PageInfo PageInfo `json:"pageInfo"`
			Nodes   []Set    `json:"nodes"`
		} `json:"sets"`
	} `json:"event"`
}

type Set struct {
	ID            int    `json:"id"`
	FullRoundText string `json:"fullRoundText"`
	Round         int    `json:"round"`
	DisplayScore  string `json:"displayScore"`
	WinnerID      int    `json:"winnerId"`
	Slots         []Slot `json:"slots"`
	Games         []Game `json:"games"`
}

type Slot struct {
	Entrant *struct {
		ID           int           `json:"id"`
		Participants []Participant `json:"participants"`
	} `json:"entrant"`
}

type Game struct {
	WinnerID   int         `json:"winnerId"`
	Selections []Selection `json:"selections"`
}

type Selection struct {
	Entrant        struct{ ID int `json:"id"` } `json:"entrant"`
	SelectionValue int                          `json:"selectionValue"`
}

type PageInfo struct {
	TotalPages int `json:"totalPages"`
}
