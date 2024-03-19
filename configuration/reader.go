package configuration

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

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
