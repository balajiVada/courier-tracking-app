# Courier Tracking Application

This is a full-stack web application for tracking courier shipments. Users can check their order status, and the admin can update shipment progress in real-time.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Project Structure
```
Courier-Tracking-App/
│
├── client/             # React frontend
│   ├── public/
│   └── src/
│
├── server/             # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── database/           # SQL dump or DB schema (you can create this folder)
│
├── .gitignore
├── README.md
└── package.json
```

## Features
- User authentication (login, registration)
- Admin dashboard to update order statuses
- Live tracking of courier shipment stages:
  - Order Placed
  - Package Collected
  - In Transit
  - Out for Delivery
  - Delivered

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/courier-tracking-app.git
cd courier-tracking-app
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in `server/` using the provided `.env.example`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=courier_db
PORT=5000
```
Start the server:
```bash
npm start
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
npm start
```

### 4. Setup the Database
Import the MySQL schema file (`schema.sql`) in MySQL Workbench or CLI:
```sql
CREATE DATABASE courier_db;
-- Then import schema.sql or use your schema structure
```

## TODO (Optional Enhancements)
- Add Google Maps API for live courier location.
- Add email/SMS notifications.
- Add unit testing (Jest or Mocha).
- Deploy to Vercel (frontend) + Render/Heroku (backend).# courier-tracking-app
