# Production-Ready Auth API — NestJS-Style Architecture in Express

A full-featured authentication system built with **Express + MongoDB**, following **NestJS / Spring Boot separation-of-concerns principles** — modular, layered, and production-ready.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Validation | Joi (DTO pattern) |
| Auth Tokens | jsonwebtoken (JWT) |
| Password Hashing | bcryptjs |
| Email | Nodemailer (SMTP) |
| Cookie Parsing | cookie-parser |
| Dev Server | nodemon |
| DB Container | Docker Compose |

---

## Folder Structure

```
29-auth-complete/
├── server.js                            ← Entry point: loads .env, connects DB, starts server
├── .env                                 ← Environment variables (never commit this)
├── env.example                          ← Template for required env vars
├── docker-compose.yml                   ← Spins up MongoDB locally
├── package.json
└── src/
    ├── app.js                           ← Express app: global middleware + route mounting
    │
    ├── common/                          ← Shared utilities reused across ALL modules
    │   ├── config/
    │   │   ├── db.js                    ← connectDB() — Mongoose connection
    │   │   └── email.js                 ← Nodemailer transporter + email helpers
    │   │
    │   ├── dto/
    │   │   └── base.dto.js              ← BaseDto — Joi wrapper (validate + stripUnknown)
    │   │
    │   ├── middleware/
    │   │   └── validate.middleware.js   ← validate(DtoClass) factory — runs Joi on req.body
    │   │
    │   └── utils/
    │       ├── api-error.js             ← ApiError class with static factories (400/401/403/409)
    │       ├── api-response.js          ← ApiResponse — standardised JSON response shape
    │       └── jwt.utils.js             ← generate/verify AccessToken, RefreshToken, ResetToken
    │
    └── modules/
        └── auth/                        ← Self-contained auth feature module
            ├── dto/
            │   ├── register.dto.js      ← Joi schema: name, email, password, role
            │   ├── login.dto.js         ← Joi schema: email, password
            │   ├── forgot-password.dto.js  ← Joi schema: email
            │   └── reset-password.dto.js   ← Joi schema: password (strength rules)
            │
            ├── auth.model.js            ← Mongoose User schema + bcrypt pre-save hook
            ├── auth.service.js          ← Business logic (no req/res knowledge)
            ├── auth.controller.js       ← HTTP adapter (reads req, calls service, writes res)
            ├── auth.middleware.js       ← authenticate (JWT guard) + authorize (RBAC)
            └── auth.routes.js           ← Express Router: wires DTOs + middleware + controller
```

---

## Architecture — Separation of Concerns

Each layer has **one job only**. No layer reaches into another layer's responsibility.

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER              RESPONSIBILITY                  FILE            │
├─────────────────────────────────────────────────────────────────────┤
│  Routes             Wire middleware + controller    auth.routes.js  │
│  DTO / Validation   Input contract + Joi schema     dto/*.dto.js    │
│  Middleware         Cross-cutting (auth, validate)  *.middleware.js │
│  Controller         HTTP adapter (req → service)    auth.controller │
│  Service            Business logic (pure JS)        auth.service.js │
│  Model              Data shape + DB hooks           auth.model.js   │
│  Utils              Pure reusable functions         utils/*         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Full System Connection Diagram

```
CLIENT (Browser / Mobile / Postman)
         │
         │  HTTP Request
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  server.js  (Bootstrap)                                            │
│                                                                    │
│  1. dotenv/config  — loads .env                                    │
│  2. connectDB()    — opens Mongoose connection to MongoDB          │
│  3. app.listen()   — starts Express on PORT                        │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  app.js  (Express Pipeline)                                        │
│                                                                    │
│  express.json()                                                    │
│  express.urlencoded({ extended: true })                            │
│  cookieParser()          ← parses httpOnly cookies                 │
│                                                                    │
│  app.use("/api/auth", authRoute)                                   │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  auth.routes.js  (Express Router)                                  │
│                                                                    │
│  POST   /register        → validate(RegisterDto)  → controller     │
│  POST   /login           → validate(LoginDto)     → controller     │
│  POST   /refresh-token   →                           controller     │
│  POST   /logout          → authenticate           → controller     │
│  GET    /verify-email/:token                      → controller     │
│  POST   /forgot-password → validate(ForgotDto)    → controller     │
│  PUT    /reset-password/:token → validate(ResetDto) → controller   │
│  GET    /me              → authenticate           → controller     │
└──────┬───────────────────────┬─────────────────────────────────────┘
       │                       │
       ▼                       ▼
┌──────────────┐    ┌──────────────────────────────────────────────┐
│  validate    │    │  authenticate  (auth.middleware.js)          │
│  middleware  │    │                                              │
│              │    │  1. Read Authorization: Bearer <token>       │
│  DtoClass    │    │  2. verifyAccessToken(token) → jwt.verify()  │
│  .validate() │    │  3. User.findById(decoded.id)                │
│  (Joi)       │    │  4. req.user = { id, role, name, email }     │
│              │    │  5. next()  OR  throw ApiError.unauthorized  │
│  throws      │    │                                              │
│  ApiError    │    │  authorize(...roles)  — RBAC guard           │
│  .badRequest │    │  checks req.user.role ∈ allowed roles        │
└──────┬───────┘    └──────────────────────┬───────────────────────┘
       │                                   │
       └──────────────────┬────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────────┐
│  auth.controller.js  (HTTP Adapter Layer)                          │
│                                                                    │
│  Reads:    req.body / req.params / req.cookies / req.user          │
│  Calls:    authService.*()                                         │
│  Writes:   res.cookie("refreshToken", ..., { httpOnly: true })     │
│  Responds: ApiResponse.ok() / ApiResponse.created()               │
│                                                                    │
│  Standard response shape:                                          │
│  { success: true, message: "...", data: { ... } }                  │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  auth.service.js  (Business Logic — no req/res)                    │
│                                                                    │
│  register()       User.create() + sendVerificationEmail()          │
│  login()          comparePassword() + generateTokens()             │
│                   store SHA256(refreshToken) in DB                 │
│  refresh()        verifyRefreshToken() + hash compare in DB        │
│                   → generateAccessToken()                          │
│  logout()         User.findByIdAndUpdate(refreshToken: null)       │
│  verifyEmail()    SHA256(rawToken) lookup → set isVerified: true   │
│  forgotPassword() generateResetToken() + sendResetPasswordEmail()  │
│  resetPassword()  hash lookup + expiry check → bcrypt save         │
│  getMe()          User.findById()                                  │
└──────┬────────────────────────────┬───────────────────────────────┘
       │                            │
       ▼                            ▼
┌─────────────────┐    ┌────────────────────────────────────────────┐
│  jwt.utils.js   │    │  auth.model.js  (Mongoose Schema)          │
│                 │    │                                            │
│  generateAccess │    │  Fields:                                   │
│  Token(payload) │    │  name         String, required             │
│  → JWT, 15m     │    │  email        String, unique, lowercase    │
│                 │    │  password     String, select: false        │
│  generateRefresh│    │  role         enum: customer/seller/admin  │
│  Token(payload) │    │  isVerified   Boolean, default: false      │
│  → JWT, 7d      │    │  verificationToken   select: false         │
│                 │    │  refreshToken        select: false ← hashed│
│  generateReset  │    │  resetPasswordToken  select: false         │
│  Token()        │    │  resetPasswordExpires Date                 │
│  → crypto 32B   │    │                                            │
│    + SHA256     │    │  Hooks:                                    │
│                 │    │  pre('save') → bcrypt.hash(password, 12)   │
│  verifyAccess   │    │  comparePassword() → bcrypt.compare()      │
│  Token(token)   │    │                                            │
│  verifyRefresh  │    └──────────────────┬─────────────────────────┘
│  Token(token)   │                       │
└─────────────────┘                       ▼
                                   ┌─────────────┐
                                   │   MongoDB   │
                                   │  (users     │
                                   │  collection)│
                                   └─────────────┘
```

---

## Email Flow

```
┌────────────────────────────────────────────────────────────────────┐
│  email.js  (Nodemailer)                                            │
│                                                                    │
│  SMTP transporter (Mailtrap / Gmail / SendGrid)                    │
│                                                                    │
│  sendVerificationEmail(email, rawToken)                            │
│    → CLIENT_URL/verify-email/<rawToken>                            │
│    → User clicks link → GET /api/auth/verify-email/:token          │
│    → Service: SHA256(rawToken) → lookup in DB → isVerified = true  │
│                                                                    │
│  sendResetPasswordEmail(email, rawToken)                           │
│    → CLIENT_URL/reset-password/<rawToken>                          │
│    → User submits new password → PUT /api/auth/reset-password/:token│
│    → Service: SHA256(rawToken) → lookup + expiry check → save      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Stateful vs Stateless — Token Strategy

```
STATELESS — Access Token
─────────────────────────────────────────────────────────────────────
  • Short-lived JWT (15 minutes)
  • Signed with JWT_ACCESS_SECRET
  • Payload: { id, role }
  • Sent in response body → client stores in memory
  • Every protected request: Authorization: Bearer <accessToken>
  • Server verifies signature only — NO database lookup required
  • Cannot be invalidated before expiry (by design — short TTL mitigates this)

STATEFUL — Refresh Token
─────────────────────────────────────────────────────────────────────
  • Long-lived JWT (7 days)
  • Signed with JWT_REFRESH_SECRET
  • Sent as httpOnly cookie → NOT accessible to JavaScript (XSS safe)
  • Server stores SHA256(refreshToken) in MongoDB users.refreshToken
  • On /refresh-token: cookie token → SHA256 → compare with DB value
  • Allows server-side invalidation: logout sets refreshToken = null in DB
  • Old tokens are dead even if an attacker has them

WHY BOTH?
─────────────────────────────────────────────────────────────────────
  Access Token  → Performance (no DB hit on every request)
  Refresh Token → Security  (can be revoked, stored securely in cookie)
```

---

## Token Lifecycle

```
LOGIN  POST /api/auth/login
  │
  ├─► generateAccessToken({ id, role })   → JWT 15m  → response body
  └─► generateRefreshToken({ id })        → JWT 7d   → httpOnly cookie
                                            SHA256(token) → stored in DB


AUTHENTICATED REQUEST  (any route with authenticate middleware)
  │
  └─► Authorization: Bearer <accessToken>
        │
        ├─► verifyAccessToken()  → decode { id, role }
        ├─► User.findById(id)    → confirm user still exists
        └─► req.user = { id, role, name, email }  → next()


ACCESS TOKEN EXPIRED  POST /api/auth/refresh-token
  │
  └─► Read refreshToken from httpOnly cookie
        │
        ├─► verifyRefreshToken()  → decode { id }
        ├─► User.findById(id).select("+refreshToken")
        ├─► SHA256(cookie token) === DB stored hash  → valid
        └─► generateAccessToken({ id, role })  → new accessToken


LOGOUT  POST /api/auth/logout
  │
  ├─► User.findByIdAndUpdate(id, { refreshToken: null })  ← DB invalidation
  └─► res.clearCookie("refreshToken")                     ← cookie cleared
```

---

## Validation — DTO Pattern

```
REQUEST BODY
     │
     ▼
validate(DtoClass)  middleware
     │
     ├─► DtoClass.validate(req.body)   ← inherits from BaseDto
     │         │
     │         └─► Joi schema.validate(data, {
     │                 abortEarly: false,    ← collect ALL errors
     │                 stripUnknown: true    ← remove extra fields
     │             })
     │
     ├─► FAIL  → throw ApiError.badRequest("field1 error; field2 error")
     │              → caught by Express error handler
     │              → { success: false, message: "...", errors: [...] }
     │
     └─► PASS  → req.body = sanitised value  → next()


DTO HIERARCHY
  BaseDto                    ← common/dto/base.dto.js
    └── RegisterDto          ← name, email, password (strength), role
    └── LoginDto             ← email, password
    └── ForgotPasswordDto    ← email
    └── ResetPasswordDto     ← password (strength rules)
```

---

## Password & Token Security

```
PASSWORDS
  • bcrypt with cost factor 12 (pre-save Mongoose hook)
  • Never stored in plain text
  • select: false — never returned in queries by default
  • comparePassword() uses bcrypt.compare() — timing-safe

REFRESH TOKEN STORAGE
  • Raw token sent to client (cookie)
  • SHA256(rawToken) stored in DB
  • If DB is breached, attacker gets hashes — not usable as tokens

RESET / VERIFICATION TOKENS
  • crypto.randomBytes(32) → 64-char hex raw token
  • SHA256(rawToken) stored in DB
  • Raw token sent in email link
  • Reset tokens expire in 15 minutes (resetPasswordExpires field)
  • Tokens are deleted after use ($unset)
```

---

## API Endpoints

| Method | Endpoint | Auth | Validation | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/auth/register` | — | RegisterDto | Create account, send verification email |
| POST | `/api/auth/login` | — | LoginDto | Issue access token + refresh token cookie |
| POST | `/api/auth/refresh-token` | — | — | Rotate access token using refresh cookie |
| POST | `/api/auth/logout` | Bearer | — | Invalidate refresh token in DB + clear cookie |
| GET | `/api/auth/verify-email/:token` | — | — | Activate account via email link |
| POST | `/api/auth/forgot-password` | — | ForgotPasswordDto | Send password reset email |
| PUT | `/api/auth/reset-password/:token` | — | ResetPasswordDto | Set new password via reset link |
| GET | `/api/auth/me` | Bearer | — | Get current authenticated user profile |

### Standard Response Shape

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "name": "...", "email": "...", "role": "customer" },
    "accessToken": "<jwt>"
  }
}
```

### Error Response Shape

```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter and one digit"
}
```

---

## Environment Variables

```env
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/cohort?authSource=admin

# JWT
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<different-strong-secret>
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (Mailtrap / Gmail / SendGrid)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>
SMTP_FROM_NAME=MyApp
SMTP_FROM_EMAIL=noreply@myapp.com

# Frontend URL (used in email links)
CLIENT_URL=http://localhost:3000
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values
cp env.example .env

# 3. Start MongoDB via Docker
npm run db:up

# 4. Start dev server
npm run dev
```

---

## Available Scripts

```bash
npm run dev        # Start development server with nodemon
npm run db:up      # Start MongoDB container
npm run db:down    # Stop MongoDB container
npm start          # Production server
```

---

## Testing the API

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass123","role":"customer"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123"}'

# Access protected route
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure Docker is running: `npm run db:up` |
| JWT verification failed | Check JWT secrets match in `.env` |
| Email not sending | Verify SMTP credentials in `.env` |
| CORS errors | Add `cors` middleware in `app.js` |

---

## Module Expansion Pattern

To add a new feature module (e.g. `products`), follow this structure:

```
src/modules/products/
├── dto/
│   ├── create-product.dto.js    ← Joi schema
│   └── update-product.dto.js
├── product.model.js             ← Mongoose schema
├── product.service.js           ← Business logic
├── product.controller.js        ← HTTP adapter
└── product.routes.js            ← Router
```

Then mount in `app.js`:

```js
import productRoute from "./modules/products/product.routes.js";
app.use("/api/products", productRoute);
```

Every module is fully self-contained. Shared utilities live in `common/` and are imported as needed.

---

## Production Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (min 32 chars)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags: `secure: true, sameSite: 'strict'`
- [ ] Use managed MongoDB (Atlas/DocumentDB)
- [ ] Use production SMTP (SendGrid/AWS SES)
- [ ] Enable rate limiting
- [ ] Add helmet.js for security headers
- [ ] Set up logging (Winston/Pino)
- [ ] Configure CORS whitelist
<<<<<<< HEAD
=======
- [ ] Badge Test
>>>>>>> d4b042b7357b5e5a802e13cb8ac03caed27a6b05
