package configuration

import (
	"log"
	"time"

	"github.com/likexian/whois"
	whoisparser "github.com/likexian/whois-parser"
)

type WhoisCache struct {
	// FQDN this entry is for (this is the index used in this app)
	FQDN string `yaml:"fqdn" json:"fqdn"`
	// The WhoisInfo object
	WhoisInfo whoisparser.WhoisInfo `yaml:"whoisInfo" json:"whoisInfo"`
	// Date this entry was last updated
	LastUpdated time.Time `yaml:"lastUpdated" json:"lastUpdated"`
}

type WhoisCacheStorage struct {
	// The whois cache entries
	Entries []WhoisCache `yaml:"entries" json:"entries"`
}

func DefaultWhoisCacheStorage() WhoisCacheStorage {
	return WhoisCacheStorage{
		Entries: []WhoisCache{},
	}
}

func (w *WhoisCacheStorage) Get(fqdn string) *WhoisCache {
	// Find the entry
	for i := range w.Entries {
		if w.Entries[i].FQDN == fqdn {
			return &w.Entries[i]
		}
	}

	// If the entry was not found, return nil
	return nil
}

func (w *WhoisCacheStorage) GetAll() []WhoisCache {
	return w.Entries
}

func (w *WhoisCacheStorage) Add(fqdn string) {
	// Create a new entry
	newEntry := WhoisCache{
		FQDN:        fqdn,
		WhoisInfo:   whoisparser.WhoisInfo{},
		LastUpdated: time.Time{},
	}

	// Perform the whois query
	newEntry.Refresh()

	// Add the entry to the list
	w.Entries = append(w.Entries, newEntry)
}

func (w *WhoisCacheStorage) Refresh() {
	// Only refresh the entries that are expired
	for i := range w.Entries {
		if w.Entries[i].IsExpired() {
			w.Entries[i].Refresh()
		}
	}
}

func (w *WhoisCacheStorage) Remove(fqdn string) {
	// Find the entry
	for i := range w.Entries {
		if w.Entries[i].FQDN == fqdn {
			// Remove the entry
			w.Entries = append(w.Entries[:i], w.Entries[i+1:]...)
			return
		}
	}
}

func (w *WhoisCache) IsExpired() bool {
	// If the last update was more than 30 days ago, then it's expired
	return time.Now().Sub(w.LastUpdated) > 30*24*time.Hour
}

func (w *WhoisCache) Refresh() {
	// Perform the whois query
	whoisRaw, err := whois.Whois(w.FQDN)
	if err != nil {
		log.Printf("Error querying whois for %s: %s", w.FQDN, err)
		return
	}

	// Parse the whois response
	whoisInfo, err := whoisparser.Parse(whoisRaw)
	if err != nil {
		log.Printf("Error parsing whois for %s: %s", w.FQDN, err)
		return
	}

	// Update the object
	w.WhoisInfo = whoisInfo
	w.LastUpdated = time.Now()

	log.Printf("Refreshed whois for %s", w.FQDN)
}
