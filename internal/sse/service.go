package sse

type Service struct {
	Broadcaster *Broadcaster
}

func NewService(broadcaster *Broadcaster) *Service {
	return &Service{
		Broadcaster: broadcaster,
	}
}

func (s *Service) UpdateMatchData(data MatchDataUpdateDTO) {
  s.Broadcaster.Broadcast(data)
}
