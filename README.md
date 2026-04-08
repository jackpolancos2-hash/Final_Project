# Grocery Inventory Management System

A web application for managing grocery inventory using Node.js, Express, SQLite, and React.

## Features
- CRUD (Create, Read, Update, Delete) for Products.
- Category and Supplier management.
- Real-time inventory tracking.

## Getting Started

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database (optional, already done):
   ```bash
   node seed.js
   ```
4. Start the server:
   ```bash
   node index.js
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on the port provided by Vite (usually `http://localhost:5173`).

## Project Structure
- `backend/`: Node.js Express server with SQLite database.
- `frontend/`: React application using Axios for API calls.
- `ERD.txt`: Entity Relationship Diagram.
- `IMPLEMENTATION_PLAN.md`: Step-by-step implementation guide.
