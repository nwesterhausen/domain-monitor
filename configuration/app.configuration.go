package configuration

type AppConfiguration struct {
	// The port the application listens on
	Port int `yaml:"port" json:"port"`
}

type AlertsConfiguration struct {
	// The admin email address for receiving alerts
	Admin string `yaml:"admin" json:"admin"`
	// Send alerts for monitored domains
	SendAlerts bool `yaml:"send_alerts" json:"send_alerts"`
}

type SMTPConfiguration struct {
	// SMTP host
	Host string `yaml:"host" json:"host"`
	// SMTP port
	Port int `yaml:"port" json:"port"`
	// Use secure connection (TLS)
	Secure bool `yaml:"secure" json:"secure"`
	// SMTP user name
	AuthUser string `yaml:"auth_user" json:"auth_user"`
	// SMTP user password
	AuthPass string `yaml:"auth_pass" json:"auth_pass"`
}

type Configuration struct {
	// The application configuration
	App AppConfiguration `yaml:"app" json:"app"`
	// The alerts configuration
	Alerts AlertsConfiguration `yaml:"alerts" json:"alerts"`
	// The SMTP configuration
	SMTP SMTPConfiguration `yaml:"smtp" json:"smtp"`
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
