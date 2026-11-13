# ListingScore MVP

ListingScore is a catalog pre-flight checker for cross-border sellers. It provides a private workspace for uploading a CSV catalog, finding deterministic data-quality issues, reviewing saved reports, and preparing API source connections.

The public homepage at `/` introduces the product's value, illustrative before/after scenarios, and an interactive value calculator. Its English version is at `/en/product`. The Simplified Chinese workspace is at `/zh`, with tasks at `/zh/tasks`; the English workspace is at `/en`, with tasks at `/en/tasks`. The older `/zh/product` route uses the Chinese public homepage. Language links preserve the current workspace tab, login/register mode and supported post-login destination. Return destinations are limited to known workspace routes.

Marketing examples are explicitly hypothetical, not customer results or performance guarantees. The calculator holds traffic constant and separates incremental sales, gross profit, and the amount remaining after a user-defined tool budget (not a product price). Payments, native platform synchronization, and automatic sales attribution are not available yet.

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
- `GET /api/v1/tasks?status=OPEN` — list the current user's remediation worklist
- `PATCH /api/v1/tasks/{id}` — move a task to `OPEN`, `IN_PROGRESS`, or `DONE`

Connection credentials are encrypted using AES-GCM before persistence and are intentionally never returned by the API. Production requires `LISTINGSCORE_JWT_SECRET` and `LISTINGSCORE_CREDENTIAL_KEY`; the Compose deployment reads both only from `deploy/.env`.

Each diagnosis automatically turns its findings into private remediation tasks, so that a quality report becomes an operational worklist rather than a static CSV export.

Example CSV columns: `sku,title,description,price,image_url,availability,brand,gtin,item_group_id,color,size`.

## Language and API errors

The page route selects the UI language. Every frontend API request, including CSV template and repair-package downloads, sends `Accept-Language: zh-CN` or `Accept-Language: en`. The API accepts Chinese (`zh`, `zh-*`) and English (`en`, `en-*`) language ranges; missing, malformed or unsupported preferences default to English. Responses include `Content-Language: zh-CN` or `Content-Language: en` and `Vary: Accept-Language`.

Errors use Problem Details with localized `title` and `detail`, plus a stable `code` such as `INVALID_CREDENTIALS`, `VALIDATION_FAILED` or `AUTHENTICATION_REQUIRED`. Clients should branch on `code` or HTTP status, not translated text. Validation errors also include a `fields` array with `field`, `code` and localized `message` entries; throttled requests retain `Retry-After`. The frontend has its own translated fallbacks for older APIs, proxy failures and network errors.

For example, this unauthenticated request returns HTTP 401 with a Chinese message and the unchanged `AUTHENTICATION_REQUIRED` code:

```bash
curl -i -H 'Accept-Language: zh-CN' http://localhost:8080/api/v1/tasks
```

Diagnostic findings, repair suggestions and task descriptions are localized when returned, including previously saved reports. Stored rule output is unchanged, so switching languages does not alter another request's results. Rule IDs, SKU values, field codes, status enums and CSV column headers stay stable; user-provided names and content are not translated.

## Frontend checks

After installing `web/` dependencies, run the TypeScript checks and Node test suites from that directory. The tests cover workspace/locale navigation, safe login return paths, API language/error handling and calculator validation. Test compilation goes into a temporary directory outside the repository; no additional test runner is needed.

```bash
cd web
npx tsc --noEmit --incremental false
frontend_test_dir=$(mktemp -d)
npx tsc --target ES2022 --module commonjs --moduleResolution node --esModuleInterop --strict --skipLibCheck --outDir "$frontend_test_dir" \
  app/zh/workspace-navigation.test.ts lib/localized-api.test.ts lib/locale-routes.test.ts components/marketing/value-model.test.ts
node --test "$frontend_test_dir/app/zh/workspace-navigation.test.js" \
  "$frontend_test_dir/lib/localized-api.test.js" "$frontend_test_dir/lib/locale-routes.test.js" \
  "$frontend_test_dir/components/marketing/value-model.test.js"
```

## Test-server deployment

The production-style test stack is in `deploy/docker-compose.prod.yml`. On an Ubuntu host with Docker Compose installed, create `deploy/.env` from `deploy/.env.example`, set unique database passwords, and run:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build
```

Only port 80 is published. MySQL and Redis remain private to the Docker network. For public use, place the service behind a domain and TLS reverse proxy; HTTP-only is suitable only for this test environment.
