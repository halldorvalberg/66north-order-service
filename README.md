# 66°North Order Service

A order management system using FastAPI, and a frontend example of a dashboard displaying aggregated order data.

**Author**: Halldór Valberg Aðalbjargarson  
**Date**: February 2025

## Overview

This project implements an internal service for accepting, and aggregating order data. The system consists of:

- **Backend API** - FastAPI REST service with PostgreSQL database
- **Frontend** - Next.js application with order form and admin dashboard

### Dashboard Preview

![Hero Metrics](docs/images/hero.png)
*Real-time revenue, order count, and average order value across multiple currencies*

![Revenue Trend](docs/images/graph.png)
*Daily revenue trend visualization with currency selector*

![Recent Orders](docs/images/orders.png)
*Order management table with filtering and status tracking*

## Quick Start

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **Docker & Docker Compose** (for PostgreSQL)
- **Make** (for simplified commands)

### 1. Clone the Repository

```bash
git clone https://github.com/halldorvalberg/66north-order-service
cd 66north-order-service
```

### 2. Backend Setup

```bash
cd backend

# Run automated setup (installs dependencies, database, migrations)
make setup

# Start the backend API
make dev
```

The API will be available at:

- API: [http://localhost:5000](http://localhost:5000)
- Docs: [http://localhost:5000/docs](http://localhost:5000/docs)

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_API_KEY to match backend API_KEY

# Start development server
npm run dev
```

The frontend will be available at:

- Order Form: [http://localhost:3000](http://localhost:3000)
- Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

For further details on backend and frontend setup, refer to their respective README files:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
