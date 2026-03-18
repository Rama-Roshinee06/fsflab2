# 🚀 Deployment Guide - Garden of Time

## 📋 Overview
This guide will help you deploy your full-stack Garden of Time application:
- **Backend**: Node.js/Express API on Render
- **Frontend**: React app on Vercel

---

## 🔧 Step 1: Deploy Backend on Render

### 1.1 Prepare Backend
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Test locally (optional)
npm start
```

### 1.2 Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `garden-of-time-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Click **"Create Web Service"**

### 1.3 Get Backend URL
After deployment, Render will give you a URL like:
```
https://garden-of-time-api.onrender.com
```

---

## 🎨 Step 2: Deploy Frontend on Vercel

### 2.1 Prepare Frontend
1. Create environment file:
```bash
# In root folder
cp .env.example .env
```

2. Update `.env` with your backend URL:
```env
REACT_APP_API_URL=https://garden-of-time-api.onrender.com/api
```

### 2.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select your repository
5. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Click **"Deploy"**

---

## 🔗 Step 3: Connect Frontend to Backend

### 3.1 Update API URL
The frontend automatically uses the `REACT_APP_API_URL` environment variable.

### 3.2 Test Connection
```javascript
// Test API endpoints
GET https://your-backend-url.onrender.com/api/health
GET https://your-backend-url.onrender.com/api/generate-time
```

---

## 🛠️ Step 4: Environment Variables

### Backend (Render)
- `NODE_ENV`: `production` (automatic)
- `PORT`: `10000` (automatic on Render)

### Frontend (Vercel)
- `REACT_APP_API_URL`: Your backend URL + `/api`

---

## ✅ Step 5: Verify Deployment

### Check Backend Health
```bash
curl https://your-backend-url.onrender.com/api/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "API is running!",
  "timestamp": "2024-03-18T..."
}
```

### Check Frontend
1. Visit your Vercel URL
2. Try the clock learning features
3. Check browser console for API calls

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Backend already has CORS enabled
```javascript
app.use(cors());
```

### Issue 2: API Connection Failed
**Solution**: Check environment variables
```bash
# Verify backend URL is correct
echo $REACT_APP_API_URL
```

### Issue 3: Build Fails
**Solution**: Check Node.js version
```json
"engines": {
  "node": "18.x"
}
```

---

## 📊 Project Structure

```
fsf_lab2/
├── backend/                 # Node.js API
│   ├── clock-api.js        # Main server file
│   ├── package.json        # Dependencies
│   └── render.yaml         # Render config
├── src/                    # React frontend
│   ├── App.js             # Main app component
│   ├── components/        # React components
│   └── utils/             # Utility functions
├── public/                # Static files
├── package.json           # Frontend dependencies
├── vercel.json           # Vercel config
└── .env.example          # Environment variables template
```

---

## 🎯 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |
| GET | `/api/generate-time` | Generate time challenge |
| POST | `/api/submit-answer` | Validate user answer |
| GET | `/api/time-challenges` | Get multiple challenges |
| POST | `/api/save-progress` | Save learning progress |

---

## 🌟 Success Indicators

✅ **Backend deployed**: Returns JSON at `/api/health`  
✅ **Frontend deployed**: Loads React app successfully  
✅ **API connected**: Clock features work without errors  
✅ **Environment variables**: No localhost URLs in production  

---

## 🎉 You're Done!

Your Garden of Time application is now live and accessible to users worldwide!

**Backend URL**: `https://your-app-name.onrender.com`  
**Frontend URL**: `https://your-app-name.vercel.app`
