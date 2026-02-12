# PrimeTradeAI - Project 

## Overview
PrimeTradeAI is a trading center application built with the PERN stack (PostgreSQL, Express, React, Node.js). It features user authentication, role-based access control (RBAC), and a dashboard to view trading items (Gold, Silver, Crypto, Oil) with historical data.

### 👤 User Login
<img src="./screenshots/login.png" width="600"/>

### 📈 Item View
<img src="./screenshots/userview.png" width="600"/>


## Features Implemented
- **Backend API**:
  - User Registration & Login (JWT Auth)
  - Role-Based Access Control (Admin/User)
  - CRUD operations for Trading Items
  - Historical Price Data (Seeded from Jan 2026)
  - Swagger API Documentation
- **Frontend UI**:
  - Responsive Design (Dark Mode)
  - Login & Registration Pages
  - Dashboard with Item List and History View
  - Admin Panel for adding items (visible only to Admins)
- **Database**:
  - PostgreSQL schema with Users, TradingItems, and HistoricalPrices tables.

## API Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and retrieve JWT | No |

### Trading Data
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trading` | Get all trading items | Yes |
| `GET` | `/api/trading/:id/history` | Get historical prices for an item | Yes |
| `POST` | `/api/trading` | Add a new trading item | Yes (Admin) |
| `PUT` | `/api/trading/:id` | Update a trading item | Yes (Admin) |
| `DELETE` | `/api/trading/:id` | Delete a trading item | Yes (Admin) |
### Postman Collection
https://adamgoya0810-7332878.postman.co/workspace/Gowtham-S's-Workspace~83fdb84c-d539-4360-8664-8045dc4427e7/collection/48228800-46f55503-f7dd-4591-a3ff-42e718214db8?action=share&creator=48228800

## Database Schema

### `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `uuid_generate_v4()` | Unique user identifier |
| `username` | VARCHAR(255) | Unique, Not Null | User's login name |
| `password_hash` | VARCHAR(255) | Not Null | Hashed password |
| `role` | VARCHAR(50) | Default: 'user', Check: 'admin'/'user' | RBAC role |
| `created_at` | TIMESTAMP | Default: `CURRENT_TIMESTAMP` | Account creation time |

### `trading_items` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `uuid_generate_v4()` | Unique item identifier |
| `name` | VARCHAR(255) | Unique, Not Null | Name of the asset (e.g., Gold) |
| `symbol` | VARCHAR(50) | Unique, Not Null | Ticker symbol (e.g., XAU) |
| `current_price` | DECIMAL(15, 2) | Not Null | Current market price |
| `updated_at` | TIMESTAMP | Default: `CURRENT_TIMESTAMP` | Last price update time |

### `historical_prices` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `uuid_generate_v4()` | Unique record identifier |
| `item_id` | UUID | FK -> `trading_items(id)` | Reference to trading item |
| `price` | DECIMAL(15, 2) | Not Null | Historical price value |
| `recorded_at` | TIMESTAMP | Not Null | Date/Time of the price record |

### Schema SQL
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trading_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  symbol VARCHAR(50) UNIQUE NOT NULL,
  current_price DECIMAL(15, 2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historical_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES trading_items(id) ON DELETE CASCADE,
  price DECIMAL(15, 2) NOT NULL,
  recorded_at TIMESTAMP NOT NULL
);
```

## Setup & Running

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database

### 1. Database Setup
Ensure your PostgreSQL database is running. The application uses the following connection string by default:
`DATABASE_URL="postgresql://postgres:password@localhost:5432/database_name?schema=public"`

To seed the database with initial users and data:
```bash
cd server
npm install
node seed.js
```
*Creates default users: `admin` (password123) and `user` (password123).*

### 2. Start Backend
```bash
cd server
node index.js
```
Server runs on `http://localhost:5000`.
API Documentation available at `http://localhost:5000/api-docs`.

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Version Control
To scale this application:
- **Microservices**: Split Auth and Trading services.
- **Caching**: implement Redis to cache `GET /api/trading` responses as prices don't change every second in this demo.
- **Load Balancing**: Deploy multiple backend instances behind Nginx.
- **Containerization**: Dockerize the application for consistent deployment.
