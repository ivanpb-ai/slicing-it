# Overview

This is a full-stack Node.js web application built with React and TypeScript that provides a visual graph editor for creating and managing network topology diagrams. The application allows users to create hierarchical network structures with different node types (network, cell-area, RRP, S-NSSAI, DNN, 5QI) and manage relationships between them through an interactive drag-and-drop interface powered by ReactFlow.

The system features comprehensive graph management capabilities including save/load functionality, import/export operations, file storage, and real-time visual editing with automatic layout algorithms. It uses PostgreSQL with Drizzle ORM for data persistence and includes both local storage and cloud storage options for graph data.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Library**: Tailwind CSS with shadcn/ui components for consistent design system
- **Graph Visualization**: ReactFlow (@xyflow/react) for interactive node-based graph editing
- **State Management**: React hooks with custom state management patterns, TanStack Query for server state
- **Routing**: React Router for client-side navigation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Handling**: Multer middleware for multipart form uploads with local file storage
- **API Design**: RESTful API structure with centralized error handling

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless database with connection pooling
- **ORM**: Drizzle ORM with PostgreSQL dialect for schema management and queries
- **File Storage**: Local filesystem storage in uploads directory for file management
- **Client Storage**: Browser localStorage for temporary graph data and user preferences
- **Schema**: Separate shared schema module for type consistency across client/server

## Authentication and Authorization
- **Current State**: Basic user schema defined but authentication not yet implemented
- **Prepared Structure**: User table with username/password fields ready for authentication system
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple) configured

## File and Graph Management
- **Graph Persistence**: Multiple storage backends (local storage, cloud storage, file import/export)
- **File Operations**: Server-side file upload API with size limits and type validation
- **Export/Import**: JSON-based graph serialization with comprehensive validation
- **Version Control**: Timestamp-based graph versioning for save/load operations

## Project Structure
- **Monorepo Layout**: Client and server code in separate directories with shared schema
- **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
- **Build System**: Vite for frontend bundling, esbuild for server-side builds
- **Development**: Hot module replacement and error overlays for development experience

## Key Design Patterns
- **Component Architecture**: Modular React components with clear separation of concerns
- **Hook-Based Logic**: Custom React hooks for state management and business logic
- **Service Layer**: Dedicated services for graph operations, storage, and data processing
- **Event-Driven**: Custom event system for component communication and state synchronization
- **Error Boundaries**: Comprehensive error handling with user-friendly feedback systems

# External Dependencies

## Database and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **drizzle-kit**: Database migration and schema management tools
- **pg**: PostgreSQL client library with connection pooling

## Frontend Libraries
- **@xyflow/react**: Interactive graph visualization and editing library
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessible interface elements
- **@hookform/resolvers**: Form validation integration with React Hook Form
- **react-router-dom**: Client-side routing for single-page application

## UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional className utility
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

## Server-Side Dependencies
- **express**: Web application framework for Node.js
- **multer**: Middleware for handling file uploads
- **connect-pg-simple**: PostgreSQL session store for express-session
- **cors**: Cross-origin resource sharing middleware

## Development Tools
- **vite**: Frontend build tool and development server
- **typescript**: Static type checking and compilation
- **esbuild**: Fast JavaScript bundler for server builds
- **tsx**: TypeScript execution engine for development

## Utilities and Helpers
- **date-fns**: Date manipulation and formatting library
- **nanoid**: URL-safe unique string ID generator
- **zod**: TypeScript-first schema validation library
- **cmdk**: Command palette component for search interfaces