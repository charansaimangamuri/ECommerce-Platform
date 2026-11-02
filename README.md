# ShopSphere — Enterprise Full-Stack E-Commerce & Microservices Platform

[![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis_7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions CI](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://e-commerce-platform-onie.vercel.app)

> **ShopSphere** is a modern, high-throughput, multi-tenant e-commerce platform inspired by Amazon, Flipkart, and Myntra. Engineered with a **polyglot microservices architecture**, it delivers sub-50ms catalog searches, concurrency-safe atomic checkouts, legal tax PDF invoice generation, and real-time AI product recommendations.

---

## 🌐 Live Deployments & Repository Links

* **Live Storefront (Production)**: [https://e-commerce-platform-onie.vercel.app](https://e-commerce-platform-onie.vercel.app)
* **GitHub Repository**: [https://github.com/charansaimangamuri/ECommerce-Platform](https://github.com/charansaimangamuri/ECommerce-Platform)
* **FastAPI Swagger Docs (Local)**: `http://localhost:8000/docs`
* **Spring Boot Invoicing API (Local)**: `http://localhost:8080/api/invoices/{orderNumber}/pdf`

---

## 🏛️ System Architecture

```text
                                  ┌─────────────────────────────────────────┐
                                  │   ShopSphere Storefront & Merchant UI   │
                                  │   Next.js 16 (React, RSC, Tailwind CSS) │
                                  │   Zustand (Cart) | TanStack (Queries)   │
                                  └────────────────────┬────────────────────┘
                                                       │
                                   ┌───────────────────┴───────────────────┐
                                   ▼                                       ▼
                       [ Next.js API Routes ]                   [ Better Auth System ]
                    (Cart, Checkout, Catalog, Admin)           (Buyer & Seller Roles)
                                   │
      ┌────────────────────────────┼────────────────────────────┬────────────────────────────┐
      ▼                            ▼                            ▼                            ▼
┌──────────────┐          ┌───────────────────┐       ┌───────────────────┐        ┌───────────────────┐
│ MongoDB 7.0  │          │ Redis 7.0 (Cache) │       │ Spring Boot (Java)│        │ FastAPI (Python)  │
│ (Mongoose)   │          │ (Catalog Acceleration)    │ (Invoice Service) │        │ (Recommendation)  │
│              │          │                   │       │                   │        │                   │
│ • Products   │◄─────────┼───────────────────┼───────┤ • Reads Orders    │        │ • Computes Cosine │
│ • Categories │          │ 120s Cache-Aside  │       │ • OpenPDF Engine  │        │   Similarity      │
│ • Users      │          │ Fast Search Hits  │       │ • Official Tax    │        │ • Real-time Match │
│ • Orders     │          │ Invalidation Hooks│       │   PDF Invoices    │        │   Percentages     │
└──────────────┘          └───────────────────┘       └───────────────────┘        └───────────────────┘
```

---

## 🚀 Key Engineering Highlights

### 1. High-Performance Multi-Faceted Search (MongoDB `$facet`)
* Executes complex multi-dimensional search aggregations (filtered products, total matched count, brand facet breakdown, and dynamic price boundaries) in **a single database round-trip**.
* Full-text search index across `title`, `brand`, and `description` with case-insensitive tokenization.

### 2. Sub-50ms Redis Cache-Aside Pattern
* Implements a resilient Cache-Aside caching layer with a 120-second TTL.
* **Graceful Degradation**: If Redis is offline or undergoing maintenance, the catalog seamlessly falls back to MongoDB Atlas without dropping requests.
* Automated cache purge hooks clear `catalog:*` cache keys upon new product creation by sellers.

### 3. Atomic Stock Protection (Zero Race Conditions / Overselling)
* Solves the classic e-commerce flash-sale concurrency problem using MongoDB conditional updates:
  ```typescript
  await Product.updateOne(
    { "variants.sku": sku, "variants.stock": { $gte: quantity } },
    { $inc: { "variants.$.stock": -quantity } }
  );
  ```
* Hardware-level atomic conditional decrement eliminates overselling without distributed locking bottlenecks.

### 4. Polyglot Enterprise Microservices
* **Spring Boot (Java 21 / OpenPDF)**: Financial document service listening to order events and generating compliant, itemized tax invoices (`INV-...`) with registered GSTIN headers, customer billing data, and vector tables.
* **FastAPI (Python 3.11 / Pydantic)**: AI recommendation microservice evaluating multi-attribute affinity vectors (category match: 50%, brand alignment: 25%, price proximity: 15%, rating boost: 10%) to compute real-time similarity percentages.

### 5. Multi-Tenant Role-Based Access Control (Better Auth)
* Native MongoDB session adapter with role-based policies (`buyer`, `seller`, `admin`).
* Verified merchant portal providing live store revenue analytics, order tracking, and dynamic variant/specification listing studios.

### 6. Automated CI/CD & Multi-Stage Dockerization
* Multi-stage `web/Dockerfile` utilizing Alpine Linux and Next.js `standalone` output mode, reducing production container size from ~1.2 GB to ~120 MB.
* GitHub Actions pipeline executing TypeScript validation (`npx tsc --noEmit`) and Python compilation checks on every push.

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend & UI** | Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind CSS, Lucide Icons | Responsive marketplace storefront, merchant dashboard, SEO metadata. |
| **Client State & Fetching** | Zustand, TanStack Query (React Query) | Global cart drawer with localStorage persistence, live search caching. |
| **Core API & ORM** | Next.js Route Handlers, Node.js, Mongoose ODM | RESTful CRUD APIs, aggregation pipelines, schema validation. |
| **Primary Database** | MongoDB 7.0 (MongoDB Atlas in Cloud) | Flexible polymorphic product documents, hierarchical categories, orders. |
| **Caching Layer** | Redis 7.0 (Upstash in Cloud) | Search result caching, high-traffic catalog query offloading. |
| **Invoicing Microservice** | Spring Boot 3.3.4, Java 21, Spring Data MongoDB, OpenPDF | Enterprise PDF tax invoice rendering and financial ledger. |
| **AI Recommendation Service** | FastAPI, Python 3.11, PyMongo, Pydantic, Uvicorn | Content-based recommendation scoring and similarity engine. |
| **Authentication** | Better Auth (Native MongoDB Adapter) | Multi-role user authentication, secure HTTP-only session cookies. |
| **DevOps & Cloud** | Docker, Docker Compose, GitHub Actions, Vercel | Multi-stage container builds, automated CI/CD pipeline, cloud hosting. |

---

## 📂 Project Structure

```text
E-Commerce Website/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions automated CI/CD pipeline
├── services/
│   ├── invoice-service/           # Spring Boot (Java) PDF Invoicing Microservice
│   │   ├── src/main/java/com/shopsphere/invoice/
│   │   │   ├── controller/        # REST Endpoints (GET /api/invoices/{orderNumber}/pdf)
│   │   │   ├── model/             # Spring Data MongoDB OrderDocument
│   │   │   ├── repository/        # MongoDB OrderRepository
│   │   │   └── service/           # OpenPDF Invoice Generator Engine
│   │   ├── pom.xml                # Maven Dependencies
│   │   └── Dockerfile             # Multi-stage Temurin JDK build
│   └── recommendation-service/    # FastAPI (Python) AI Recommendation Microservice
│       ├── main.py                # Content-based similarity scoring engine
│       ├── requirements.txt       # FastAPI, Uvicorn, PyMongo, Pydantic
│       └── Dockerfile             # Python 3.11 slim container
├── web/                           # Next.js 16 Full-Stack Storefront & API
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # Sign-in & Sign-up with role selection
│   │   │   ├── api/               # Products, Search, Checkout, Seed, Seller APIs
│   │   │   ├── checkout/          # Checkout page with atomic stock guards
│   │   │   ├── order-success/     # Order confirmation with direct PDF invoice download
│   │   │   ├── product/[slug]/    # Dynamic product view with AI recommendations
│   │   │   ├── seller/            # Merchant dashboard & product creation studio
│   │   │   └── page.tsx           # Storefront catalog with multi-faceted filtering
│   │   ├── components/            # Navbar, ProductCard, FilterSidebar, CartDrawer
│   │   ├── lib/                   # Database (Mongoose), Redis, Auth clients
│   │   ├── models/                # Product, Category, User, Order schemas
│   │   └── store/                 # Zustand Cart Store with localStorage persistence
│   ├── Dockerfile                 # Multi-stage standalone production build
│   └── next.config.ts             # Standalone output configuration
├── docker-compose.yml             # Local dev orchestrator (Mongo, Redis, Java, Python)
├── docker-compose.prod.yml        # Production stack orchestrator
└── README.md                      # Project documentation
```

---

## ⚡ Quick Start: Running Locally with Docker

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* [Node.js 20+](https://nodejs.org/) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/charansaimangamuri/ECommerce-Platform.git
cd ECommerce-Platform
```

### 2. Launch Local Microservices & Databases
Start MongoDB, Redis, the Spring Boot Invoice Service, and the FastAPI Recommendation Service:
```bash
docker compose up -d --build
```

### 3. Setup and Run the Next.js Storefront
```bash
cd web
npm install
npm run dev
```

### 4. Seed Demo Products
Open your browser and navigate to:
```text
http://localhost:3000/api/seed
```
This initializes sample categories (Laptops, Audio, Footwear) and products with multi-attribute variants and dynamic specs.

### 5. Access Services
* **Storefront**: [http://localhost:3000](http://localhost:3000)
* **Seller Portal**: [http://localhost:3000/seller](http://localhost:3000/seller)
* **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Spring Boot Invoicing**: [http://localhost:8080/api/invoices/ORD-DEMO/pdf](http://localhost:8080/api/invoices/ORD-DEMO/pdf)

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Service | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Next.js API | Multi-faceted search with Redis Cache-Aside. |
| `GET` | `/api/products/:slug` | Next.js API | Retrieves detailed product document by slug. |
| `POST` | `/api/checkout` | Next.js API | Executes atomic inventory deduction and creates order. |
| `POST` | `/api/seller/products` | Next.js API | Publishes new product and invalidates Redis catalog cache. |
| `GET` | `/api/seller/metrics` | Next.js API | Returns aggregated store revenue and order statistics. |
| `GET` | `/api/invoices/:orderNumber/pdf` | Spring Boot (8080) | Streams legal tax PDF invoice with OpenPDF. |
| `GET` | `/api/recommendations/:productId` | FastAPI (8000) | Computes content-based recommendation scores. |
| `GET` | `/api/health` | Next.js API | Healthcheck verifying MongoDB and Redis connections. |

---

## 👤 Author

**Mangamuri Charan Sai**
* **GitHub**: [@charansaimangamuri](https://github.com/charansaimangamuri)
* **LinkedIn**: [Charan Sai Mangamuri](https://www.linkedin.com)
* **Email**: mangamuricharansai@gmail.com

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
