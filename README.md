# Backend Coding Challenge

## Problem Statement

Construct a micro-service that, when given an link to a pdf document:

1. stores the document in local storage and
2. generates a thumbnail for the document

## Technologies to use

- Typescript
- Node

## Requirements

### Mandatory

- Expose an endpoint where an API consumer can POST a PDF. (OK)
    - The PDF should be specified as a URL in the message body, not a file upload (OK)
    - The endpoint should respond immediately after receiving the link, without waiting for the PDF to be processed (OK)
- Expose an endpoint which returns a list of PDFs and their associated thumbnails (both as URLs). (OK)

### Optional stretch goals

_These are optional, do as many as you can/want_

- Detect duplicates (OK)
- Push a webhook to notify the API client of the successful processing. (OK)

## Submission details

Please upgrade this README to indicate which requirements were implemented.

## Evaluation criteria

You should see this challenge as a way to showcase your software engineering skills in a professional environment.

## Solution

### Advanced Aspects

- File Storage Abstraction: The implementation allows easy switching between storage systems (local, S3, etc.)
- Metadata Storage Abstraction: The architecture allows transitioning from in-memory storage to databases (Redis, PostgreSQL, MongoDB)
- Robust Queue: Using Bull with Redis to manage asynchronous tasks
- Horizontal Scaling: Architecture supporting worker scaling

## API Documentation

### Submit a PDF for processing

```
POST /api/pdfs
```

Request body:
```json
{
  "url": "https://example.com/sample.pdf",
  "webhookUrl": "https://your-webhook-endpoint.com/notify"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sourceUrl": "https://example.com/sample.pdf",
  "pdfUrl": "http://localhost:3000/pdfs/abc123.pdf",
  "thumbnailUrl": null,
  "status": "pending",
  "createdAt": "2025-03-19T12:34:56.789Z",
  "updatedAt": "2025-03-19T12:34:56.789Z",
  "message": "PDF submission accepted for processing"
}
```

### Get list of PDFs

```
GET /api/pdfs
```

Optional parameters:
- `limit`: Maximum number of PDFs to return (default: 100)
- `offset`: Offset for pagination (default: 0)

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sourceUrl": "https://example.com/sample.pdf",
    "pdfUrl": "http://localhost:3000/pdfs/abc123.pdf",
    "thumbnailUrl": "http://localhost:3000/thumbnails/abc123.png",
    "status": "processed",
    "createdAt": "2025-03-19T12:34:56.789Z",
    "updatedAt": "2025-03-19T12:35:10.123Z"
  }
]
```

## Running the Service

### Using npm

```bash
# Install dependencies
npm install

# Compile
npm run build

# Start the API server
npm start

# Start the worker
npm run start:worker
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Architecture

### Abstractions (For Scalability)

The microservice uses two main abstractions:

1. FileStorage: Interface for file storage
    - `LocalFileStorage`: Local implementation (default)
    - `S3FileStorage`: Stub for AWS S3 implementation

2. MetadataStorage: Interface for metadata storage
    - `InMemoryMetadataStorage`: In-memory implementation
    - `RedisMetadataStorage`: Redis implementation (default)
    - `DbMetadataStorage`: Stub for database implementation

### Asynchronous Processing

Processing is performed asynchronously:
1. The API accepts the PDF URL and responds immediately
2. A task is added to the Bull/Redis queue
3. One or more workers process tasks in the background
4. The client can be notified via webhook when processing is complete