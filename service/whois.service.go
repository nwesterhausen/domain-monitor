package service

import (
	"log"
	"time"

	whoisparser "github.com/likexian/whois-parser"
	"github.com/nwesterhausen/domain-monitor/configuration"
)

type ServicesWhois struct {
	store configuration.WhoisCacheStorage
}

func NewWhoisService(store configuration.WhoisCacheStorage) *ServicesWhois {
	return &ServicesWhois{store: store}
}

func (s *ServicesWhois) GetWhois(fqdn string) configuration.WhoisCache {
	for _, entry := range s.store.FileContents.Entries {
		if entry.FQDN == fqdn {
			return entry
		}
	}
	log.Println("WHOIS entry cache miss for", fqdn)

	return configuration.WhoisCache{
		FQDN:        fqdn,
		WhoisInfo:   whoisparser.WhoisInfo{},
		LastUpdated: time.Time{},
	}
}
