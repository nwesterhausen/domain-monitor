# domain-monitor
Self-hosted server to monitor WHOIS records for specified domains, to help alert you of unwanted/unexpected changes
to your domains and to help remind you when they need renewed.

If you use domain-monitor, make sure to abide by the terms of service of
the TLD WHOIS server. Most forbid high-volume queries, marketing usage,
and automated queries that are more than reasonably needed to register
domain names.

To help you abide by WHOIS server TOS, domain-monitor barely queries the
whois databases. domain-monitor acts in this way:

1. Creates a reference whois file for the domain, including time queried
2. Updates a whois reference if one of the following conditions is met:

  - Reference file becomes 9 months old
  - It's 3 months until the domain expiry date
  - It's 2 months until the domain expiry date
  - It's 1 month until the domain expiry date
  - It's 2 weeks until the domain expiry date
  - You tell domain-monitor you expect the WHOIS data to have changed
    (e.g. you renewed, transfered the domain, changed name servers)

3. Checks periodically using DNS if the name servers match WHOIS reference file.
If they don't, this triggers an alert (and a prompt to force update the WHOIS reference).

## Installation
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

