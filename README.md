# [ft_trans](https://cdn.intra.42.fr/pdf/pdf/133398/en.subject.pdf)

> Ping? Pong! Now with a side of `Uncaught TypeError: this.document is undefined`

This monorepo contains the code for `ft_transcendence`, the last project at 42 school. 

## Project structure

- `scripts/` *somewhat useful random stuff :+1:*
- `components/` *what makes this shit run*
  - `services/`
    - The backend services, organized in a micro-services architecture 
  - `website/`
    - HTML/JavaScript front-end, to be served by the API
  - `nginx/`
    - HTTP Server configuration and setup files

## Chosen modules

The transcendance project is split into multiple Minor and Major modules. Here are the one we're doing:

<!-- MODULES_START -->

- **Web**
  - [x] (Major) ✅ Use a Framework as backend
  - [ ] (Minor) Use a front-end framework or toolkit
  - [x] (Minor) ✅ Use a database for the backend
  - [ ] (Major) Store the score of a tournament in a Blockchain

- **User Management**
  - [x] (Major) Standard user management, authentication, users across tournaments
  - [x] (Major) Implementing remote authentication (OAuth2)

- **Gameplay and User Experience**
  - [x] (Major) Remote players `lvincent`
  - [ ] (Major) Multiplayer (> 2 players)
  - [\_] (Major) Add another Game (w/ User History & Matchmaking) `lvincent`
  - [ ] (Minor) Game customization options 
  - [x] (Major) Live chat `gpouzet`

- **AI / Algorithm**
  - [ ] (Major) Introduce an AI opponent
  - [ ] (Minor) User and Game stats dashboard

- **Cybersecurity**
  - [x] (Major) ✅ Implement WAF/ModSecurity w/ Hardened Configuration and HashiCorp Vault for Secrets Management `kiroussa`
  - [ ] (Minor) GDPR Compliance options with User Anonymization, local data management, and account deletion
  - [x] (Major) Implement Two-Factor Authentication (2FA) and JWT

- **Devops**
  - [\_] (Major) Infrastructure setup for log management
  - [x] (Minor) Monitoring system `kiroussa`
  - [x] (Major) ✅ Designing the Backend as Microservices `kiroussa` 

- **Graphics**
  - [x] (Major) Use of advanced 3D techniques. `lvincent`

- **Accessibility**
  - [\_] (Minor) Support on all devices
  - [x] (Minor) ✅ Expanding Browser compatibility
  - [x] (Minor) Multiple language support
  - [\_] (Minor) Add accessibility for visually impaired users
  - [x] (Minor) ✅ Server-Side Rendering (SSR) integration

- **Server-Side Pong**
  - [x] (Major) Replace basic pong with server-side pong and implementing an API
  - [ ] (Major) Enabling pong gameplay via CLI against web users with API integration

<!-- MODULES_END -->

## Usage

To start everything, simply run:

```bash
# with modern compose
docker compose up --build -d

# or with legacy cli
# docker-compose up --build -d
```

Alternatively, a GNU make `Makefile` is provided, with the `up` and `down` rules.

## License

This project is released under the [ISC License](./LICENSE).
