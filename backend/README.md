# 66°North Order Service - Case Study Implementation

**Software Development Case Submission - Backend**  
**Author**: Halldór Valberg Aðalbjargarson  
**Date**: February 2025

---

## Executive Summary

This project implements a small internal service that accepts and aggregates order data via HTTP API. The service is built using Python and FastAPI, Alembic for database migrations, and PostgreSQL as the database.

## Quick Start

### Prerequisites

- Python 3.10 or higher
- Docker and Docker Compose (for PostgreSQL)

### Running the Service Locally

```bash
# 1. Clone the repository
git clone https://github.com/halldorvalberg/66north-order-service
cd 66north-order-service/backend

# 2. Run setup script to install dependencies, set up the database and config environment
make setup

# 3. Start the service
make dev
```

The API will be available at:

- **API Base**: [http://localhost:5000](http://localhost:5000)
- **Interactive Documentation**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Alternative Docs**: [http://localhost:5000/redoc](http://localhost:5000/redoc)

> If the port 5000 is already in use, change the port in the file 'backend/docker-compose.yml

### Running Tests

```bash
# Run all tests
make test

# Run with coverage report
pytest --cov=app --cov-report=html
```

---

## Technology Choices & Rationale

### Language: Python 3.10+

**Why Python:**

- Excellent for rapid prototyping and development
- Rapid development with excellent library ecosystem
- Strong typing support (type hints) for maintainability
- Widely used in data processing and integration scenarios
- Easy to read and maintain for team collaboration
- Simple syntax makes for human readable code

**Tradeoffs:**

- Not as performant as compiled languages (Go, Rust)
- But: Performance is sufficient for internal services, and development speed is prioritized

### Framework: FastAPI

**Why FastAPI:**

- **Known system** to me from previous projects - reduces ramp-up time for this task
- **Automatic API documentation** (Swagger/OpenAPI) - critical for internal tools
- **Type validation** built-in via Pydantic - prevents bad data at API boundary
- **Modern Python** features (async support, type hints)
- **Fast development** - minimal boilerplate code
- **Production-ready** - used by Microsoft, Netflix, Uber

**Tradeoffs:**

- Newer than Flask/Django (less mature ecosystem)
- But: Active development, excellent documentation, growing adoption

**Alternatives considered:**

- Flask: More mature, but requires more manual work for validation/docs
- Django: Too heavy for a microservice
- Node.js/Express: Would also

### Database: PostgreSQL 16

**Why PostgreSQL:**

- **Proven reliability** for transactional data
- **ACID compliance** - critical for order data
- **JSON support** - flexibility for future schema evolution
- **Strong aggregation** functions for reporting queries
- Industry standard for business applications

**Tradeoffs:**

- More complex setup than SQLite
- But: Necessary for production-like environment and multi-user scenarios

**Alternatives considered:**

- SQLite: Too simple for multi-user scenarios
- MySQL: Would work, but PostgreSQL has better standards compliance
- MongoDB: Not ideal for structured transactional data

### ORM: SQLAlchemy 2.0

**Why SQLAlchemy:**

- **Type-safe** database operations
- **Migration support** via Alembic
- **Prevents SQL injection** through parameterized queries
- **Flexible** - can use ORM or raw SQL when needed

### Database Migrations: Alembic

**Why Alembic:**

- **Version control** for database schema
- **Automatic migration generation** from model changes
- **Reversible** migrations for safe deployments
- Standard tool in Python ecosystem

---

## System Architecture

The system follows a typical layered architecture:

1. **API Layer**: FastAPI handles HTTP requests, routing, and validation.
2. **Service Layer**: Business logic for processing orders and aggregations.
3. **Data Layer**: SQLAlchemy models interact with PostgreSQL database.

### Project Structure

```text
backend/
├── app/                  # Main application package
│   ├── main.py           # API endpoints and routing
│   ├── models.py         # Database models (SQLAlchemy)
│   ├── schemas.py        # Request/response schemas (Pydantic)
│   ├── database.py       # Database connection & session
│   └── config.py         # Configuration management
│
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py            # Migration configuration
│
├── tests/                # Automated tests
│   ├── conftest.py       # Test fixtures
│   ├── test_orders.py    # API endpoint tests
│   └── test_models.py    # Database model tests
│
├── docker-compose.yml    # PostgreSQL container
├── pyproject.toml        # Dependencies & project config
├── README.md             # This file
├── .env.example          # Example environment variables
├── Makefile              # Common commands
└── pytest.ini            # Pytest configuration
```

### Data Model

```text
Order
├── id (int, PK)              # Internal database ID
├── order_id (str, UK)        # Business order identifier
├── customer_id (str)         # Customer reference
├── order_date (timestamp)    # When order was placed
├── total_amount (int)        # Amount in smallest currency unit
├── currency (str)            # ISO 4217 code (ISK, USD, etc.)
├── status (str)              # Order status (pending, completed, etc.)
├── created_at (timestamp)    # Record creation time
└── updated_at (timestamp)    # Last modification time
```

**Design rationale:**

- **Separate business ID** (`order_id`) from database ID for flexibility
- **Integer for money** to avoid floating-point precision issues
- **ISO currency codes** for international support
- **Automatic timestamps** for audit trail

---

## API Documentation

### Endpoint Overview

| Method | Endpoint             | Description                | Status         |
| ------ | -------------------- | -------------------------- | -------------- |
| GET    | `/`                  | Health check               |    Implemented |
| POST   | `/orders/`           | Create new order           |    Implemented |
| GET    | `/orders/summary`    | Get aggregated data        |    Implemented |
| GET    | `/orders/`           | List orders (with filters) |    Implemented |
| GET    | `/orders/{order_id}` | Get specific order         |    Implemented |
| PATCH  | `/orders/{order_id}` | Update order               |    Implemented |
| DELETE | `/orders/{order_id}` | Delete order               |    Implemented |

### Required Endpoints

#### POST /orders

**Request:**

```json
{
  "order_id": "ORD-2025-001",
  "customer_id": "CUST-123",
  "order_date": "2025-02-03T14:30:00Z",
  "total_amount": 25990,
  "currency": "ISK",
  "status": "pending"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "order_id": "ORD-2025-001",
  "customer_id": "CUST-123",
  "order_date": "2025-02-03T14:30:00Z",
  "total_amount": 25990,
  "currency": "ISK",
  "status": "pending",
  "created_at": "2025-02-03T14:30:05.123Z",
  "updated_at": "2025-02-03T14:30:05.123Z"
}
```

#### GET /orders/summary

**Response (200 OK):**

```json
{
  "total_orders": 2,
  "total_revenue": [
    {
      "currency": "ISK",
      "total": 219970
    }
  ],
  "revenue_per_day": [
    {
      "date": "2025-01-16",
      "currency": "ISK",
      "revenue": 129980
    },
    {
      "date": "2025-01-15",
      "currency": "ISK",
      "revenue": 89990
    }
  ]
}
```

**Business value:**

- Total orders for capacity planning
- Revenue tracking for financial reporting
- Daily breakdown for trend analysis
- Identify peak order days for staffing

### Testing the API

Interactive documentation is available at [http://localhost:5000/docs](http://localhost:5000/docs) where you can:

- View all endpoints
- See request/response schemas
- Test API calls directly in browser

**Example with curl:**

```bash
# Create an order
curl -X POST "http://localhost:5000/orders/" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-2025-001",
    "customer_id": "CUST-123",
    "total_amount": 25990,
    "currency": "ISK"
  }'

# Get summary
curl "http://localhost:5000/orders/summary"
```

---

## Design Decisions

### 1. Separation of Concerns

**Decision:** Clear separation between API layer (main.py), data models (models.py), and validation schemas (schemas.py).

**Rationale:**

- Makes code easier to test (can test models independently)
- Allows API contract changes without changing database
- Follows clean architecture principles

**Further development:**

- When more models/services are added, we would create separate directories/modules for each domain area f.x. `orders/`, `customers/`, etc.

### 2. Business ID vs Database ID

**Decision:** Use both `id` (auto-increment) and `order_id` (business identifier).

**Rationale:**

- `id`: Fast database operations and foreign key relationships
- `order_id`: Human-readable, can have business meaning (ORD-2025-001)
- Allows order IDs to come from external systems (ERP)

### 3. Money Representation

**Decision:** Store amounts as integers (smallest currency unit).

**Rationale:**

- Avoids floating-point precision errors (critical for financial data)
- Common pattern: amount in "aurar" for ISK, "cents" for USD
- Example: 259.90 ISK stored as 25990

### 4. Timestamps

**Decision:** Separate `order_date`, `created_at`, and `updated_at`.

**Rationale:**

- `order_date`: Business fact (when customer placed order)
- `created_at`: System fact (when record was created)
- `updated_at`: Audit trail (when record last changed)
- Allows orders to be imported with historical dates

### 5. Status Field

**Decision:** In the data model we use a simple string field for `status`, but validate against known values in the service layer.

**Rationale:**

- Flexible for MVP (can add any status value)
- For production: Would use ENUM or foreign key to status table

### 6. Validation Layer

**Decision:** Use Pydantic schemas for API validation.

**Rationale:**

- Automatic validation before data reaches business logic
- Clear error messages for invalid input
- Type safety throughout the request/response cycle

---

## Testing Strategy

### Test Coverage

I implemented **20+ automated tests** covering:

- ✅ API endpoint functionality
- ✅ Database model behavior
- ✅ Data validation
- ✅ Error handling

**Test categories:**

1. **API Tests** (`test_orders.py`)
   - Create orders (success, duplicates, validation)
   - List orders (pagination, filtering)
   - Update orders (partial updates)
   - Delete orders
   - Summary endpoint

2. **Model Tests** (`test_models.py`)
   - Database constraints
   - Default values
   - Timestamp generation

3. **Summary Tests**
   - Aggregation correctness
   - Edge cases (no orders, single order)

4. **Error handling tests**
   - All defined error scenarios in main.py tested

### Testing Approach

**In-memory database:** Tests use SQLite in-memory for speed and isolation.

**Fixtures:** Pytest fixtures provide:

- Fresh database for each test
- Test client with overridden dependencies
- Sample data generation

---

## Production Considerations

### What Would Change for Production

#### 1. Authentication & Authorization

**Current:** No authentication (internal service assumption)

**Production:**

- API key authentication for service-to-service communication
- OAuth2/JWT for user-specific operations
- Role-based access control (admin, read-only, etc.)

#### 2. Error Handling & Logging

**Current:** Basic exception handling

**Production:**

- Structured logging (JSON format)
- Error tracking (Sentry, Rollbar)
- Request ID tracking for debugging
- Detailed error responses with correlation IDs

#### 3. Performance & Scalability

**Current:** Single instance, synchronous operations

**Production:**

- Database connection pooling (already present via SQLAlchemy)
- Caching layer (Redis) for summary endpoint
- Async operations for I/O-bound tasks
- Database read replicas for reporting queries

#### 4. Monitoring & Observability

**Production additions:**

- Health check endpoint with database connectivity
- Prometheus metrics (request count, latency, errors)
- Distributed tracing (OpenTelemetry)
- Alerting on error rates, latency spikes

#### 5. Deployment

**Current:** Manual local execution

**Production:**

- Containerized deployment (Docker)
- Kubernetes for orchestration
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Blue-green deployments for zero downtime
- Automated database migrations in deployment

#### 6. Configuration Management

**Current:** `.env` file

**Production:**

- Environment-specific configs (dev, staging, prod)
- Secrets management
- Configuration validation on startup

#### 7. Data Backup & Recovery

**Production requirements:**

- Automated database backups (daily)
- Point-in-time recovery capability
- Backup verification testing
- Disaster recovery plan
