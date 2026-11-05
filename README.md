# 🪔 Diwali Shop Manager: Inventory & Packing Management System

A complete, responsive, full-stack web application designed for a seasonal Diwali products retail business with two real-time synchronized portals:

1. **Admin Dashboard (Shop Counter)**: Catalog management, seasonal discounts, physical stock control, multi-product packing request dispatch, delivery receipt confirmations.
2. **Packing Dashboard (Warehouse / Packing Staff)**: Live incoming packing queue, order acceptance, packaging assembly checklist, completion alerts, dispatch updates.

Both systems share the same MySQL database and synchronize in real-time via **WebSockets (STOMP / SockJS)** without page reloads.

---

## 🌟 Key Features

### 1. Role-Based Authentication & Authorization
- **ADMIN**: Full authority over products, inventory adjustments, festive discounts, packing requests, delivery confirmation, and system notifications.
- **PACKING_STAFF**: Access restricted to the warehouse packing portal. Can accept orders, mark packing in-progress, mark ready, and mark dispatched. Forbidden from changing prices or stock settings.
- JWT-secured REST APIs with BCrypt password encryption.

### 2. Admin Counter Portal
- **Dashboard Overview**: Real-time KPI metrics for Total Products, Total Physical Stock, Pending Packing Orders, Orders Ready for Delivery, and Low Stock Alerts.
- **Product Management**:
  - Full CRUD operations with SKU generation and category classification.
  - Image URL support or direct local file upload with preview.
  - Search by product name / SKU and filter by festive category or status.
  - Activate/Deactivate product availability.
- **Inventory Management**:
  - Real-time breakdown of Available Stock vs Reserved Stock vs Total Physical Stock.
  - Stock adjustments: **Add Stock (+)**, **Reduce Stock (-)**, and **Manual Exact Set (=)**.
  - Negative stock prevention and threshold warnings.
  - Permanent stock movement audit trail (tracking before/after units, reasons, and actors).
- **Price & Discount Engine**:
  - Percentage discounts (e.g., `10% OFF`) or Fixed Amount deductions (e.g., `₹30 OFF`).
  - Automatic calculation of final selling price and customer savings.
  - Discounts modify pricing without altering physical inventory units.
- **Internal Packing Requests**:
  - Multi-product order creation with live stock availability verification.
  - Snapshot pricing saved per item to preserve historical accuracy even if catalog prices change later.
  - Immediate atomic stock reservation upon order creation.

### 3. Warehouse Packing Portal
- **Live Fulfillment Queue**: Real-time notification cards with audio-visual alerts when the shop counter requests packing.
- **Interactive Workflow Badges**:
  - `PENDING`: Newly arrived packing request.
  - `ACCEPTED`: Claimed by packing staff member.
  - `PACKING`: Physical assembly in progress.
  - `READY`: Packing completed; triggers counter notification for collection.
  - `DISPATCHED`: Dispatched for delivery.
  - `DELIVERED`: Counter admin confirms receipt; finalizes stock deduction.
  - `CANCELLED`: Releases reserved stock back to available units.
- **Packing Checklist**: Item-by-item quantity checklist with product names and SKUs.

### 4. Real-Time WebSockets
- Spring Boot WebSocket Message Broker with SockJS fallback (`/ws`).
- Notification broadcast to `/topic/notifications` with unread badge counter.
- Order state changes broadcast to `/topic/orders` for instant UI synchronization across tabs and devices without refresh.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 + Vite
  - Tailwind CSS (responsive design with custom festive emerald/gold theme)
  - React Router DOM v6
  - Axios (HTTP client with Bearer token interceptor)
  - Lucide React (feather-style modern icons)
  - `@stomp/stompjs` + `sockjs-client`
- **Backend**:
  - Java 21 LTS + Spring Boot 3.3.4
  - Spring Security (JWT Stateless Architecture)
  - Spring Data JPA (Hibernate ORM)
  - Spring WebSocket (`SimpMessagingTemplate`)
  - MySQL Connector/J
- **Database**:
  - MySQL 8.x / 9.x (`diwali_shop_db`)

---

## 🔐 Sample Demo Credentials

| Role | Username | Password | Default Portal |
| :--- | :--- | :--- | :--- |
| **Shop Admin** | `admin` | `banwarilal123` | `/admin` |
| **Packing Staff** | `packer` | `packer123` | `/packing` |

> *Tip: The login screen features one-click quick demo buttons to populate credentials automatically.*

---

## 🗄️ Database Design

Database Name: `diwali_shop_db`

### Tables
1. **`users`**: User credentials, full name, role (`ADMIN` or `PACKING_STAFF`).
2. **`categories`**: Diwali festive product categories.
3. **`products`**: Product catalog, SKU code, category, prices, discount fields, available & reserved stock, and min stock threshold.
4. **`inventory`**: Warehouse location and current stock synchronization.
5. **`inventory_transactions`**: Audit trail of every stock modification (`ADD_STOCK`, `REDUCE_STOCK`, `MANUAL_ADJUSTMENT`, `RESERVE`, `RELEASE_RESERVATION`, `DISPATCH_DEDUCT`).
6. **`orders`**: Internal packing orders, status, timestamps for each lifecycle step, and notes.
7. **`order_items`**: Ordered items with historical `price_snapshot` and quantity.
8. **`notifications`**: System notifications with role targeting (`ADMIN`, `PACKING_STAFF`, or `ALL`) and read/unread status.
9. **`discounts`**: Historical log of festive discount campaigns.

SQL schema scripts are available in [`database/schema.sql`](file:///Users/manishkumar/patake/database/schema.sql) and initial seed data in [`database/data.sql`](file:///Users/manishkumar/patake/database/data.sql).

---

## 🚀 Execution & Setup Instructions

### Prerequisites
- Java 21 JDK (`java -version`)
- Node.js 18+ and npm (`node -v`, `npm -v`)
- MySQL Server running locally on port 3306

### Step 1: Start MySQL Database
Ensure MySQL is running and create the database:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS diwali_shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```
*(Optional: run `mysql -u root diwali_shop_db < database/schema.sql && mysql -u root diwali_shop_db < database/data.sql` if you wish to pre-populate via SQL CLI. Spring Boot also auto-seeds default categories, products, and accounts upon initial launch).*

### Step 2: Configure Database Credentials
Edit `backend/src/main/resources/application.properties` if your MySQL password is not blank:
```properties
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/diwali_shop_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### Step 3: Run Spring Boot Backend
From the root directory:
```bash
cd backend
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ../tools/apache-maven-3.9.6/bin/mvn spring-boot:run
```
*(Or use your system `mvn spring-boot:run`)*.
The backend will boot up at **`http://localhost:8080`**.

### Step 4: Run Vite React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at **`http://localhost:5173`**.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login`: Authenticate and receive JWT token (`username`, `password`).
- `GET /api/auth/me`: Retrieve current logged-in profile.

### Products & Categories
- `GET /api/categories`: List all festive categories.
- `GET /api/products`: List products (Supports query params: `?query=...&categoryId=...&status=...`).
- `GET /api/products/{id}`: Get product details.
- `POST /api/products`: Create a new product *(Admin only)*.
- `PUT /api/products/{id}`: Update product details *(Admin only)*.
- `DELETE /api/products/{id}`: Delete product *(Admin only)*.
- `PATCH /api/products/{id}/toggle-status`: Toggle ACTIVE / INACTIVE status *(Admin only)*.
- `POST /api/products/upload-image`: Multipart image file upload *(Admin only)*.

### Inventory
- `GET /api/inventory`: List stock inventory.
- `POST /api/inventory/adjust`: Perform manual stock adjustment (`ADD_STOCK`, `REDUCE_STOCK`, `MANUAL_ADJUSTMENT`) *(Admin only)*.
- `GET /api/inventory/transactions`: Audit log of all stock movements.
- `GET /api/inventory/transactions/product/{productId}`: Movement history for a single product.
- `GET /api/inventory/low-stock`: Products at or below minimum threshold.
- `GET /api/inventory/out-of-stock`: Zero-stock products.

### Discounts
- `GET /api/discounts`: View discount records.
- `POST /api/discounts`: Apply percentage or fixed discount to a product *(Admin only)*.
- `DELETE /api/discounts/{productId}`: Remove discount *(Admin only)*.

### Orders & Packing Workflow
- `GET /api/orders`: List orders (supports `?status=...`).
- `GET /api/orders/packing/queue`: Active order queue for packing staff.
- `GET /api/orders/{id}`: View order details with item list and snapshot prices.
- `POST /api/orders`: Create packing request and reserve stock *(Admin only)*.
- `PATCH /api/orders/{id}/status`: Transition status (`ACCEPTED`, `PACKING`, `READY`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).

### Notifications & Dashboard
- `GET /api/notifications`: List notifications for current user role.
- `GET /api/notifications/unread-count`: Number of unread notifications.
- `PATCH /api/notifications/{id}/read`: Mark notification as read.
- `POST /api/notifications/read-all`: Mark all notifications as read.
- `GET /api/dashboard/stats`: High-level shop & packing metrics.

---

## ⚡ Real-Time WebSocket Protocol

- **STOMP Endpoint**: `ws://localhost:8080/ws` (SockJS enabled)
- **Subscribed Channels**:
  - `/topic/notifications`: Emits instant toast alerts on order creation, packing updates, and low inventory warnings.
  - `/topic/orders`: Emits real-time order payloads to trigger instantaneous table updates without page refresh.

---

## 📦 Order Lifecycle & Stock Rules

```
Admin Creates Order
       │
       ▼
[Stock Reserved] ──► WebSocket Broadcast ──► Packing Staff Alerted
                                                     │
                                                     ▼
                                              Staff Accepts Request
                                                     │
                                                     ▼
                                              Staff Starts Packing
                                                     │
                                                     ▼
                                              Staff Marks Ready ──► Counter Admin Notified
                                                     │
                                                     ▼
                                              Staff Marks Dispatched
                                                     │
                                                     ▼
Admin Confirms Receipt ──► [Stock Deducted & Finalized] ──► Status: DELIVERED
```
*If an order is cancelled at any stage before delivery, reserved stock is automatically credited back to available stock, and a cancellation audit transaction is recorded.*
