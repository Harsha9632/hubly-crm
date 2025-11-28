# Hubly CRM - Chat Center Application

A full-stack Customer Relationship Management (CRM) application with an advanced Chat Center feature for managing customer queries in real-time.

---

##  Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing

---

##  Features

### 1. **Authentication System**
- User signup and login
- Password hashing with bcrypt
- Role-based access (Admin/Member)
- Secure session management

### 2. **Chat Center (Core Feature)**
- Real-time customer chat management
- Chat assignment to team members
- Chat reassignment with access control
- Auto-refresh/polling for new messages
- Resolution tracking (on-time vs missed)
- Unread message counter

### 3. **Public Chat Widget**
- Customer-facing chat interface
- Mobile-responsive design
- Full-screen mode on mobile devices
- Form for customer details collection
- Real-time messaging

### 4. **Dashboard**
- Overview of all chats
- Filter by status (Resolved/Unresolved)
- Quick access to chat details

### 5. **Analytics**
- Total chats count
- Resolution percentage
- Average reply time calculation
- Missed chats weekly trends (10-week view)

### 6. **Team Management**
- Add/Edit/Delete team members
- View all team members
- Role assignment

### 7. **Settings**
- User profile management
- Admin name protection (cannot be changed)
- Password change functionality
- Chatbot customization settings

---

##  Admin Credentials

**Default Admin Account:**
Email: harsha@hubly.com Password: Admin123 Name: Harsha s Role: Admin

**Important:** Admin name cannot be changed from Settings to maintain chat assignment consistency.

---

## 📁 Project Structure
hubly-crm/ ├── backend/ │ ├── routes/ │ │ ├── chatRoutes.js # Chat API endpoints │ │ └── customerRoutes.js # Customer-facing endpoints │ ├── .env # Environment variables │ ├── server.js # Main Express server │ └── package.json │ ├── frontend/ │ ├── public/ │ │ └── images/ │ │ ├── chat-icon.png │ │ ├── close-icon.png │ │ └── material-home.png │ ├── src/ │ │ ├── components/ │ │ │ ├── AdminLayout.js # Admin page wrapper │ │ │ └── Sidebar.js # Navigation sidebar │ │ ├── pages/ │ │ │ ├── Login.js │ │ │ ├── Signup.js │ │ │ ├── Dashboard.js │ │ │ ├── ChatCenter.js # Main chat management │ │ │ ├── ChatWidget.js # Public chat widget │ │ │ ├── Analytics.js │ │ │ ├── Settings.js │ │ │ └── Team.js │ │ ├── styles/ │ │ │ ├── ChatCenter.css │ │ │ ├── ChatWidget.css │ │ │ └── ... │ │ └── App.js │ ├── .env # Frontend environment variables │ └── package.json │ └── README.md

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   npm install
   MONGO_URL=your_mongodb_connection_string
   PORT=8001
   npm start
   Server will run on: http://localhost:8001

   ## Frontend Setup
   cd frontend
   npm install

   Database Schema

   users
   
  id: String,              // UUID
  fullName: String,
  email: String,           // Unique
  password: String,        // Hashed with bcrypt
  role: String,            // "Admin" or "Member"
  phone: String,
  created_at: Date,
  updated_at: Date





