package configuration

import "time"

// Location for main config file
const AppConfig = "config.yaml"

// Location for domains storage
const Domains = "domain.yaml"

// Location for the whois cache
const WhoisCacheName = "whois-cache.yaml"

// Interval for WHOIS to recheck expirations times and cache validity
const WhoisRefreshInterval = time.Hour * 4

// struct for tracking the directory
type ConfigDirectory struct {
	// The directory to store configuration and cache files
	DataDir string
}
