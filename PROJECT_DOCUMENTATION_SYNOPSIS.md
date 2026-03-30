# PrintFlow Documentation Synopsis

## 1. Project Overview

- `PrintFlow` is a smart print-ordering platform for customizing and ordering printed materials.
- The application focuses on four main service types:
  - Flex printing
  - Poster printing
  - Visiting cards
  - ID cards
- The platform combines a visual customization workflow with cart management, order tracking, and lightweight backend persistence.
- The overall goal is to simplify print ordering for users through an interface that feels closer to an e-commerce product configurator than a traditional print form.

## 2. Core Product Idea

- Users browse available print services from a dashboard.
- They open a customization workspace for a selected service.
- They configure size, template content, quantity-related details, and optional design inputs.
- They save drafts, add items to cart, and place orders.
- Orders are then tracked from a dedicated order-history screen.

## 3. System Architecture

- The project is split into two main applications:
  - `backend`: Node.js + Express + MongoDB API
  - `frontend`: React + Vite + Tailwind CSS client
- The frontend handles:
  - UI rendering
  - route navigation
  - template-driven customization
  - local session persistence
  - calls to backend cart and order APIs
- The backend handles:
  - user registration and login
  - JWT generation and verification
  - protected route access
  - server-side cart storage
  - server-side order storage

## 4. Frontend Synopsis

### 4.1 UI Structure

- The frontend uses a single-page application structure with React Router.
- The main application layout is wrapped inside a reusable `AppLayout`.
- Navigation is provided through a responsive sidebar with desktop and mobile variants.
- The main user-facing routes are:
  - `/dashboard`
  - `/customize`
  - `/customize/:category`
  - `/cart`
  - `/orders`

### 4.2 Dashboard Experience

- The dashboard acts as the control center of the product.
- It includes:
  - quick-start service cards
  - service search and filter chips
  - live pricing teaser
  - recent orders preview
  - saved draft preview
  - WhatsApp support shortcut
- This makes the dashboard both a discovery layer and a return-entry point for existing users.

### 4.3 Customization Module

- The customization screen is the core product feature.
- It supports two interaction modes:
  - `SIZE` mode for dimensional products like flex and posters
  - `TEMPLATE` mode for structured products like visiting cards and ID cards
- Key capabilities include:
  - selecting service-specific templates
  - editing text fields live
  - uploading logo and photo assets
  - calculating live price previews
  - saving drafts locally
  - adding customized items to cart
- This module functions like a lightweight print design studio optimized for hackathon-scale delivery.

### 4.4 Cart Module

- The cart page consolidates all configured items before checkout.
- It supports:
  - item review
  - quantity adjustment
  - item removal
  - total calculation
  - tax and delivery estimation
  - payment-method selection
- On checkout, the cart is converted into an order object and stored both locally and on the backend for authenticated users.

### 4.5 Orders Module

- The orders page allows users to monitor previously placed orders.
- It includes:
  - status filtering
  - expandable order details
  - pricing breakdown
  - timestamp display
  - support for multiple order states such as `Pending`, `Confirmed`, `In-Print`, and `Delivered`
- This gives the project a complete purchase lifecycle, not just a design submission flow.

### 4.6 Authentication Layer

- The frontend contains:
  - login page
  - signup page
  - auth context for token and user persistence
  - protected-route logic
- Authentication data is stored in `localStorage` to restore session state after refresh.
- The app also includes Firebase client setup for Google sign-in support.

## 5. Backend Synopsis

### 5.1 Backend Responsibilities

- The backend exposes REST APIs for authentication, cart management, and order management.
- It uses Express middleware for:
  - JSON parsing
  - CORS
  - JWT authentication
  - role-based authorization

### 5.2 Authentication Flow

- The backend currently supports local email/password authentication.
- Main auth operations:
  - user registration
  - password hashing with `bcryptjs`
  - user login
  - JWT creation with a 7-day expiry
- Each token includes:
  - `userId`
  - `role`

### 5.3 User Data Model

- User documents store:
  - basic profile fields
  - provider type
  - password for local accounts
  - optional Firebase UID
  - role
  - cart items
  - orders
- Cart items and orders are currently stored as flexible mixed objects inside the user document.
- This design keeps implementation simple and fast, though it trades away strict schema validation.

### 5.4 Cart API

- The backend cart module supports:
  - fetch current cart
  - add a cart item
  - replace the full cart
- These endpoints require JWT authentication.
- This enables persistent cart sync for logged-in users across sessions.

### 5.5 Orders API

- The backend order module supports:
  - fetch user orders
  - create a new order
- Orders are prepended to the user record so the most recent entries appear first.
- The frontend uses this data to populate the dashboard preview and orders page.

## 6. User Journey Synopsis

- Step 1: User lands on dashboard and explores available printing services.
- Step 2: User selects a category and enters the customization flow.
- Step 3: User edits dimensions or template content and reviews live pricing.
- Step 4: User saves a draft or adds the item to cart.
- Step 5: User reviews the cart, selects payment mode, and places an order.
- Step 6: The order is stored and later shown in the orders page with status information.

## 7. Data and State Management

- The project uses a hybrid persistence model.
- Client-side storage is used for:
  - auth session recovery
  - cart fallback
  - draft persistence
  - local order fallback
- Backend storage is used for authenticated persistence of:
  - cart
  - orders
  - user accounts
- This makes the system resilient for demos and hackathon usage, even when backend sync is unavailable.

## 8. Key Strengths of the Project

- Strong end-to-end product flow from customization to ordering.
- Visually polished UI with animation and responsive navigation.
- Real-time price preview improves user confidence before checkout.
- Draft-saving behavior makes the product feel practical, not purely presentational.
- Backend integration gives the project real application depth beyond static frontend screens.

## 9. Current Gaps and Documentation Notes

- The frontend currently includes login, signup, and protected-route components, but the active router is not using those protected wrappers.
- The frontend references a Google/Firebase auth endpoint at `/api/auth/firebase`, but that backend route is not currently implemented.
- Cart and order data are stored as mixed objects without strict validation schemas.
- A dedicated admin order-management workflow is not yet implemented, although role-based middleware exists.
- Checkout is still framed as a lightweight order creation step rather than a full payment pipeline.

## 10. Suggested Documentation Sections

- Introduction
- Problem Statement
- Solution Overview
- Feature Highlights
- Architecture Overview
- Frontend Design and Routing
- Backend API and Authentication
- Database Schema
- Customization Workflow
- Cart and Order Flow
- State Management Strategy
- Current Limitations
- Future Enhancements

## 11. Future Enhancement Directions

- Add a complete Firebase auth verification route on the backend.
- Enforce protected routes in the live frontend router.
- Introduce dedicated MongoDB schemas for cart items and orders.
- Add admin dashboard capabilities for order approval and status updates.
- Integrate payment gateway handling instead of placeholder payment selection.
- Add file upload storage for design assets instead of temporary browser previews.
- Add testing coverage for authentication, cart sync, and order creation.

## 12. One-Line Executive Summary

- `PrintFlow` is a full-stack print customization and ordering platform that combines an interactive design workflow, persistent cart management, and order tracking into a clean, demo-ready product experience.
