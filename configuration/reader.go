package configuration

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Read the app configuration from the config file
func (dir ConfigDirectory) ReadAppConfig() Configuration {
	config := Configuration{}

	// read config file from the provided base path
	file, err := os.ReadFile(dir.DataDir + "/" + AppConfig)
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
func (dir ConfigDirectory) ReadDomains() DomainConfiguration {
	config := DomainConfiguration{}

	// read config file
	file, err := os.ReadFile(dir.DataDir + "/" + Domains)
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
func (dir ConfigDirectory) ReadWhoisCache() WhoisCacheStorage {
	config := WhoisCacheStorage{}

	// read config file
	file, err := os.ReadFile(dir.DataDir + "/" + WhoisCacheName)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		config = DefaultWhoisCacheStorage(dir.DataDir + "/" + WhoisCacheName)
		log.Println("🆕 Using default (empty) cache to create " + WhoisCacheName)
		// write default config to file
		config.Flush()
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
