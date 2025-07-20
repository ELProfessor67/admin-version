# Rafiky Web Application

A comprehensive event management and video conferencing platform built with React (Vite) frontend and Node.js backend.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v7 or higher, or MongoDB Atlas account)

## 📁 Project Structure

```
rafiky-web-version-manan-dev/
├── frontend/                 # React Vite frontend
│   ├── src/
│   │   ├── constants/
│   │   │   └── URLConstant.js # Frontend configuration
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/                  # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── package.json
└── ReadMe.md
```

## 🚀 Local Development Setup

### Step 1: Setup MongoDB

**Option A: Local MongoDB Installation**
```bash
# Install MongoDB (macOS)
brew install mongodb/brew/mongodb-community

# Install MongoDB (Ubuntu)
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongod
```

**Option B: Use MongoDB Atlas (Cloud)**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create cluster and get connection string

### Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   touch .env
   ```

4. **Configure environment variables (.env):**
   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/rafiky
   # Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/rafiky

   # Admin Configuration
   ADMIN_EMAIL=admin@rafiky.com
   ADMIN_PASSWORD=Kobe824

   # Server Configuration
   PORT=8000
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=rafiky2020

   # AWS Configuration (if using S3)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=eu-west-2

   # OpenTok Configuration (for video conferencing)
   OPENTOK_KEY=46760582
   OPENTOK_SECRET=69f8a7805643bb116b451278cd782dc9dec95979

   # Pusher Configuration (for real-time features)
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   ✅ Backend runs on: `http://localhost:8000`

### Step 3: Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   ✅ Frontend runs on: `http://localhost:5173`

---

## 🌐 Production Deployment

### Step 1: Run Backend in Production

1. **Setup backend on your server:**
   ```bash
   cd backend
   npm install
   ```

2. **Create production .env file:**
   ```env
   # Database Configuration (Use MongoDB Atlas)
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rafiky

   # Admin Configuration
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_password

   # Server Configuration
   PORT=8000
   NODE_ENV=production

   # Security
   JWT_SECRET=your_production_jwt_secret

   # Other production configurations...
   ```

3. **Start backend:**
   ```bash
   npm start
   # Backend runs on http://your-server-ip:8000
   ```

### Step 2: Update Frontend URLs

1. **Edit frontend constants:**
   ```bash
   cd frontend
   nano src/constants/URLConstant.js
   ```

2. **Update with your backend URL:**
   ```javascript
   // Change this to your backend server URL
   export const REACT_APP_API_URL = "http://your-server-ip:8000";
   
   // Update frontend URL (where frontend will be served)
   export const REACT_APP_URL = "http://your-frontend-ip:4173/";
   
   // Update all meeting links
   export const REACT_APP_MEETING_LINK_SPEAKER = "http://your-frontend-ip:4173/s-rafikyconnect-";
   export const REACT_APP_MEETING_LINK_LEARNER = "http://your-frontend-ip:4173/l-rafikyconnect-";
   export const REACT_APP_MEETING_LINK_MODERATOR = "http://your-frontend-ip:4173/m-rafikyconnect-";
   // ... update all other meeting links
   
   // Keep other constants as they are
   export const REACT_APP_JWT_SECRET = "rafiky2020";
   export const REACT_APP_MEETINGCODE_LENGTH = 12;
   ```

### Step 3: Build Frontend

```bash
cd frontend
npm install
npm run build
```
✅ Build files created in `dist/` folder

### Step 4: Serve Frontend (Choose Option A or B)

#### **Option A: Using npm run preview**
```bash
# Serve the built files
npm run preview
# Runs on http://localhost:4173

# To change port:
npm run preview -- --port 3000
```

#### **Option B: Using nginx to serve dist folder**
```bash
# Install nginx
sudo apt install nginx

# Create simple nginx config
sudo nano /etc/nginx/sites-available/rafiky
```

**Simple nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/your/project/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rafiky /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `PORT` | Server port (default: 8000) | No |
| `ADMIN_EMAIL` | Admin email | Yes |
| `ADMIN_PASSWORD` | Admin password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

### Frontend Constants (URLConstant.js)

| Constant | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |
| `REACT_APP_URL` | Frontend URL | `http://localhost:5173/` |

## 🔧 Troubleshooting

### Common Issues

1. **Backend won't start:**
   ```bash
   # Check Node.js version
   node --version
   
   # Check .env file
   cat backend/.env
   
   # Check MongoDB connection
   mongosh "your-mongo-uri"
   ```

2. **Frontend can't connect to backend:**
   ```bash
   # Verify backend is running
   curl http://localhost:8000
   
   # Check URLConstant.js
   cat frontend/src/constants/URLConstant.js | grep API_URL
   ```

3. **Build issues:**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

---

## 🤝 Quick Summary

### Local Development:
1. Start MongoDB
2. `cd backend` → `npm install` → create `.env` → `npm start`
3. `cd frontend` → `npm install` → `npm run dev`

### Production:
1. Run backend on server with production `.env`
2. Update `frontend/src/constants/URLConstant.js` with backend URL
3. `npm run build` in frontend
4. Serve with `npm run preview` OR nginx serving `dist/` folder

---

**Note:** Keep your `.env` file secure and never commit it to git!
