# Frontend - Angular 19 Authentication Module

## Installation

```bash
npm install
```

## Development Server

```bash
npm start
```

Navigate to `http://localhost:4200`

## Build

```bash
npm run build
```

## Environment Configuration

Update `src/environments/environment.ts` with your backend API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

## Features

- Login component
- Register component
- Dashboard (protected route)
- Admin panel (admin-only route)
- Auth guard for route protection
- Role guard for role-based access
- HTTP interceptor for JWT token attachment

