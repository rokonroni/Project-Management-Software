# AI Agent Instructions for Project Management Software

## Project Overview
This is a Next.js 15.5 project implementing a project management system with role-based access (managers and developers). The application uses App Router, MongoDB for data storage, and TypeScript throughout.

## Architecture & Key Components

### Authentication & Authorization
- Role-based auth system implemented in `src/lib/auth.ts`
- Two user roles: `manager` and `developer` (see `src/models/User.ts`)
- Protected routes in `src/(dashboard)` directory
- Auth middleware in `src/middleware.ts` for route protection

### Data Flow
1. API routes in `src/app/api/*` handle data operations
2. MongoDB models in `src/models/` define data structures
3. Frontend components in `src/components/` organized by role/feature
4. Global types defined in `src/types/index.ts`

### Key Integration Points
- MongoDB connection managed via singleton pattern in `src/lib/mongodb.ts`
- API middleware wrapper in `src/lib/api-middleware.ts` for error handling
- Utility functions centralized in `src/lib/utils.ts`

## Development Workflow

### Environment Setup
Required environment variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Common Commands
```bash
pnpm install     # Install dependencies
pnpm dev        # Start development server
pnpm build      # Create production build
pnpm start      # Run production server
pnpm lint       # Run ESLint
```

### Project Conventions
1. API Routes:
   - Use middleware wrapper from `api-middleware.ts`
   - Implement CRUD operations in `[id]` subdirectories
   - Return standardized response format

2. Component Organization:
   - Role-specific components in respective directories
   - Shared components in `components/shared`
   - Use composition over inheritance

3. Data Models:
   - Define interfaces in `types/index.ts`
   - Implement schemas in `models/` directory
   - Use timestamps for all models

## Best Practices
1. Always use TypeScript interfaces for data models
2. Implement role-based access checks in API routes
3. Use the MongoDB connection singleton for database operations
4. Follow Next.js App Router conventions for routing and layouts
5. Use shared components for common UI elements

## Common Patterns
- API error handling through middleware wrapper
- MongoDB connection management via cached singleton
- Role-based route protection using middleware
- Component organization by feature/role