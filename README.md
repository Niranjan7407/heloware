# Heloware

<p align="center">
  <img src="frontend/src/assets/logo.png" alt="Heloware Logo" width="200"/>
</p>

<p align="center">
  A modern real-time chat application with end-to-end encryption, built with React and Node.js
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Features

- 🔐 End-to-end encrypted conversations
- 🌐 Real-time messaging with Socket.IO
- 👥 Friend request system
- 🔄 Message buffering for offline users
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔑 Google OAuth authentication
- 📱 Cross-platform compatibility

## Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- Socket.IO client for real-time communication
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js & Express
- MongoDB with Mongoose
- Socket.IO for WebSocket connections
- Passport.js for authentication
- JWT for session management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/heloware.git
cd heloware
```
2. Install frontend dependencies
```
cd frontend
npm install
```
3. Install backend dependencies
```
cd ../backend
npm install
```
4. Set up environment variables
Create a .env file in the backend directory:
```
PORT=5000
DB_URL=your_mongodb_url
SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
5. Start the development servers
```
# In backend directory
npm run dev

# In frontend directory
npm run dev
```
### Deployment
The application is deployed and accessible at:

  - Frontend: https://heloware.vercel.app/
  - Backend: https://heloware-backend.onrender.com/

### Screenshots
#### Login:
<img width="1920" height="1080" alt="Screenshot 2025-10-22 184358" src="https://github.com/user-attachments/assets/3fbad6c7-265c-4356-a579-0cb79b3c496d" />

#### Signup:
<img width="1920" height="1080" alt="Screenshot 2025-10-22 184404" src="https://github.com/user-attachments/assets/6c14bab4-eda0-4063-8820-284751337dc1" />

#### Dashboard:
<img width="1920" height="1080" alt="Screenshot 2025-10-22 184425" src="https://github.com/user-attachments/assets/636a81cb-3bf7-4369-8e29-04656b6fccbe" />

#### Chatspace:
<img width="1920" height="1080" alt="Screenshot 2025-10-22 184432" src="https://github.com/user-attachments/assets/b4175970-ea51-4a84-b5c6-133044fb6d19" />
