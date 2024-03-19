package configuration

import (
	"io"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type AppConfiguration struct {
	// The port the application listens on
	Port int `yaml:"port" json:"port"`
	// WHOIS Cache Refresh Interval in hours
	WhoisRefreshInterval int `yaml:"whoisRefreshInterval" json:"whoisRefreshInterval"`
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
	AuthUser string `yaml:"authUser" json:"authUser"`
	// SMTP user password
	AuthPass string `yaml:"authPass" json:"authPass"`
	// Enable SMTP
	Enabled bool `yaml:"enabled" json:"enabled"`
	// Name of the sender
	FromName string `yaml:"fromName" json:"fromName"`
	// Email address of the sender
	FromAddress string `yaml:"fromAddress" json:"fromAddress"`
}

type ConfigurationFile struct {
	// The application configuration
	App AppConfiguration `yaml:"app" json:"app"`
	// The alerts configuration
	Alerts AlertsConfiguration `yaml:"alerts" json:"alerts"`
	// The SMTP configuration
	SMTP SMTPConfiguration `yaml:"smtp" json:"smtp"`
}

type Configuration struct {
	// The config data
	Config ConfigurationFile
	// The path to the config file
	Filepath string
}

// returns default configuration
func DefaultConfiguration(filepath string) Configuration {
	return Configuration{
		Filepath: filepath,
		Config: ConfigurationFile{
			App: AppConfiguration{
				Port:                 3124,
				WhoisRefreshInterval: 5,
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
				Enabled:  false,
			},
		}}
}

// Write the app configuration to the config file
func (c Configuration) Flush() {
	data, dataErr := yaml.Marshal(c.Config)
	if dataErr != nil {
		log.Println("Error while marshalling configuration")
		log.Fatalf("error: %v", dataErr)
	}

	file, err := os.Create(c.Filepath)
	if err != nil {
		log.Println("Error while creating configuration file")
		log.Fatalf("error: %v", err)
	}

	defer file.Close()

	_, err = io.WriteString(file, string(data))
	if err != nil {
		log.Println("Error while writing configuration file")
		log.Fatalf("error: %v", err)
	}
}
