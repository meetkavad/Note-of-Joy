# 🚀 Deployment Guide for Excitement Calendar

## Common Deployment Issues & Solutions

### 1. **Environment Variables**
Make sure to set these environment variables in your hosting platform:

```
MONGODB_URI=mongodb+srv://meetkavad07:KzevMFPWp7lp6owb@cluster0.yizudmm.mongodb.net/excitement-calendar?retryWrites=true&w=majority
PORT=3000
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
AUTH_PASSWORD=mySecurePassword123
NODE_ENV=production
```

### 2. **Platform-Specific Instructions**

#### **Heroku**
1. Set environment variables in Dashboard > Settings > Config Vars
2. Add the Heroku Postgres add-on if using PostgreSQL
3. Make sure your `package.json` has the correct start script

#### **Vercel**
1. Set environment variables in Project Settings > Environment Variables
2. Create a `vercel.json` file:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

#### **Railway**
1. Set environment variables in Project Settings > Variables
2. Railway automatically detects Node.js apps

#### **Render**
1. Set environment variables in Dashboard > Environment Variables
2. Make sure the build command is set to `npm install`
3. Set the start command to `npm start`

### 3. **Debugging Steps**

1. **Check if your app is running**: Visit `https://your-app-url.com/api/health`
2. **Check environment variables**: Make sure all required env vars are set
3. **Check logs**: Look at your hosting platform's logs for errors
4. **Test API endpoints**: Try accessing `https://your-app-url.com/api/auth/check`

### 4. **Common Fixes**

#### **Connection Error**
- Verify MongoDB connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure environment variables are properly set

#### **Session Issues**
- Set `NODE_ENV=production` in environment variables
- Update CORS configuration in server.js with your actual domain

#### **CORS Issues**
- Update the CORS origin in server.js with your deployed domain
- Make sure credentials are enabled for cross-origin requests

### 5. **Testing Your Deployment**

1. Open browser developer tools (F12)
2. Try to log in and check the Console tab for errors
3. Check the Network tab to see if API calls are failing
4. Look for specific error messages in the logs

### 6. **Quick Fixes for Common Errors**

**Error: "Cannot read property 'authenticated' of undefined"**
- Check if sessions are working properly
- Verify SESSION_SECRET is set

**Error: "MongoDB connection failed"**
- Verify MONGODB_URI is correct
- Check if your IP is whitelisted in MongoDB Atlas

**Error: "CORS policy blocks request"**
- Update CORS configuration with your domain
- Enable credentials in CORS settings

## 📞 Support

If you're still having issues, provide these details:
1. Which hosting platform you're using
2. The exact error message from browser console
3. Your hosting platform's error logs
4. The URL of your deployed app
