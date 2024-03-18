package configuration

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Location for main config file
const AppConfig = "config.yaml"

// Location for domains storage
const Domains = "domain.yaml"

func ReadAppConfig() Configuration {
	config := Configuration{}

	// read config file
	file, err := os.Open(AppConfig)
	if err != nil {
		log.Fatalf("error: %v", err)
		config = DefaultConfiguration()
		log.info("Using default configuration")
		// write default config to file
		WriteAppConfig(config)
		return config
	}

	err := yaml.Unmarshal(file, &config)
	if err != nil {
		log.Fatalf("error: %v", err)
		log.Panic("Unusable configuration file")
	}
}

func WriteAppConfig(config Configuration) {
	data, err := yaml.Marshal(config)
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	file, err := os.Create(AppConfig)
	if err != nil {
		log.Fatalf("error: %v", err)
	}

}
