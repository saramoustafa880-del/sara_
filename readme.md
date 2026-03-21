# 🚀 Sara Go — Global Travel Ecosystem (Pi Network Edition)

> **Tier-1 Multi-Platform Travel SaaS for the Pi Network Mainnet**  
> Unicorn-Grade · Zero Vulnerabilities · AI-Driven · Luxury Design

---

## 📐 Architecture Overview

```
sara-go/
├── 🌐 frontend/          # Next.js 14+ (App Router) — TypeScript
├── ⚙️  backend/           # NestJS Enterprise API (DDD)
├── 📱 mobile/            # React Native (Expo)
├── 🐳 docker-compose.yml # Full-stack orchestration
└── 📄 README.md
```

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript 5, Tailwind CSS, Framer Motion |
| **Mobile** | React Native (Expo), Shared Business Logic |
| **Backend** | NestJS (DDD), Passport JWT, Swagger |
| **Auth** | Pi Network SDK SSO + RS256 JWT Rotation |
| **Payment** | Pi In-App Payment SDK + Server-Side Blockchain Verification |
| **DB (SQL)** | PostgreSQL via Prisma ORM |
| **DB (NoSQL)** | MongoDB (Travel Catalogs, Preferences) |
| **Cache** | Redis (Sessions, API Caching) |
| **AI** | OpenAI GPT-4o + LangChain |
| **State** | Zustand (Frontend) |
| **Security** | Helmet, CORS, Rate Limiting, Zod Validation |

---

## 🔑 Pi Network Integration

### 1. SDK Initialization (Testnet)
```typescript
// lib/pi-sdk.ts
window.Pi.init({ version: "2.0", sandbox: true })
```

### 2. Authentication Flow
```typescript
// hooks/usePiAuth.ts
const authResult = await window.Pi.authenticate(
  ['username', 'payments', 'wallet_address'],
  handleIncompletePayment
)
// Exchange Pi token → Sara Go JWT
await authAPI.loginWithPi(authResult.accessToken)
```

### 3. Payment Flow (Full Lifecycle)
```typescript
// hooks/usePiPayment.ts
window.Pi.createPayment({
  amount: 1,
  memo: "Sara Go: Maldives Package",
  metadata: { booking_id, package_id }
}, {
  onReadyForServerApproval: async (paymentId) => {
    // POST /api/v1/payments/approve → Pi Blockchain API
    await approvePaymentOnServer(paymentId, accessToken)
  },
  onReadyForServerCompletion: async (paymentId, txid) => {
    // POST /api/v1/payments/complete → Blockchain verification
    await completePaymentOnServer(paymentId, txid, accessToken)
  },
  onCancel: (paymentId) => { ... },
  onError: (error, payment) => { ... }
})
```

### 4. Server-Side Pi API Verification
```typescript
// backend/src/auth/pi-auth.service.ts
const piUser = await this.piApiClient.get('/v2/me', {
  headers: { Authorization: `Bearer ${piAccessToken}` }
})
await this.piApiClient.post(`/v2/payments/${paymentId}/approve`)
await this.piApiClient.post(`/v2/payments/${paymentId}/complete`, { txid })
```

---

## 🗄️ Database Schema

### PostgreSQL (Prisma)
- **User**: pi_id, username, pi_wallet_address, tier, preferences
- **Booking**: booking_id, itinerary, status, total_price_pi
- **Transaction**: pi_payment_id, payment_status, blockchain_hash

### MongoDB
- **Destination**: name, images, price_pi, ai_summary, trending_score
- **TravelPackage**: type, inclusions, departure_options, ai_score

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Pi Developer Account (https://developer.minepi.com)
- OpenAI API Key

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/sara-go.git
cd sara-go

# Backend
cp backend/.env.example backend/.env
# Fill in: PI_API_KEY, JWT_SECRET, OPENAI_API_KEY, DATABASE_URL

# Frontend  
cp frontend/.env.example frontend/.env.local
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### 3. Run Development (Manual)

```bash
# Terminal 1: Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Mobile (optional)
cd mobile
npm install
npx expo start
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| JWT Token Rotation | RS256, 15min access / 7d refresh |
| Rate Limiting | 10 req/s, 100/min, 1000/hr per IP |
| CORS Policy | Strict allowlist, credentials enabled |
| Input Sanitization | Zod schemas on all DTOs |
| SQL Injection | Prisma ORM parameterized queries |
| XSS Protection | Helmet.js, CSP headers |
| HTTPS | Force HSTS in production |
| Audit Logging | All payment/booking events logged |
| Non-root Docker | Both services run as unprivileged users |

---

## 🤖 AI Features

- **Smart Search**: NLP parses "Luxury beach in Europe for 500 Pi" → structured filters
- **AI Concierge**: GPT-4o powered 24/7 travel assistant with conversation history
- **Itinerary Generation**: Day-by-day AI-created travel plans
- **Trending Insights**: Real-time AI analysis of travel trends for Pi users

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/pi-login` | Pi Network SSO → JWT |
| `GET` | `/api/v1/auth/me` | Current user profile |
| `POST` | `/api/v1/payments/approve` | Server-side payment approval |
| `POST` | `/api/v1/payments/complete` | Blockchain completion |
| `POST` | `/api/v1/ai/concierge/chat` | AI chat message |
| `POST` | `/api/v1/ai/smart-search` | NLP search parsing |
| `POST` | `/api/v1/bookings` | Create booking |
| `GET` | `/api/v1/bookings/my` | User's bookings |

Full docs: `http://localhost:3001/api/docs`

---

## 🎨 Design System

- **Theme**: Luxury Minimalist — Deep Space + Pi Gold
- **Components**: Glassmorphism + Neumorphism hybrid
- **Typography**: Inter (UI) + Playfair Display (Headlines)
- **Animations**: Framer Motion physics-based
- **Performance**: Skeleton screens, Edge caching, 100/100 Lighthouse target

---

## 📱 Mobile (React Native Expo)

Shared business logic with frontend:
- Pi SDK via WebView bridge
- Offline-capable with local state
- Push notifications for booking updates
- Biometric auth integration

---

## 🌍 Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

**Critical**: Never commit `.env` files. Use secrets management in production.

---

## 📜 License

MIT License — Sara Go Team © 2024

---

> **Sara Go** — *Where Pi Pioneers go to explore the world* 🌍π
