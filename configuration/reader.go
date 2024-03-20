package configuration

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Read the app configuration from the config file
func (dir ConfigDirectory) ReadAppConfig() Configuration {
	var configInner ConfigurationFile
	filepath := dir.DataDir + "/" + AppConfig

	// read config file from the provided base path
	file, err := os.ReadFile(filepath)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		config := DefaultConfiguration(filepath)
		log.Println("🆕 Using default configuration to create " + AppConfig)
		// write default config to file
		config.Flush()
		return config
	}

	// use file to parse yaml
	err = yaml.Unmarshal(file, &configInner)
	if err != nil {
		log.Println("Error while unmarshalling configuration")
		log.Fatalf("error: %v", err)
	}

	// spot check for empty config
	if configInner.App.Port == 0 && configInner.Alerts.Admin == "" && configInner.SMTP.Host == "" {
		log.Println("🚨 Configuration file may be empty.")
		// pretty print the config
		log.Printf("🚨 %+v\n", configInner)
	}

	return Configuration{
		Filepath: filepath,
		Config:   configInner,
	}
}

// Read the domain configuration from the config file
func (dir ConfigDirectory) ReadDomains() DomainConfiguration {
	domains := DomainFile{}
	filepath := dir.DataDir + "/" + Domains

	// read config file
	file, err := os.ReadFile(filepath)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		domainConfig := DefaultDomainConfiguration(filepath)
		log.Println("🆕 Using default configuration to create " + Domains)
		// write default config to file
		domainConfig.Flush()
		return domainConfig
	}

	// use file to parse yaml
	err = yaml.Unmarshal(file, &domains)
	if err != nil {
		log.Println("Error while unmarshalling configuration")
		log.Fatalf("error: %v", err)
	}

	return DomainConfiguration{
		Filepath:   filepath,
		DomainFile: domains,
	}
}

// Read the whois cache from the config file
func (dir ConfigDirectory) ReadWhoisCache() WhoisCacheStorage {
	cache := WhoisCacheFile{}
	filepath := dir.DataDir + "/" + WhoisCacheName

	// read config file
	file, err := os.ReadFile(filepath)
	if err != nil {
		log.Printf("\nerror: %v\n", err)
		cache := DefaultWhoisCacheStorage(filepath)
		log.Println("🆕 Using default (empty) cache to create " + WhoisCacheName)
		// write default config to file
		cache.Flush()
		return cache
	}

	// use file to parse yaml
	err = yaml.Unmarshal(file, &cache)
	if err != nil {
		log.Println("Error while unmarshalling whois cache")
		log.Fatalf("error: %v", err)
	}

	return WhoisCacheStorage{
		Filepath:     filepath,
		FileContents: cache,
	}
}
