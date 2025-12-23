# Recipes Frontend

A React.js frontend application for the **Recipes API**, allowing users to browse, create, review, and manage recipes with authentication and role-based access.

This project is designed to work together with the **Recipes API backend** (ASP.NET Core).

---

## Features

-  User authentication (login / logout)
-  Browse public recipes
-  Filter recipes by category
-  Create and manage reviews
-  Create and edit own recipes
-  Upload and view recipe images
- Admin features (moderation, management views)
- Responsive UI

---

## Tech Stack

- **React.js**
- **TypeScript / JavaScript**
- **React Router**
- **Fetch API / Axios**
- **JWT authentication**
- **Cookie-based refresh token support**

---

## Authentication Flow

- User logs in → receives **JWT access token**
- Access token stored client-side (memory / storage)
- Refresh token handled automatically via **HttpOnly cookie**
- Access token refreshed via `/accessToken` endpoint when needed

> Refresh tokens are **not accessible from JavaScript** (by design).

---

## 🔌 Backend Integration

The frontend communicates with the backend API hosted at:

