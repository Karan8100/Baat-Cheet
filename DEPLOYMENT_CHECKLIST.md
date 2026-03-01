# 🚀 Deployment Checklist for Baat-cheet

## Pre-Deployment Requirements

### Backend Setup
- [ ] Create `.env` file in `Backend/` folder with all required variables
- [ ] Update `MONGODB_URI` with production MongoDB connection string
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=5000` (or your hosting provider's port)
- [ ] Set `CLIENT_URL` to your frontend domain (e.g., `https://yourdomain.com`)
- [ ] Configure Cloudinary API keys for image uploads
- [ ] Configure email service (Resend or Nodemailer)
- [ ] Generate and set a strong `JWT_SECRET`

### Frontend Setup
- [ ] No `.env` file needed - uses `import.meta.env.MODE`
- [ ] Axios automatically uses `/api` in production (relative path)
- [ ] Build with: `npm run build`
- [ ] Verify dist folder is created

## Environment Variables Needed

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
JWT_SECRET=super_secret_key_min_32_chars
CLOUDINARY_NAME=cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_key
SENDER_EMAIL=noreply@yourdomain.com
```

## Deployment Steps

### Option 1: Deploy to Vercel/Railway/Render

1. **Backend Deployment**
   - [ ] Push code to GitHub
   - [ ] Connect your git repo to hosting platform
   - [ ] Add environment variables in platform dashboard
   - [ ] Set build command: `npm install && npm start`
   - [ ] Set start command: `npm start`

2. **Frontend Deployment**
   - [ ] Build: `npm run build`
   - [ ] Deploy `dist` folder to Vercel/Netlify
   - [ ] Ensure backend API URL is correctly set

### Option 2: Deploy to Traditional Hosting (VPS/Shared Hosting)

1. **Backend**
   ```bash
   # SSH into server
   ssh user@server-ip
   
   # Clone repo
   git clone your-repo-url
   cd Baat-cheet/Backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env  # Add all environment variables
   
   # Start with PM2 or similar
   npm install -g pm2
   pm2 start server.js --name "baat-cheet-backend"
   pm2 startup
   pm2 save
   ```

2. **Frontend**
   ```bash
   cd Baat-cheet/Frontend
   npm install
   npm run build
   
   # Move dist to web server or CDN
   ```

## CORS Configuration Updates ✅

**Fixed in latest code:**
- Express CORS now reads from `CLIENT_URL` environment variable
- Socket.io CORS now reads from `CLIENT_URL` environment variable
- Supports multiple origins (comma-separated)

Example: `CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com`

## Database Configuration

- [ ] Create MongoDB Atlas account (or use your own MongoDB server)
- [ ] Create a database user with appropriate permissions
- [ ] Whitelist IP addresses on MongoDB Atlas
- [ ] Use full connection string in `MONGODB_URI`

## Testing Before Deploy

1. [ ] Test all API endpoints with production domain
2. [ ] Test WebRTC calls with different network conditions
3. [ ] Test socket connection from frontend to backend
4. [ ] Test image uploads to Cloudinary
5. [ ] Verify email notifications work
6. [ ] Test on mobile devices

## Performance Checks

- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend starts without errors: `npm start`
- [ ] Database connection works
- [ ] CORS headers are correct
- [ ] Socket.io connections establish properly

## Security Checklist

- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] Never commit `.env` file
- [ ] Use HTTPS only in production
- [ ] Enable HTTPS for Socket.io (wss://)
- [ ] Set secure cookies: `secure: true` for production (in middleware if needed)
- [ ] Rate limiting configured (optional but recommended)
- [ ] Input validation on all endpoints

## Post-Deployment

- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor user online status updates
- [ ] Test video calls from real users
- [ ] Monitor WebSocket connections
- [ ] Set up automated backups for MongoDB

## Common Issues & Solutions

### "CORS error when deploying"
- Ensure `CLIENT_URL` environment variable is set correctly
- Check frontend domain matches exactly (including scheme and path)

### "Socket connection fails in production"
- Verify `CLIENT_URL` is set in backend
- Ensure backend is accessible from frontend
- Check socket.io path and transport settings

### "WebRTC not working after deployment"
- Verify STUN servers are accessible (Google's STUN servers should work)
- Check firewall rules allow WebRTC ports
- Test from different networks

## Hosting Recommendations

- **Backend**: Railway, Render, Heroku alternative, or AWS EC2
- **Database**: MongoDB Atlas (free tier available)
- **Storage**: Cloudinary (for images)
- **Email**: Resend or SendGrid
- **Frontend**: Vercel, Netlify, or same server as backend

---

**Last Updated**: March 1, 2026
**Status**: Ready for deployment with environment variables configured
