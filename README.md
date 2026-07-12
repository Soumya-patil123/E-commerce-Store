# 🛒 Fieldstone Goods — Simple E-commerce Store

A full-stack **E-commerce Store** developed using **Node.js, Express.js, HTML, CSS, JavaScript, and SQLite**.  
This application allows users to browse products, manage a shopping cart, create orders, and view order history.

---

## 🚀 Features

### 👤 User Authentication
- User registration and login
- Secure password encryption using bcrypt
- Session-based authentication
- Logout functionality

### 🛍️ Product Management
- Product listing
- Category-based filtering
- Product search
- Product details page
- Quantity selector

### 🛒 Shopping Cart
- Add products to cart
- Update quantity
- Remove products
- Session-based cart management

### 📦 Order System
- Checkout functionality
- Create orders and order items
- Automatic stock update
- View order history

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite
- better-sqlite3

### Authentication
- Express Session
- bcryptjs

---

## 📂 Project Structure
ecommerce-app/
│
├── server.js
├── package.json
│
├── db/
│ ├── database.js
│ ├── seed.js
│ └── store.db
│
├── middleware/
│ └── auth.js
│
├── routes/
│ ├── auth.js
│ ├── products.js
│ ├── cart.js
│ └── orders.js
│
└── public/
├── index.html
├── product.html
├── cart.html
├── checkout.html
├── orders.html
├── login.html
├── register.html
│
├── css/
│ └── style.css
│
└── js/
└── *.js



---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Soumya-patil123/E-commerce-Store.git