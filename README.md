# MisterToy Backend

A simple Express.js backend for the MisterToy app, serving toy data from a JSON file.

## Features

- REST API for managing toys
- Query support for text search, labels, stock status, and price range
- Persistent toy storage in `data/toy.json`
- Basic request logging to `logs/backend.log`
- CORS enabled for local frontend development

## Requirements

- Node.js 18+ (or compatible)

## Setup

1. Open a terminal in the project root.
2. Install dependencies:

```bash
npm install
```

## Run

- Start in development mode with automatic reloads:

```bash
npm run dev
```

- Start normally:

```bash
npm start
```

The server listens on port `3030`.

## API

Base URL: `http://localhost:3030/api/toy`

### GET /api/toy

Fetch all toys. Supports query parameters:

- `txt` — search toy names (case-insensitive)
- `inStock` — filter by stock status (`1` or `0`)
- `labels` — filter by one or more labels
- `sortField` — field name for sorting (currently not applied in query logic)
- `sortDir` — sort direction (`1` or `-1`, currently not applied in query logic)

Example:

```bash
curl "http://localhost:3030/api/toy?txt=car&inStock=1"
```

### GET /api/toy/:id

Fetch a single toy by its `_id`.

### POST /api/toy

Create a new toy. Request body should contain toy fields such as:

- `name`
- `price`
- `labels`
- `inStock`

The backend generates `_id`, `createdAt`, and `imgUrl`.

### PUT /api/toy/:id

Update an existing toy by `_id`.

### DELETE /api/toy/:id

Remove a toy by `_id`.

## Project Structure

- `server.js` — main Express server and API routes
- `services/toy.service.js` — toy data access and persistence logic
- `services/util.service.js` — JSON file utilities and ID generator
- `services/logger.service.js` — log helper writing to `logs/backend.log`
- `data/toy.json` — toy data storage
- `data/toy-data-model.json` — sample toy data structure

## Notes

- The backend stores data in a local JSON file and is intended for development or demo use.
- `public` is configured as the static directory for serving frontend assets when deployed.
- The current query parser sets up sorting config, but sorting logic is not active in the toy service.
