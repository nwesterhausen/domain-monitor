package configuration

type Alert int

const (
	Alert2Months Alert = iota
	Alert1Month
	Alert2Weeks
	Alert1Week
	Alert3Days
	AlertDaily
)

func (a Alert) String() string {
	return [...]string{"2 month alert", "1 month alert", "2 week alert", "1 week alert", "3 day alert", "daily alert"}[a]
}
