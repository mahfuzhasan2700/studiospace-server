# StudioSpace — Backend API Service

[![Node.js](https://img.shields.io/badge/Node.js-v24.20.0-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-black?logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Driver_v6-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![BetterAuth](https://img.shields.io/badge/BetterAuth-MongoDB_Adapter-purple)](https://better-auth.com/)

> Production-grade REST API backend for **StudioSpace — Peer-to-Peer Creative Workspace & Production Studio Sharing Platform**, built strictly with **Node.js, Express, TypeScript, and MongoDB Atlas (No SQLite)**.

---

## 🌐 Live URLs & Deployment
- **Backend API**: [https://studiospace-server-theta.vercel.app](https://studiospace-server-theta.vercel.app)
- **Client Frontend**: [https://studiospace-client-eight.vercel.app](https://studiospace-client-eight.vercel.app)
- **GitHub Server**: [https://github.com/mahfuzhasan2700/studiospace-server](https://github.com/mahfuzhasan2700/studiospace-server)
- **GitHub Client**: [https://github.com/mahfuzhasan2700/studiospace-client](https://github.com/mahfuzhasan2700/studiospace-client)


---

## 🏛️ Architecture Overview

The backend is built around clean layered architecture:
- **Routes Layer**: Pure endpoint declaration, input parsing, middleware binding.
- **Controllers Layer**: Request unwrapping, HTTP status mapping, error passing to central handler.
- **Services Layer**: Core business logic, booking cost calculation, concurrency verification.
- **Repositories Layer**: Pure MongoDB query abstraction, atomic operations, filter builders.
- **Auth Layer**: BetterAuth integration + JWT session issuance in secure HTTPOnly cookies.

---

## 🔐 Authentication & Challenge 1 Specification

BetterAuth manages user accounts and sessions stored in MongoDB Atlas collections (`user`, `session`, `account`).

To fulfill **Challenge 1 (JWT in HTTPOnly Cookie)**:
1. When a client authenticates via BetterAuth, the client exchanges the active session with `POST /api/session/token`.
2. The server signs a JSON Web Token (`jose` library, HS256, 7-day expiration) containing the user's `userId`, `email`, and `name`.
3. The server sets a secure, HTTPOnly cookie named `token`:
   ```http
   Set-Cookie: token=<jwt_token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
   ```
4. All protected endpoints run `requireAuth` middleware, which verifies the cookie directly before granting access.

---

## ⚡ Challenge 2: Concurrency & Double-Booking Prevention

To eliminate race conditions and double bookings, interval overlap is strictly evaluated against all `Confirmed` bookings on MongoDB:

$$\text{Overlapping Booking} \iff (\text{Existing Start} < \text{Requested End}) \land (\text{Existing End} > \text{Requested Start})$$

### MongoDB Query Filter:
```typescript
const filter = {
  studioId: new ObjectId(requestedStudioId),
  status: 'Confirmed',
  startDateTime: { $lt: requestedEndDateTime },
  endDateTime: { $gt: requestedStartDateTime }
};
```

If an overlap is detected:
- The server rejects the request with **HTTP 409 Conflict**.
- Returns the exact error payload:
  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT",
      "message": "This time slot has already been booked. Please select another time."
    }
  }
  ```

---

## 📡 REST API Endpoint Catalog

### System & Health Probes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Liveness probe returning status and server timestamp |
| `GET` | `/api/ready` | Public | Readiness probe executing a ping against MongoDB Atlas |
| `GET` | `/api/health/diagnostics` | Public | Detailed telemetry: DB ping latency, collections count, memory |

### Authentication & Sessions (BetterAuth + Challenge 1)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/sign-up/email` | Public | Register new host or creator (enforces uppercase, lowercase, min 6 chars) |
| `POST` | `/api/auth/sign-in/email` | Public | Authenticate user with email and password |
| `POST` | `/api/session/token` | Session | Issue signed JWT and set secure HTTPOnly `token` cookie |
| `POST` | `/api/session/logout` | Session | Clears HTTPOnly token and terminates session |
| `GET` | `/api/session/me` | Protected | Returns authenticated user payload |

### Studio Discovery & Management
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/studios` | Public | Filterable list: `category`, `search`, `city`, `sort`, `page`, `limit` |
| `GET` | `/api/studios/featured` | Public | Top-rated studios (strictly limits 6 items from MongoDB) |
| `GET` | `/api/studios/:id` | Public | Complete studio specifications, amenities, and host profile |
| `POST` | `/api/studios` | Protected | Create studio listing (auto-assigns host identity) |
| `GET` | `/api/studios/my/listings` | Protected | Fetch studios listed by authenticated host |
| `PATCH` | `/api/studios/:id` | Protected | Update studio details (enforces ownership check) |
| `DELETE` | `/api/studios/:id` | Protected | Delete studio listing from MongoDB |

### Booking System & Concurrency
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Protected | Request studio booking (runs atomic Challenge 2 concurrency check) |
| `GET` | `/api/bookings/my` | Protected | List all bookings reserved by creator |
| `GET` | `/api/bookings/host` | Protected | List all incoming booking requests received by host |
| `PATCH` | `/api/bookings/:id/confirm` | Protected | Host accepts and confirms reservation (re-runs concurrency check) |
| `PATCH` | `/api/bookings/:id/cancel` | Protected | Creator or host cancels reservation and releases time slot |
| `PATCH` | `/api/bookings/:id/complete` | Protected | Mark completed studio session |

---

## 🔑 Pre-Seeded Test Credentials

| Account Role | Email | Password |
| :--- | :--- | :--- |
| **Studio Host** | `host@studiospace.io` | `Host1234!` |
| **Creator / Director** | `creator@studiospace.io` | `Creator1234!` |

---

## 🛠️ Local Setup & Execution

### 1. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=studiospace_db
JWT_SECRET=studiospace_super_secure_jwt_secret_batch14_category_harry_2026
BETTER_AUTH_SECRET=studiospace_better_auth_secret_key_batch14_category_harry_2026
BETTER_AUTH_URL=http://localhost:5000
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Seed Studio Inventory & Test Accounts
```bash
# Seed 8 realistic studios across 5 categories
npm run seed

# Seed host and creator examiner test accounts
npm run seed:users
```

### 4. Build and Start Server
```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or run development mode with auto-reload
npm run dev
```
API will listen at `http://localhost:5000`.
