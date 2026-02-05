# 66 North Order Service - Frontend

Customer order form and admin dashboard for multi-currency order management.

## Features

- **Order Form** ([/](http://localhost:3000)) - Public order creation with 66°North product catalog
- **Admin Dashboard** ([/admin](http://localhost:3000/admin)) - Revenue tracking and order management

## Tech Stack

- Next.js 14+ with TypeScript
- Chakra UI v3

## Setup

Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your backend API details:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=your_api_key_here
```

## Development

```bash
npm install
npm run dev
```

Visit:
- [http://localhost:3000](http://localhost:3000) - Order form
- [http://localhost:3000/admin](http://localhost:3000/admin) - Admin dashboard

## Project Structure

```
app/
├── page.tsx            # Order form (/)
├── layout.tsx          # Root layout
└── admin/
    ├── page.tsx        # Admin dashboard
    ├── components/     # Dashboard UI
    ├── services/       # API & business logic
    └── types/          # TypeScript types
```
