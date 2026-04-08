package constant

type Status string

const (
	StatusNew       Status = "NEW"
	StatusActive    Status = "ACTIVE"
	StatusCompleted Status = "COMPLETED"
	StatusDisabled  Status = "DISABLED"
	StatusDeleted   Status = "DELETED"
)
