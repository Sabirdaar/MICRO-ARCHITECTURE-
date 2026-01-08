# Micro-Architecture E-commerce Platform

A modern, microservices-based e-commerce application built with Docker, Node.js, Python/FastAPI, and React.

## 🏗️ Architecture

The system consists of independent services orchestrated via Docker Compose.

```mermaid
graph TD
    Client(Frontend Client) --> Gateway
    Gateway[API Gateway :5000] -->|/api/users| UserService[User Service :4000]
    Gateway -->|/api/products| ProductService[Product Service :8000]
    Gateway -->|/api/orders| OrderService[Order Service :8085]
    UserService --> Firebase[(Firebase Auth & Firestore)]
    ProductService --> Postgres[(PostgreSQL :5432)]
    OrderService --> Postgres
```

### Services Overview

| Service | Technology | Port | Description |
|:---|:---|:---|:---|
| **Frontend** | React, Vite, TailwindCSS | `5173` | Modern UI with Firebase Client Auth. |
| **API Gateway** | Node.js, Express, TypeScript | `5000` | Unified entry point, routes requests to microservices. |
| **User Service** | Node.js, Express, Firebase Admin | `4000` | Manages user data, authentication verification, and profiles. |
| **Product Service** | Python, FastAPI, SQLAlchemy | `8000` | Manages product catalog, inventory, and search. |
| **Order Service** | Java, Spring Boot, JPA | `8085` | Manages orders and order items with cash payment. |
| **PostgreSQL** | PostgreSQL 18 | `5432` | Relational database for products and orders. |

---

## 🚀 Getting Started

### Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required)
-   Node.js & npm (Optional, for local dev)
-   Python 3.10+ (Optional, for local dev)

### 1. Installation

Clone the repository:
```bash
git clone <repository-url>
cd MICRO-ARCHITECTURE-
```

### 2. Configuration

Create a `.env` file in the root directory:

```ini
# .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=WMVaY187
POSTGRES_DB=products

PRODUCT_SERVICE_URL=http://product_service:8000
FRONTEND_URL=http://localhost:5173

# Firebase Service Account (JSON Content provided by Google Cloud)
FIREBASE_PROJECT_ID=multi-lang-e-commerce
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@multi-lang-e-commerce.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_SECRET=your-secret-key
```

And a `.env` file in `frontend/` directory:

```ini
# frontend/.env
VITE_API_GATEWAY_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GOOGLE_CLIENT_ID=...
```

### 3. Running the Application

Start all services using Docker Compose:

```bash
docker-compose up -d --build
```

-   **Frontend**: [http://localhost:5173](http://localhost:5173)
-   **API Gateway**: [http://localhost:5000](http://localhost:5000)
-   **User Service Health**: [http://localhost:4000/health](http://localhost:4000/health)
-   **Product Service Health**: [http://localhost:8000/health](http://localhost:8000/health)
-   **Order Service**: [http://localhost:8085/api/orders/](http://localhost:8085/api/orders/)

---

## 🔒 Authentication Flow

1.  **User Logs In** on Frontend using **Firebase Auth** (Email/Password or Google).
2.  Frontend receives a **Firebase ID Token**.
3.  Frontend sends this token to Backend (via API Gateway).
4.  **User Service** verifies the ID Token using **Firebase Admin SDK**.
5.  If valid, User Service creates/updates the user profile in **Firestore** and returns a session token.

---

## 🛠️ Development

### Local Development (Frontend)
```bash
cd frontend
npm install
npm run dev
```

### Local Development (Product Service)
```bash
cd product_service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🐞 Troubleshooting

-   **500 Internal Server Error on Register**: Check `user_service` logs. Ensure `FIREBASE_PRIVATE_KEY` in `.env` is correctly formatted with `\n` for newlines.
-   **Google Sign-In "Origin not allowed"**: specific `http://localhost:5173` in Google Cloud Console > APIs & Services > Credentials > Authorized JavaScript origins.
