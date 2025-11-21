package event

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) CreateEvent(name string) (*Event, error) {
	event := EventCreateDTO{
		Name: name,
	}

	return s.repository.Save(&event)
}
