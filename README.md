# Ansaroud Backend API Service
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#)
A high-performance, custom-tailored API backend service developed in Node.js and Express to power the digital experience of **Ansaroud** ([ansaroud.com](https://ansaroud.com))—the prominent attar, oil, and fragrance shop based in Lucknow, India.
This API acts as the central middleware connecting the client-side experience directly to product databases, geo-location registers, payment processing engines, and customer authentication systems.
---
## 🔗 Frontend App Connection
This backend is specifically designed to feed and orchestrate the client interface of the official mobile/web application:
👉 **Frontend Repository**: [kibutsuji-muzan/demo-ansaroud](https://github.com/kibutsuji-muzan/demo-ansaroud)
---
## 🏗️ Architecture: Dual-Mode Operation
To optimize both high-speed local development and robust live production deployment, the backend is architected with a dual strategy:
### 1. High-Fidelity Demo & Simulation Mode (Offline Sandbox)
Out of the box, the server operates in a fully self-contained sandbox environment, utilizing local mock engines and static dataset tables. This allows developers to test complex user flows without hammering production APIs or databases.
*   **Static Database Layer (`/src/demodata/`)**: Serves catalog lists, reviews, categories, and tags directly from high-fidelity JSON files.
*   **Massive Geo Dataset**: Integrates global locations with full geographical tables (including a `cities.json` database sizing over 10MB+) stored under `/src/demodata/geo/` for lightning-fast autocomplete dropdown responses.
*   **Simulated Auth & User Profile**: Implements JWT-secured flows using an in-memory database store for testing profile management.
*   **Mocked Checkout Payment Engine**: Dynamically calculates shipping rates, verifies payment options, and simulates standard Razorpay/Cash on Delivery (COD) workflows.
### 2. Live Sync Utilities (`vproducts.js`)
Includes synchronization scripts to bridge live product catalogues from production databases directly into the mock ecosystem. Running `vproducts.js` triggers custom Axios wrappers (`wpClient`) that extract the catalog from WordPress WooCommerce REST endpoints and seamlessly updates local JSON files.
---
## 🔌 The WordPress Core Engine (`wp_theme_funtion.php`)
Located in the root of the project is the `wp_theme_funtion.php` blueprint. This file contains a suite of WordPress hooks and custom REST routes that are intended to be deployed on the live WooCommerce website. It acts as the production equivalent of our mock backend:
1.  **JWT Authentication Extension**: Filters the `jwt_auth_token_before_dispatch` hook to expand standard JWT response bodies. It immediately transmits deep WooCommerce customer profiles, shipping variables, billing tables, and user avatars upon successful authorization.
2.  **User REST Extension**: Registers custom WordPress rest fields mapping WooCommerce billing & shipping profiles directly to `/wp-json/wp/v2/users/me` structures.
3.  **High-Speed Secure Order Endpoints**: Builds `/wp-json/my/v1/orders` custom REST routes supporting:
    *   **GET Requests**: Pulls complete WooCommerce order books secured by the authenticated customer's JWT.
    *   **POST Requests**: Allows administrative services to securely pull histories by `billing_email`, authenticated via a constant-time comparison system using custom `x-api-key` and `x-api-secret` headers.
4.  **Optimized Geo Lookup APIs**: Exposes high-performance queries for custom database tables (`/countries`, `/states`, `/cities`) to support address-entry fields.
---
## 🛠️ Tech Stack & Key Libraries
*   **Core Framework**: [Express.js](https://expressjs.com/) with Node.js
*   **Security Layer**: [Helmet](https://helmetjs.github.io/) (HTTP header hardening), [CORS](https://github.com/expressjs/cors) (cross-origin controls), [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) (brute-force defense)
*   **Authentication & Security**: [JSON Web Token (JWT)](https://jwt.io/) & [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
*   **Request Validation**: [Joi](https://joi.dev/) (schema-based declarative validation)
*   **Log Management**: [Morgan](https://github.com/expressjs/morgan) (HTTP traffic logger)
*   **Payment Integration (Mocked/Live)**: [Razorpay SDK](https://github.com/razorpay/razorpay-node)
---
## 🚦 REST API Endpoint Reference
All standard endpoints are prefixed with `/api` (or `/health` for checks):
### 🔑 Authentication (`/api/auth`)
*   `POST /api/auth/login` - Authenticates credentials. *Demo Mode supports email `testuser@ansaroud.com` and password `testuserpassword`.*
*   `POST /api/auth/google` - Verifies Google Sign-In credentials.
*   `GET /api/auth/me` - Validates Bearer Token in `Authorization` header and returns details for the active user.
### 📦 Products & Content (`/api/products`)
*   `GET /api/products` - Returns product catalogs. Supports extensive filtering (`per_page`, `page`, `category`, `tag`, `search`, `include`).
*   `GET /api/products/categories` - Returns category collections.
*   `GET /api/products/tags` - Returns product tags.
*   `GET /api/products/:id` - Pulls details for an individual product.
*   `GET /api/products/reviews` - Lists product reviews.
*   `POST /api/products/reviews` - Posts a new product review (writes to demo JSON).
### 🛒 Checkout & Order Booking (`/api/orders`)
*   `GET /api/orders` - Fetches the authenticated user's order history *(Requires JWT Authorization)*.
*   `GET /api/orders/:id` - Returns detailed data for a specific order.
*   `POST /api/orders` - Creates a checkout transaction. Incorporates:
    *   **Distance-Based Shipping Calculations**: Compares addresses to configuration parameters (Lucknow Local, Pan India, or International).
    *   **COD Verification**: resticting Cash on Delivery checks to designated operational cities (e.g. Lucknow).
    *   **Razorpay Integration**: Instantiates Razorpay order items and generates transaction payment objects.
*   `POST /api/orders/verify` - Confirms and updates checkout records upon validating Razorpay transaction hashes.
### 🗺️ Geographical Reference Data (`/api`)
*   `GET /api/countries` - Lists all countries globally.
*   `GET /api/countries/:countryCode` - Returns target country specifics.
*   `GET /api/states/:countryId` - Fetches all regional states for a country.
*   `GET /api/cities/:stateId` - Lists all municipal cities within a state.
### 🏥 System Status
*   `GET /health` - Verifies runtime status and active environmental stage.
---
## ⚙️ Environment Configuration (`.env`)
Configure operational constants by copying `.env.example` (or modifying the current `.env`):
```bash
NODE_ENV="development"
PORT=3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
JWT_EXPIRES_IN="7d"
JWT_SECRET="your_secure_jwt_secret_hash"
ALLOWED_ORIGINS="http://localhost:19006,http://localhost:3000"
ASSET_BASE_URL="https://demo-ansaroud-api-production.up.railway.app"
```
### Dynamic Shipping & COD Policies
Shipping calculations are governed by `/src/config/shipping.js`, which falls back to environment variables:
*   `LOCAL_DELIVERY_CITIES`: Comma-separated list of cities eligible for localized checkout rules (Default: `lucknow`).
*   `LOCAL_SHIPPING_COST`: Charges for local delivery (Default: `150 INR`).
*   `NATIONAL_SHIPPING_COST`: Standard domestic charges (Default: `300 INR`).
*   `INTERNATIONAL_SHIPPING_COST`: Global delivery charges (Default: `1200 INR`).
*   `COD_CITIES`: Cities eligible for Cash on Delivery checkout options (Default: `lucknow`).
---
## 🚀 Getting Started
### Prerequisites
*   Node.js (>= v18.x.x)
*   npm (>= v9.x.x)
### 1. Installation
Clone the codebase and install dependencies:
```bash
npm install
```
### 2. Run the Development Server
Starts the API with live-reload support via `nodemon`:
```bash
npm run dev
```
### 3. Start Production Server
Spins up the server under raw node runtimes:
```bash
npm start
```
### 4. Code Quality & Linter
Run code style and syntax checks using the integrated ESLint rules:
```bash
npm run lint
```
---
## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
