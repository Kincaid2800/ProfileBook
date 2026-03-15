# ProfileBook

<div align="center">

![Angular](https://img.shields.io/badge/Angular-21.2.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-Express-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

**A full-stack social media platform built with Angular and ASP.NET Core**

[Features](#features) • [Tech Stack](#tech-stack) • [Project Structure](#project-structure) • [Getting Started](#getting-started) • [API Documentation](#api-documentation) • [Testing](#testing)

</div>

---

## Overview

ProfileBook is a full-stack social media web application that connects people virtually. Users can register, log in securely, publish posts, interact with content, send direct messages, join groups, manage their profile, and report inappropriate behavior. Administrators can moderate content, manage users, review reports, and create community groups.

## Features

### User Features

| Feature | Description |
|---|---|
| Authentication | Register, log in, and log out using JWT-based security |
| Posts | Create posts with optional media attachments |
| Moderated Feed | New posts are submitted for approval before appearing publicly |
| Likes and Comments | Interact with approved posts |
| Messaging | Send and receive direct messages with other users |
| Search | Find users by username |
| Reports | Report inappropriate users |
| Profile | View personal profile details and upload a profile picture |
| Groups | Join and leave groups |

### Admin Features

| Feature | Description |
|---|---|
| Dashboard | View pending posts, users, reports, and groups |
| Post Approval | Approve user-submitted posts |
| User Management | Update and delete user accounts |
| Group Management | Create and delete groups |
| Report Review | View submitted user reports |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Bootstrap 5, Axios |
| Backend | ASP.NET Core Web API, .NET 10 |
| Database | SQL Server Express, Entity Framework Core |
| Authentication | JWT bearer tokens, BCrypt password hashing |
| File Storage | Server-side file uploads for posts and profile images |
| API Docs | Swagger UI |
| Testing | Angular unit tests |
| Version Control | Git and GitHub |

## Project Structure

```text
ProfileBook/
|-- backend/
|   `-- ProfileBook.API/
|       |-- Controllers/
|       |-- DTOs/
|       |-- Data/
|       |-- Migrations/
|       |-- Models/
|       |-- Properties/
|       |-- wwwroot/
|       |-- Program.cs
|       |-- appsettings.json
|       `-- schema.sql
|-- documentation/
|-- public/
|-- src/
|   `-- app/
|       |-- components/
|       |-- services/
|       `-- app.routes.ts
|-- package.json
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI
- .NET 10 SDK
- SQL Server Express

### 1. Clone the Repository

```bash
git clone https://github.com/Kincaid2800/ProfileBook.git
cd ProfileBook
```

### 2. Backend Setup

```bash
cd backend/ProfileBook.API
dotnet restore

# Update appsettings.json with your local SQL Server connection string if needed
dotnet ef database update
dotnet run
```

Backend URLs:

- API: `https://localhost:7193`
- Swagger: `https://localhost:7193/swagger`

### 3. Frontend Setup

```bash
cd ../..
npm install
ng serve
```

Frontend URL:

- App: `http://localhost:4200`

### 4. Default Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | Admin@123 |
| User | Register in the app | Create your own |

## Database Schema

The project uses a relational schema built around these core entities:

- Users
- Posts
- Comments
- Likes
- Messages
- Reports
- Groups
- GroupMembers

The SQL schema file is available at `backend/ProfileBook.API/schema.sql`.

## Authentication Flow

```text
User login -> POST /api/Auth/login
           -> credentials validated on the backend
           -> JWT generated with user claims
           -> token stored in localStorage
           -> Bearer token sent with protected API requests
           -> backend authorization validates access
```

## API Documentation

Swagger UI is available at `https://localhost:7193/swagger` when the backend is running.

| Controller | Example Responsibilities |
|---|---|
| AuthController | Register and login |
| PostController | Feed, create post, approve post, upload media, comments, likes |
| UserController | Profile, search, reports, admin user management |
| MessageController | Send messages and load conversations |
| GroupController | List, create, delete, and join groups |

## Testing

Run frontend unit tests:

```bash
ng test
```

## Documentation

Project documentation is available in the `documentation/` folder:

- `erdiagram.md`
- `jwt authentication.md`
- `api design.md`
- `project report.md`

## Author

**Kincaid2800** - [github.com/Kincaid2800](https://github.com/Kincaid2800)
