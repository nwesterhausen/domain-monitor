package configuration

// Location for main config file
const AppConfig = "config.yaml"

// Location for domains storage
const Domains = "domain.yaml"

// Location for the whois cache
const WhoisCacheName = "whois-cache.yaml"

// struct for tracking the directory
type ConfigDirectory struct {
	// The directory to store configuration and cache files
	DataDir string
}
