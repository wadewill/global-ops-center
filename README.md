# ListingScore MVP

ListingScore is a catalog pre-flight checker for cross-border sellers. This repository contains the first vertical slice: upload a CSV catalog, normalize common fields, run deterministic checks, review issues, and download a repair package.

## Architecture

- `web/`: Next.js + TypeScript upload and results UI
- `server/`: Java 20 / Spring Boot API, MySQL persistence model, Redis-ready configuration
- `docker-compose.yml`: local MySQL 8 and Redis 7 services

The MVP intentionally does not include store OAuth, automatic write-back, payment, or model-generated copy. Those are planned only after the catalog-diagnosis loop is validated.

## Run locally

1. Start dependencies: `docker compose up -d mysql redis`
2. Start the API: `cd server && /Applications/IntelliJ\ IDEA.app/Contents/plugins/maven-plugin/lib/maven3/bin/mvn spring-boot:run`
3. Start the UI: `cd web && npm install && npm run dev`
4. Open `http://localhost:3000`.

The API defaults to MySQL at `localhost:3306/listingscore`. Copy `.env.example` values into your local environment when needed. For a dependency-free API smoke run, use `cd server && /Applications/IntelliJ\ IDEA.app/Contents/plugins/maven-plugin/lib/maven3/bin/mvn -Dspring-boot.run.profiles=local spring-boot:run`; the `local` profile uses an in-memory H2 database and disables Redis. The production configuration remains MySQL-first.

## API

- `GET /actuator/health`
- `POST /api/v1/imports` (`multipart/form-data`, field name `file`; CSV in this vertical slice)
- `GET /api/v1/imports/{id}`
- `GET /api/v1/imports/{id}/export`

Example CSV columns: `sku,title,description,price,image_url,availability,brand,gtin,item_group_id,color,size`.
