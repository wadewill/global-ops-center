# ListingScore MVP

ListingScore is a catalog pre-flight checker for cross-border sellers. It provides a private workspace for uploading a CSV catalog, finding deterministic data-quality issues, reviewing saved reports, and preparing API source connections.

The default interface is English; the fully functional Simplified Chinese workspace is available at `/zh`.

## Architecture

- `web/`: Next.js + TypeScript workspace, authentication, diagnostics and connection UI
- `server/`: Java 20 / Spring Boot API, JWT authentication, MySQL persistence and Redis-ready configuration
- `docker-compose.yml`: local MySQL 8 and Redis 7 services

CSV diagnosis is available today. Shopify/custom REST connection records can be saved today; channel-specific OAuth, marketplace data pulls and write-back remain planned work.

## Run locally

1. Start dependencies: `docker compose up -d mysql redis`
2. Start the API: `cd server && /Applications/IntelliJ\ IDEA.app/Contents/plugins/maven-plugin/lib/maven3/bin/mvn spring-boot:run`
3. Start the UI: `cd web && npm install && npm run dev`
4. Open `http://localhost:3000`.

The API defaults to MySQL at `localhost:3306/listingscore`. Copy `.env.example` values into your local environment when needed. For a dependency-free API smoke run, use `cd server && /Applications/IntelliJ\ IDEA.app/Contents/plugins/maven-plugin/lib/maven3/bin/mvn -Dspring-boot.run.profiles=local spring-boot:run`; the `local` profile uses an in-memory H2 database and disables Redis. The production configuration remains MySQL-first.

## API and authentication

All endpoints other than health, the public CSV template, and `/api/v1/auth/**` require `Authorization: Bearer <accessToken>`. Access tokens expire after 12 hours by default. Imports and API connections are isolated by authenticated user.

Registration is protected with Redis-backed rate limits: 5 registrations per IP per hour and 3 per email per hour. Login attempts are similarly constrained. In the local test profile the same policy uses an in-memory fallback.

- `POST /api/v1/auth/register` — create an account and return an access token
- `POST /api/v1/auth/login` — return an access token
- `GET /api/v1/auth/me` — current account
- `GET /actuator/health`
- `POST /api/v1/imports` (`multipart/form-data`, field name `file`; CSV in this vertical slice)
- `GET /api/v1/imports` — current user's recent reports
- `GET /api/v1/imports/template` — downloadable starter CSV template
- `GET /api/v1/imports/{id}`
- `GET /api/v1/imports/{id}/export`
- `GET /api/v1/connections/platforms` — available and planned platforms
- `GET` / `POST /api/v1/connections` — list/create an API source connection
- `POST /api/v1/connections/{id}/verify` — record a configuration review
- `DELETE /api/v1/connections/{id}`

Connection credentials are encrypted using AES-GCM before persistence and are intentionally never returned by the API. Production requires `LISTINGSCORE_JWT_SECRET` and `LISTINGSCORE_CREDENTIAL_KEY`; the Compose deployment reads both only from `deploy/.env`.

Example CSV columns: `sku,title,description,price,image_url,availability,brand,gtin,item_group_id,color,size`.

## Test-server deployment

The production-style test stack is in `deploy/docker-compose.prod.yml`. On an Ubuntu host with Docker Compose installed, create `deploy/.env` from `deploy/.env.example`, set unique database passwords, and run:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build
```

Only port 80 is published. MySQL and Redis remain private to the Docker network. For public use, place the service behind a domain and TLS reverse proxy; HTTP-only is suitable only for this test environment.
