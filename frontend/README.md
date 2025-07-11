# EcommerceApp Frontend

A modern Angular SPA for the EcommerceApp platform. This frontend provides user and admin interfaces, integrates with the backend API, and delivers a responsive, user-friendly shopping experience.

---

## Features Implemented
- **Authentication:** Login, registration, JWT token handling
- **User UI:**
  - Browse products and categories
  - View product details
  - Manage cart (add, update, remove items)
  - Place orders and view order history
  - Edit user profile
- **Admin UI:**
  - Dashboard with stats
  - Manage users, categories, products, and orders
  - Add/edit/delete products and categories
  - View and update order statuses
- **Role-based UI:**
  - Navigation and features adapt to ADMIN or USER role
- **Error Handling:**
  - User-friendly error messages
  - Unauthorized/forbidden page
- **Loading Indicators:**
  - Visual feedback for API calls
- **Responsive Design:**
  - Works on desktop and mobile

---

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard & features
│   │   ├── auth/          # Login, register, auth services
│   │   ├── components/    # Shared/user components (cart, home, navbar, etc.)
│   │   ├── guards/        # Route guards (auth, admin)
│   │   ├── shared/        # Shared UI and utilities
│   │   ├── app.config.ts  # App-wide config
│   │   ├── app.routes.ts  # Routing
│   │   └── ...
│   ├── assets/
│   └── environments/
├── angular.json           # Angular CLI config
├── package.json           # Dependencies & scripts
├── Dockerfile             # Containerizes frontend
└── ...
```

---

## Technologies Used
- **Angular 16+** (TypeScript, SCSS)
- **RxJS** (reactive programming)
- **Docker** (for containerized deployment)
- **Node.js 18+** (for local dev/build)

---

## How to Run

### With Docker Compose (Recommended)
- Run from project root:
  ```sh
  docker compose up --build
  ```
- Access the app at [http://localhost:4200](http://localhost:4200)

### Local Development
- Install dependencies:
  ```sh
  cd frontend
  npm install
  ```
- Start the dev server:
  ```sh
  npm start
  # or
  ng serve
  ```
- The app will be available at [http://localhost:4200](http://localhost:4200)
- The frontend expects the backend API at `http://localhost:8080` (see `environment.ts`)

---

## Environment Configuration
- **API URL:** Set in `src/environments/environment.ts`
- **Role-based UI:** Navigation and features adapt based on JWT token and user role

---

## What the Frontend Implements
- All user and admin flows described in the backend API docs
- Full integration with backend authentication, product, cart, order, and admin APIs
- UI/UX for both ADMIN and USER roles
- Error and loading state handling
- Responsive and accessible design

---

For more details, see the code in `src/app/` and the backend API documentation.
