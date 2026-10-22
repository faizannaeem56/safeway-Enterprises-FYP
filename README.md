# Safeway Enterprises - Full-Stack MERN E-Commerce & Gemini AI Support Project (FYP)

Welcome to the **Safeway Enterprises** Final Year Project (FYP) repository. This project is a complete, beginner-friendly, well-commented E-Commerce web application built using the **MERN Stack** (**M**ongoDB, **E**xpress.js, **R**eact.js, **N**ode.js) featuring real-time **Google Gemini AI Customer Support (`@google/generative-ai`)** and a full **Admin CRUD Panel**.

---

## Folder Structure

```text
safeway-enterprises-mern/
├── README.md                          # Complete setup instructions & architecture guide
├── backend/                           # Node.js + Express.js + MongoDB REST API
│   ├── package.json                   # Backend dependencies (@google/generative-ai, express, mongoose, etc.)
│   ├── .env.example                   # Template for environment variables
│   ├── server.js                      # Main Express server entry point
│   ├── seed.js                        # Script to populate initial products & admin account
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT authentication & Admin authorization checks
│   ├── models/
│   │   ├── User.js                    # User schema (Customer & Admin roles)
│   │   ├── Product.js                 # Product schema (7 tech categories, price, stock, warranty, specs)
│   │   └── Order.js                   # Customer Order schema
│   └── routes/
│       ├── authRoutes.js              # Signup & Login API endpoints
│       ├── productRoutes.js           # Product listing, filtering, sorting & Admin Add/Edit/Delete APIs
│       ├── orderRoutes.js             # Order creation & history APIs
│       └── chatRoutes.js              # Google Gemini AI Chat Support API with live DB catalog injection
└── frontend/                          # React.js (Vite + Tailwind CSS) Single Page Application
    ├── package.json                   # Frontend dependencies (react, react-router-dom, lucide-react)
    ├── vite.config.js                 # Vite bundler config with `/api` proxy to backend
    ├── index.html                     # Main HTML entry file
    └── src/
        ├── main.jsx                   # React root wrapper (AuthProvider + CartProvider + BrowserRouter)
        ├── App.jsx                    # Application routes & persistent layout
        ├── index.css                  # Global styling & Tailwind directives
        ├── context/
        │   ├── AuthContext.jsx        # Global state for User Login / Signup / JWT token
        │   └── CartContext.jsx        # Global state for Shopping Cart (Add, Remove, Update Qty, Total Bill)
        ├── components/
        │   ├── Navbar.jsx             # Top navigation bar with dynamic Cart badge & Admin link
        │   ├── Footer.jsx             # Safeway Enterprises footer
        │   ├── ProductCard.jsx        # Reusable card displaying tech product details
        │   └── ChatWidget.jsx         # Floating bottom-right Google Gemini AI Chat Support widget
        └── pages/
            ├── Home.jsx               # Hero banner, 7 Category cards, Featured Products, Company highlights
            ├── Shop.jsx               # Dynamic Category filter (7 categories) + Price Range Slider + Sort
            ├── Cart.jsx               # Shopping Cart management & Checkout screen
            ├── Auth.jsx               # Clean Login & Create Account (Signup) forms
            ├── AdminPanel.jsx         # Admin Dashboard to Add, Edit, and Delete products dynamically
            ├── About.jsx              # Safeway Enterprises About Us page
            └── Contact.jsx            # Safeway Enterprises Contact Us page
```

---

## Step-by-Step Installation & Execution Guide

### Prerequisites
1. **Node.js** (v18+ recommended) installed on your computer.
2. **MongoDB** installed locally (`mongodb://127.0.0.1:27017/safeway_db`) OR a free **MongoDB Atlas** cloud URI.
3. **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### Step 1: Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend/` folder (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/safeway_enterprises
JWT_SECRET=safeway_fyp_super_secret_key_2026
GEMINI_API_KEY=your_actual_google_gemini_api_key_here
```

Seed the database with sample products across all 7 categories and default accounts:
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
```

### Step 2: Setup the Frontend
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Default Test Accounts (Created by `npm run seed`)
- **Admin Account:** `admin@safeway.pk` / Password: `password123`
- **Customer Account:** `ali@student.edu.pk` / Password: `password123`
