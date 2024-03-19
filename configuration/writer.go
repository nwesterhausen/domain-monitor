package configuration

import (
	"io"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Write the domain configuration to the config file
func WriteDomains(config DomainConfiguration) {
	data, dataErr := yaml.Marshal(config)
	if dataErr != nil {
		log.Println("Error while marshalling configuration")
		log.Fatalf("error: %v", dataErr)
	}

	file, err := os.Create(Domains)
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

// Write the app configuration to the config file
func WriteAppConfig(config Configuration) {
	data, dataErr := yaml.Marshal(config)
	if dataErr != nil {
		log.Println("Error while marshalling configuration")
		log.Fatalf("error: %v", dataErr)
	}

	file, err := os.Create(AppConfig)
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
