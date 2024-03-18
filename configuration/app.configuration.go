package configuration

type AppConfiguration struct {
	port int
}

type AlertsConfiguration struct {
	admin      string
	sendalerts bool
}

type SMTPConfiguration struct {
	host     string
	port     int
	secure   bool
	authUser string
	authPass string
}

type Configuration struct {
	App    AppConfiguration
	alerts AlertsConfiguration
	smtp   SMTPConfiguration
}

// returns default configuration
func DefaultConfiguration() Configuration {
	return Configuration{
		App: AppConfiguration{
			port: 3124,
		},
		alerts: AlertsConfiguration{
			admin:      "",
			sendalerts: false,
		},
		smtp: SMTPConfiguration{
			host:     "localhost",
			port:     25,
			secure:   false,
			authUser: "",
			authPass: "",
		},
	}
}
