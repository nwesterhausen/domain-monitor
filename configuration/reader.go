package configuration

import (
	"io"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Location for main config file
const AppConfig = "config.yaml"

// Location for domains storage
const Domains = "domain.yaml"

// Location for the whois cache
const WhoisCacheFile = "whois-cache.yaml"

// Read the app configuration from the config file
func ReadAppConfig() Configuration {
	config := Configuration{}

	// read config file
	file, err := os.ReadFile(AppConfig)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		config = DefaultConfiguration()
		log.Println("🆕 Using default configuration to create " + AppConfig)
		// write default config to file
		WriteAppConfig(config)
		return config
	}

	// use file to parse yaml
	err = yaml.Unmarshal(file, &config)
	if err != nil {
		log.Println("Error while unmarshalling configuration")
		log.Fatalf("error: %v", err)
	}

	return config
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

// Read the domain configuration from the config file
func ReadDomains() DomainConfiguration {
	config := DomainConfiguration{}

	// read config file
	file, err := os.ReadFile(Domains)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		config = DefaultDomainConfiguration()
		log.Println("🆕 Using default configuration to create " + Domains)
		// write default config to file
		WriteDomains(config)
		return config
	}

	// use file to parse yaml
	err = yaml.Unmarshal(file, &config)
	if err != nil {
		log.Println("Error while unmarshalling configuration")
		log.Fatalf("error: %v", err)
	}

	return config
}

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

// Read the whois cache from the config file
func ReadWhoisCache() WhoisCacheStorage {
	config := WhoisCacheStorage{}

	// read config file
	file, err := os.ReadFile(WhoisCacheFile)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		config = DefaultWhoisCacheStorage()
		log.Println("🆕 Using default (empty) cache to create " + WhoisCacheFile)
		// write default config to file
		WriteWhoisCache(config)
		return config
	}

	// use file to parse yaml
	err = yaml.Unmarshal(file, &config)
	if err != nil {
		log.Println("Error while unmarshalling whois cache")
		log.Fatalf("error: %v", err)
	}

	return config
}

// Write the whois cache to the config file
func WriteWhoisCache(config WhoisCacheStorage) {
	data, dataErr := yaml.Marshal(config)
	if dataErr != nil {
		log.Println("Error while marshalling whois cache")
		log.Fatalf("error: %v", dataErr)
	}

	file, err := os.Create(WhoisCacheFile)
	if err != nil {
		log.Println("Error while creating whois cache file")
		log.Fatalf("error: %v", err)
	}

	defer file.Close()

	_, err = io.WriteString(file, string(data))
	if err != nil {
		log.Println("Error while writing whois cache file")
		log.Fatalf("error: %v", err)
	}
}
