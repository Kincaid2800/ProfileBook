# 📖 ProfileBook

<div align="center">

![Angular](https://img.shields.io/badge/Angular-21.2.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-Express-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

**A full-stack social media platform built with Angular & ASP.NET Core**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-documentation) • [Testing](#-testing)

</div>

---

## 📌 Overview

ProfileBook is a full-stack social media web application that connects people virtually. Users can share posts, interact with content, send direct messages, and report inappropriate behaviour. Administrators have a dedicated dashboard to manage users, approve posts, view reports, and create user groups.

---

## ✨ Features

### 👤 User Features
| Feature | Description |
|---|---|
| 🔐 Authentication | Register, login, logout with JWT token-based security |
| 📝 Posts | Create posts (submitted for admin approval), view approved feed |
| ❤️ Likes & Comments | Like/unlike posts, add comments |
| 💬 Messaging | Send and receive direct messages with other users |
| 🔍 Search | Search users by username |
| 🚨 Report | Report inappropriate users |
| 👤 Profile | View profile, upload profile picture |
| 👥 Groups | Join and leave user groups |

### ⚙️ Admin Features
| Feature | Description |
|---|---|
| 📊 Dashboard | Stats overview — total users, pending posts, reports |
| ✅ Post Approval | Review and approve pending posts |
| 👥 User Management | Create, read, update, delete users |
| 🗂️ Groups | Create and delete user groups |
| 🚨 Reports | View all user reports with reason and timestamp |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 21, TypeScript, Bootstrap 5, Axios |
| **Backend** | ASP.NET Core Web API, .NET 10 |
| **Database** | SQL Server Express, Entity Framework Core (Code-First) |
| **Auth** | JWT Bearer Tokens, BCrypt password hashing |
| **File Storage** | Server-side IFormFile — `wwwroot/profiles/` & `wwwroot/uploads/` |
| **API Docs** | Swagger UI (Swashbuckle) |
| **Testing** | Karma + Jasmine (14 unit tests) |
| **Version Control** | Git + GitHub |

---

## 📁 Project Structure

```
ProfileBook/
├── 🔵 backend/                        # ASP.NET Core Web API
│   ├── Controllers/                   # AuthController, PostController,
│   │                                  # UserController, MessageController, GroupController
│   ├── Models/                        # User, Post, Message, Comment,
│   │                                  # Like, Report, Group, GroupMember
│   ├── DTOs/                          # AuthDTOs, PostDTOs, UpdateUserDTO
│   ├── Data/AppDbContext.cs            # EF Core DbContext + relationships
│   ├── Migrations/                    # EF Core Code-First migrations
│   ├── wwwroot/uploads/               # Post images & videos
│   ├── wwwroot/profiles/              # User profile pictures
│   ├── schema.sql                     # Database schema SQL script
│   └── Program.cs                     # JWT, CORS, Swagger, EF Core config
│
└── 🟢 frontend/                       # Angular Application
    └── src/app/
        ├── components/                # login, register, home, admin,
        │                              # profile, messages, search, groups
        ├── services/                  # auth, post, user, message, group
        └── app.routes.ts              # Angular routing (8 routes)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- .NET 10 SDK
- SQL Server Express
- Angular CLI (`npm install -g @angular/cli`)

### 1. Clone the Repository

```bash
git clone https://github.com/Kincaid2800/ProfileBook.git
```

### 2. Backend Setup

```bash
# Switch to backend branch
git checkout backend

# Restore packages
dotnet restore

# Update appsettings.json with your SQL Server connection string
# Then run migrations
dotnet ef database update

# Start the API
dotnet run
# API runs at https://localhost:7193
# Swagger UI at https://localhost:7193/swagger
```

### 3. Frontend Setup

```bash
# Switch to frontend branch
git checkout frontend

# Install dependencies
npm install

# Start Angular dev server
ng serve
# App runs at http://localhost:4200
```

### 4. Default Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@profilebook.com | Admin@123 |
| User | Register via the app | — |

---

## 🗄️ Database Schema

8 tables with full relationships:

```
Users ──< Posts ──< Comments
  │    ──< Likes
  │    ──< Messages (SenderId + ReceiverId)
  │    ──< Reports (ReportedUserId + ReportingUserId)
  └────< GroupMembers >── Groups
```

> Full SQL schema available in `schema.sql` on the `backend` branch.

---

## 🔐 Authentication Flow

```
User Login → POST /api/Auth/login
           → BCrypt.Verify(password, hash)
           → JWT Token generated (UserId, Username, Role)
           → Stored in localStorage
           → Sent as Authorization: Bearer {token} on every request
           → [Authorize] validates on backend
```

---

## 📡 API Documentation

Swagger UI is available at **`https://localhost:7193/swagger`** when the backend is running.

| Controller | Endpoints |
|---|---|
| **AuthController** | POST /register, POST /login |
| **PostController** | GET, POST, PATCH /approve, POST /like, POST /comment, POST /upload |
| **UserController** | GET /profile, GET /search, PUT, DELETE, POST /report, POST /upload-profile-picture |
| **MessageController** | POST /send, GET /{userId} |
| **GroupController** | GET, POST, DELETE, POST /{id}/join |

---

## 🧪 Testing

Run all unit tests:

```bash
ng test
```

**14 tests across 4 spec files — all passing ✅**

| File | Tests | Coverage |
|---|---|---|
| `auth.spec.ts` | 7 | isLoggedIn, isAdmin, getToken, logout |
| `login.spec.ts` | 3 | Component creation, initial state, email validation |
| `register.spec.ts` | 3 | Component creation, initial state, username validation |
| `app.spec.ts` | 1 | App component smoke test |

---

## 📊 Sprint 1 Criteria Status

| Criteria | Marks | Status |
|---|---|---|
| Database Schema | 3 | ✅ Done |
| Admin Login & CRUD | 3 | ✅ Done |
| User Registration & Login | 3 | ✅ Done |
| Angular Frontend Template | 3 | ✅ Done |
| Code Sanitization | 8 | ✅ Done |
| CRUD Functionalities | 8 | ✅ Done |
| Advanced Features | 8 | ✅ Done |
| Responsiveness & Validation | 8 | ✅ Done |
| Session Handling | 5 | ✅ Done |
| Angular + Backend Integration & JWT | 5 | ✅ Done |
| Unit Testing | 7 | ✅ Done |
| GitHub Repository | 3 | ✅ Done |

---

## 👨‍💻 Author

**Kincaid2800** — [github.com/Kincaid2800](https://github.com/Kincaid2800)

---

<div align="center">
  <sub>Built with ❤️ using Angular + ASP.NET Core</sub>
</div>