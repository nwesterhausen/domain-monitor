# domain-monitor

[![Semaphore Status](https://nwest.semaphoreci.com/badges/domain-monitor/branches/master.svg)](https://nwest.semaphoreci.com/projects/domain-monitor)

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

### Docker

The docker image uses two volumes, be aware if you want to manually edit the configs or
view the cached whois data.

| Image Mount     | Contains                        |
| --------------- | ------------------------------- |
| /app/config     | config.yaml and domain.yaml     |
| /app/whois-data | cached whois data in yaml files |

| Exposed Ports | Used for |
| ------------- | -------- |
| 4201/tcp      | WEB GUI  |

#### Using [Github Packages](https://github.com/nwesterhausen/domain-monitor/packages/)

`docker run -p 127.0.0.1:4201:4201 ghcr.io/nwesterhausen/domain-monitor/server`

Example docker-compose:

```yaml
services:
  dm:
    image: ghcr.io/nwesterhausen/domain-monitor/server:latest
    ports:
      - 127.0.0.1:4201:4201/tcp
    volumes:
      - ./config:/app/config:rw
      - ./whois:/app/whois-data:rw
version: "3.9"
```

#### Using [Docker Hub](https://hub.docker.com/repository/docker/nwesterhausen/domain-monitor)

Image is just `nwesterhausen/domain-monitor`, latest tag will be the most recent version, or pull by tagged version.

`docker run -p 127.0.0.1:4201:4201 nwesterhausen/domain-monitor`

### Running with node

Should by OS agnostic. Requires nodejs >= 12

Simply clone this repository, install dependencies and `node server/index.js`. (Eleventy runs as a `postinstall` script.)

```
git clone https://github.com/nwesterhausen/domain-monitor.git
cd domain-monitor
yarn
node ./index.js
```

Configuration can be done via the configuration page of the web gui
(default http://localhost:4201)

## Config

There are two config files which you can edit yourself if you so choose.

### config.yaml

A sample is provided as `sample.config.yaml` and on first run if you don't have
an existing `config.yaml`, domain-monitor copies the sample into `config.yaml` and
any changes you make on the webgui persist in `config.yaml`.

#### App Settings

_Port_

Set the port used by the http server (and WS)

```
app:
  port: 4201
```

#### Alerts

_admin_

Set what email should receive alerts from domain-monitor

_sendalerts_

Boolean, if false prevents all alerts from being sent.

```
alerts:
  admin: admin@example.com
  sendalerts: yes
```

#### SMTP

Set smtp settings for domain-monitor to use to send email alerts.
Nodemailer is on the backend, so these options reflect the options
needed to set up nodemailer smtp transport.

```
smtp:
  host: localhost
  port: 25
  secure: false
  auth:
    user: domain-alert@example.com
    pass: SECRET-PASS
```

### domain.yaml

Contains a single object (domains) which is a list of domains to
monitor. Each domain has the following properties:

| Property    | Type   | Description                                                                                                               |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| name        | string | Descriptive name for the domain entry                                                                                     |
| fqdn        | string | FQDN for the domain in question. This is just host.tld                                                                    |
| alerts      | bool   | If true, email alerts will be sent for this domain                                                                        |
| enabled     | bool   | If true, whois lookups will be done (on the schedule described above) for this domain.                                    |
| (_todo_) id | string | A generated ID string. If you are manually adding to domain.yaml do not add an ID, it will be generated by domain-monitor |

## Development

- install go, node, pnpm
- install air `go install github.com/cosmtrek/air@latest`
- install templ `go install github.com/a-h/templ/cmd/templ@latest`

In root of repository do `pnpm i` to install node dependencies

To compile the templates, run `templ generate` in the root of the repository.

Run dev server with `air`
