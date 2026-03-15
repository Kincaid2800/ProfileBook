# API Design

## API Style

ProfileBook follows a resource-oriented REST API design exposed from an ASP.NET Core backend and consumed by an Angular frontend through service classes. The API is organized by domain area, with endpoint groups that align to application modules such as authentication, posts, users, messages, and groups.

Base API URL used by the frontend:

```text
https://localhost:7193/api
```

## Design Principles

- Domain-based controllers keep the API easy to navigate.
- JWT bearer authentication protects user and admin operations.
- Admin-only actions are separated by endpoint intent such as pending post review and group creation.
- File uploads use `multipart/form-data`.
- Query parameters are used for lightweight actions such as search and reporting.

## Endpoint Overview

### Authentication

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/Auth/register` | Create a new user account | No |
| `POST` | `/Auth/login` | Authenticate user and issue JWT | No |

### Posts

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/Post` | Get approved posts for the feed | Public or token-tolerant frontend usage |
| `POST` | `/Post` | Create a new post | Yes |
| `POST` | `/Post/upload` | Upload image or video for a post | Yes |
| `POST` | `/Post/{postId}/like` | Like a post | Yes |
| `POST` | `/Post/{postId}/comment` | Add a comment to a post | Yes |
| `GET` | `/Post/pending` | Get posts awaiting approval | Admin |
| `PUT` | `/Post/{postId}/approve` | Approve a pending post | Admin |

### Users

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/User` | Get all users | Admin |
| `GET` | `/User/profile` | Get current user profile | Yes |
| `GET` | `/User/search?username={value}` | Search users by partial username | Yes |
| `PUT` | `/User/{userId}` | Update a user | Admin |
| `DELETE` | `/User/{userId}` | Delete a user | Admin |
| `GET` | `/User/reports` | Get submitted reports | Admin |
| `POST` | `/User/report?reportedUserId={id}&reason={text}` | Submit a user report | Yes |
| `POST` | `/User/upload-profile-picture` | Upload profile image | Yes |

### Messages

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/Message?receiverId={id}&content={text}` | Send a direct message | Yes |
| `GET` | `/Message/{userId}` | Get conversation with a user | Yes |

### Groups

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/Group` | Get all groups | Yes |
| `POST` | `/Group` | Create a group | Admin |
| `POST` | `/Group/{groupId}/join` | Join or leave a group | Yes |
| `DELETE` | `/Group/{groupId}` | Delete a group | Admin |

## Request and Response Patterns

### JSON Request Bodies

Used for structured writes such as:

- registration,
- login,
- create post,
- add comment,
- create group,
- update user.

### Query Parameters

Used for simple filters and actions such as:

- user search,
- reporting a user,
- sending a direct message.

### Multipart Form Data

Used for file upload endpoints:

- post media upload,
- profile picture upload.

## Frontend Service Mapping

| Angular Service | Backend Area | Main Responsibility |
|---|---|---|
| `AuthService` | `Auth` | Registration, login, local session state |
| `PostService` | `Post` | Feed retrieval, post creation, likes, comments, approval, uploads |
| `UserService` | `User` | Search, reporting, profile retrieval, admin user management |
| `MessageService` | `Message` | Direct messaging and conversation retrieval |
| `GroupService` | `Group` | Group listing, membership toggle, admin group management |

## Administrative API Capabilities

The API design clearly separates standard social interactions from administrative controls. Admin-only workflows include:

- approving pending content,
- viewing all users,
- editing or deleting users,
- viewing submitted reports,
- creating and deleting groups.

This is important because it demonstrates controlled moderation and governance rather than a purely open social feed.

## Strengths of the Design

- Clean separation of concerns by business domain.
- Simple and readable endpoint naming.
- Strong alignment between frontend modules and backend controllers.
- Practical support for both standard CRUD and social interaction actions.
- Easy to document and demo in Swagger UI.

## Recommended Improvements

- Introduce versioning such as `/api/v1`.
- Standardize envelope responses for success, validation, and error payloads.
- Use DTO naming consistently across all write operations.
- Add pagination for feed, search, and admin listing endpoints.
- Consider route guards and interceptors in the frontend to centralize authorization behavior.

## Professional Assessment

The API design is solid for a full-stack portfolio or freelance delivery because it combines:

- authentication,
- moderation,
- media handling,
- messaging,
- searchable user management,
- group participation,
- clear admin governance.
