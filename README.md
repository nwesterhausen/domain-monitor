# domain-monitor
Self-hosted server to monitor WHOIS records for specified domains.

## Usage
Should by OS agnostic. Not in NPM yet.. so instead:

```
git clone https://github.com/nwesterhausen/domain-monitor.git
cd domain-monitor
yarn
node ./index.js
```

Configuration can be done via the configuration page of the web gui 
(default http://localhost:4201)

## Config
There are two config files which you can edit yourself or use the web 
gui.

### config.yaml
A sample is provided as sample.config.yaml

TODO: explain options

### domain.yaml
Contains a single object (domains) which is a list of domains to 
monitor.

TODO: explain domain object

Each domain will have a domain-id referenced by domain-monitor. If this 
is left out of domain.yaml, 
a new one will be generated when the file is read. These IDs are used 
for consistency when editing,
deleting, or adding watched domains. (ID FEATURE NOT IMPLEMENTED YET)

