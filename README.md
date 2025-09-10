# 🌍 TripSquad

TripSquad is a **trip management web app** that helps users plan trips, invite friends, share itineraries, split expenses, and keep notes — all in one place.  
Built with **React.js (frontend)** and **Core PHP + MySQL (backend)** for seamless collaboration and management.

## 📸 Screenshots

### 🏠 Homepage
![Homepage](./assets/homepage.png)

### 📊 Dashboard
![Dashboard](./assets/dashboard.png)

### 🗓 Itinerary
![Itinerary](./assets/itinerary.png)

---

## ✨ Features
- 🗓 **Create & Manage Trips** – Add trip details, destinations, and members dynamically.  
- 👥 **Invite Friends** – Add/remove trip members with their details.  
- 📅 **Shared Itinerary** – Collaboratively manage daily travel schedules.  
- 💸 **Expense Tracking & Splitting** – Record group expenses and split fairly among members.  
- 📊 **Dashboard** – View all trips, upcoming plans, and expense summaries.  

---

## 🛠 Tech Stack
- **Frontend:** React.js, Bootstrap / Material UI  
- **Backend:** Core PHP  
- **Database:** MySQL  
- **Version Control:** Git & GitHub  

---

## 🚀 Getting Started

 1. Clone the Repository

    git clone https://github.com/your-username/tripsquad.git
    cd tripsquad

2. Frontend Setup (React)
   cd frontend
   npm install
   npm start


   Frontend runs at: http://localhost:3000

   

4. Backend Setup (PHP + MySQL)

    Move the backend folder to your XAMPP/LAMP htdocs directory.

    Import the provided database.sql file into MySQL.

    Update database credentials in backend/config.php.

Start Apache & MySQL servers, then access API via http://localhost/backend/.

📂 Project Structure
TripSquad/
│
├── frontend/           # React.js frontend
│   ├── src/            # Components & Pages
│   └── package.json
│
├── backend/            # PHP backend
│   ├── api/            # PHP APIs
│   └── config.php
│
└── database.sql        # MySQL schema

