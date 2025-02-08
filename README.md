# [ft_trans](https://projects.intra.42.fr/ft_transcendence/lvincent) [![CodeFactor](https://www.codefactor.io/repository/github/c18h24o2/ft_transcendence/badge/main)](https://www.codefactor.io/repository/github/c18h24o2/ft_transcendence/overview/main) [![Build with Docker Compose](https://github.com/C18H24O2/ft_transcendence/actions/workflows/build-docker.yml/badge.svg)](https://github.com/C18H24O2/ft_transcendence/actions/workflows/build-docker.yml) [![Run tests](https://github.com/C18H24O2/ft_transcendence/actions/workflows/test.yml/badge.svg)](https://github.com/C18H24O2/ft_transcendence/actions/workflows/test.yml)

> Ping? Pong! Now with a side of `Uncaught TypeError: this.document is undefined`

This monorepo contains the code for `ft_transcendence`, the last project at 42 school. 

## Project structure

- `scripts/` *somewhat useful random stuff :+1:*
- `components/` *what makes this shit run*
  - `monitoring/`
    - The monitoring system, using Prometheus and Grafana, as well as custom exporters
  - `nginx/`
    - HTTP Server configuration and setup files
  - `services/`
    - The backend services, with custom-built micro-services
  - `website/`
    - HTML/JavaScript front-end & website service

## Chosen modules

The transcendance project is split into multiple Minor and Major modules; here's a list of what we have chosen:

<!-- MODULES_START -->

- **Web**
  - [x] (Major) Use a Framework as backend
  - [ ] (Minor) Use a front-end framework or toolkit
  - [x] (Minor) Use a database for the backend
  - [ ] (Major) Store the score of a tournament in a Blockchain

- **User Management**
  - [ ] (Major) Standard user management, authentication, users across tournaments
  - [x] (Major) Implementing remote authentication (OAuth2) + JWT

- **Gameplay and User Experience**
  - [ ] (Major) Remote players
  - [ ] (Major) Multiplayer (> 2 players)
  - [ ] (Major) Add another Game (w/ User History & Matchmaking)
  - [ ] (Minor) Game customization options 
  - [x] (Major) Live chat

- **AI / Algorithm**
  - [x] (Major) Introduce an AI opponent
  - [ ] (Minor) User and Game stats dashboard

- **Cybersecurity**
  - [ ] (Major) Implement WAF/ModSecurity w/ Hardened Configuration and HashiCorp Vault for Secrets Management
  - [ ] (Minor) GDPR Compliance options with User Anonymization, local data management, and account deletion
  - [x] (Major) Implement Two-Factor Authentication (2FA)

- **Devops**
  - [ ] (Major) Infrastructure setup for log management
  - [x] (Minor) Monitoring system
  - [x] (Major) Designing the Backend as Microservices

- **Graphics**
  - [x] (Major) Use of advanced 3D techniques

- **Accessibility**
  - [ ] (Minor) Support on all devices
  - [x] (Minor) Expanding Browser compatibility
  - [x] (Minor) Multiple language support
  - [ ] (Minor) Add accessibility for visually impaired users
  - [x] (Minor) Server-Side Rendering (SSR) integration

- **Server-Side Pong**
  - [ ] (Major) Replace basic pong with server-side pong and implementing an API
  - [ ] (Major) Enabling pong gameplay via CLI against web users with API integration

<!-- MODULES_END -->

## Usage

First off, you'll need to fill a `.env` file. You can use the `.env.example` file as a template, or if you're lazy, just:
```bash
./scripts/create_env_files.sh
```

To start everything, simply run:

```bash
# with modern compose
docker compose up --build -d

# or with legacy cli
docker-compose up --build -d
```

Alternatively, a GNU make `Makefile` is provided, with the `up` and `down` rules, for your convenience.

## License

This project is released under the [ISC License](./LICENSE).
