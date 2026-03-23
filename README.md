# Smart Campus Operations Hub
IT3030 PAF Assignment 2026 — Group XX

---

## First-time setup (every developer does this once)

### 1. PostgreSQL
Make sure PostgreSQL is running on port 5432 and create the database:
```sql
CREATE DATABASE smartcampus;
```

### 2. Google OAuth2 credentials
Get the shared `client-id` and `client-secret` from your team lead (shared via WhatsApp/Discord — never committed to git).

Then copy the example file and fill in the values:
```bash
cp backend/src/main/resources/application-local.properties.example \
   backend/src/main/resources/application-local.properties
# Open application-local.properties and paste the credentials
```

### 3. Frontend — no extra setup needed (no secrets required)

---

## Running the project

### Backend
```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend
```bash
cd frontend && npm install --legacy-peer-deps && npm run dev
```

Open http://localhost:5173 — click **Sign in with Google**.

---

## Running tests

```bash
# All tests
cd backend && ./mvnw -B clean verify -Dspring-boot.run.profiles=local

# Single class
cd backend && ./mvnw -B test -Dtest=SecurityConfigTest

# Single method
cd backend && ./mvnw -B test -Dtest=NotificationServiceTest#notifyBookingDecisionCreatesNotification
```

---

## Team — module ownership

| Member | Package | Feature |
|--------|---------|---------|
| M1 | `com.smartcampus.resource` | Facilities catalogue |
| M2 | `com.smartcampus.booking` | Booking workflow |
| M3 | `com.smartcampus.incident` | Incident tickets |
| M4 | `com.smartcampus.{config,user,notification}` | Auth, users, notifications |

---

## For the team lead — Google Cloud Console setup (one-time)

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create project → **Create Credentials → OAuth 2.0 Client ID** → Web application
3. Authorized redirect URI: `http://localhost:8080/oauth2/callback/google`
4. OAuth consent screen → **Test users** → add every team member's Google account
5. Share **Client ID** and **Client Secret** with all members privately
