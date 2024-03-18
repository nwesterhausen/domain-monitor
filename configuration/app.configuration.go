package configuration

type AppConfiguration struct {
	Port int `yaml:"port"`
}

type AlertsConfiguration struct {
	Admin      string `yaml:"admin"`
	SendAlerts bool  `yaml:"send_alerts"`
}

type SMTPConfiguration struct {
	Host     string `yaml:"host"`
	Port     int 	`yaml:"port"`
	Secure   bool 	`yaml:"secure"`
	AuthUser string `yaml:"auth_user"`
	AuthPass string `yaml:"auth_pass"`
}

type Configuration struct {
	App    AppConfiguration `yaml:"app"`
	Alerts AlertsConfiguration `yaml:"alerts"`
	SMTP   SMTPConfiguration `yaml:"smtp"`
}

// returns default configuration
func DefaultConfiguration() Configuration {
	return Configuration{
		App: AppConfiguration{
			Port: 3124,
		},
		Alerts: AlertsConfiguration{
			Admin:      "",
			SendAlerts: false,
		},
		SMTP: SMTPConfiguration{
			Host:     "smtp.example.com",
			Port:     587,
			Secure:   true,
			AuthUser: "",
			AuthPass: "",

		},
	}
}
