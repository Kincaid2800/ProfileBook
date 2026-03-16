# ProfileBook Project Report

## Executive Summary

ProfileBook is a full-stack social networking application designed to demonstrate modern web application engineering using Angular on the frontend and ASP.NET Core Web API on the backend. The platform supports secure user authentication, moderated social posting, direct messaging, profile management, user reporting, and administrative control functions.

From a delivery perspective, the project is positioned well as a professional portfolio or freelancer submission because it combines user experience, business logic, role-based access control, relational data modeling, and end-to-end API integration.

## Project Objectives

The primary objective of ProfileBook is to provide a feature-rich community platform where users can interact through posts, comments, likes, messages, and groups, while administrators retain moderation and management capabilities required for responsible platform operation.

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Bootstrap 5, Axios |
| Backend | ASP.NET Core Web API, .NET 10 |
| Database | SQL Server Express with Entity Framework Core |
| Authentication | JWT bearer token authentication |
| Media Handling | Multipart upload for post media and profile pictures |
| Documentation | Swagger for API testing and markdown technical documentation |

## Solution Architecture

The solution follows a clean client-server architecture:

- Angular provides a standalone-component-based SPA frontend.
- ASP.NET Core exposes domain-oriented REST endpoints.
- SQL Server stores normalized relational data.
- JWT tokens secure authenticated communication.
- Local storage is used on the frontend to persist session state.
- A shared application shell provides a consistent app-level header and footer.

This architecture is suitable for academic presentation, portfolio showcase, and small freelance delivery because it is practical, understandable, and demonstrably full stack.

## Frontend Capabilities

### Authentication Module

- User registration with client-side validation.
- User login with role-aware redirection.
- Logout and session persistence through stored token and user metadata.
- Shared application shell with app-level header and footer for consistent layout structure.

### Home Feed Module

- View approved posts.
- Create new posts.
- Upload image or video attachments before post creation.
- Like posts and add comments.
- Report inappropriate users from the feed.

### Profile Module

- View logged-in user profile details.
- Display role, email, join date, and avatar state.
- Upload and update profile picture.

### Search Module

- Search for users by partial username.
- Report users directly from search results.

### Messaging Module

- Search for users to chat with.
- Open one-to-one conversation history.
- Send direct messages in real time from the page workflow.

### Groups Module

- View all groups created by the platform.
- Join or leave groups.
- View membership-related information returned by the API.

### Admin Module

- Review pending posts awaiting moderation.
- Approve user posts.
- View all registered users.
- Update or delete user records.
- View abuse reports.
- Create and delete groups.

## Backend Capabilities

The backend project inside this repository provides the following capabilities:

- authentication and JWT issuance,
- user account management,
- post moderation workflow,
- comment and like handling,
- direct message storage and retrieval,
- report submission and admin review,
- group administration and membership management,
- automatic migration and demo admin seeding for fresh local setup,
- file upload support for posts and profile pictures,
- Swagger-based API discoverability.

## Security and Access Control

ProfileBook includes a role-aware authentication model with the following behavior:

- unauthenticated users must log in to access protected features,
- administrators are redirected to a dedicated dashboard,
- admin-only actions are separated from standard user actions,
- bearer tokens are attached to protected HTTP requests,
- the backend can seed the default demo admin account automatically for a fresh local setup.

This approach demonstrates a clear understanding of authorization boundaries and session control in modern web applications.

## Data Model Strength

The underlying entity design supports a realistic social media domain. The schema includes users, posts, comments, likes, reports, messages, groups, and group memberships. This provides strong evidence of:

- normalized relational thinking,
- support for many-to-many relationships,
- moderation-aware design,
- extensibility for future modules such as notifications or analytics.

## Engineering Quality Indicators

The project shows several technical strengths that are valuable in a freelancer-style delivery:

- modular service-based frontend architecture,
- clear separation of user and admin workflows,
- reusable API communication patterns,
- support for media uploads,
- practical validation in authentication forms,
- documented route structure,
- unit test coverage in the Angular application,
- repeatable smoke-test validation for the running system,
- polished README and implementation narrative.

## Testing and Validation

The project includes both component-level testing and a repeatable end-to-end smoke-test workflow.

- Angular unit tests cover core frontend components and the authentication service.
- A dedicated smoke-test script validates frontend reachability, backend reachability, JWT login, and protected API access.
- Swagger output provides an additional verification layer that backend controllers are registered correctly.

This combination strengthens confidence in both compile-time correctness and real runtime behavior.

## Business and Product Value

From a product perspective, ProfileBook is more than a CRUD demo. It supports the core behaviors expected from a moderated social platform:

- account onboarding,
- content publishing,
- user interaction,
- abuse reporting,
- private communication,
- community grouping,
- admin governance.

That combination makes it suitable as a showcase project for freelance clients, internships, academic review, or junior full-stack role interviews.

## Recommended Future Enhancements

- Add Angular route guards for cleaner route protection.
- Centralize API configuration using environment files.
- Add pagination and filtering for feed and admin data tables.
- Introduce notification features for likes, comments, approvals, and messages.
- Improve error handling through shared response models.
- Add dashboard analytics and moderation audit history.
- Expand automated tests across service and integration layers.

## Conclusion

ProfileBook is a well-rounded full-stack social platform that demonstrates practical engineering capability across frontend development, backend integration, authentication, data modeling, and administrative moderation workflows. The implemented feature set is strong enough to present as professional freelancer work, especially when paired with structured documentation, API demonstration, and a polished repository.

In summary, the project successfully showcases technical depth, realistic product design, and an implementation scope that goes beyond a basic classroom exercise.
