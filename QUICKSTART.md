# Quick Start Guide - NEXORA Alumni Network

Get the application running in minutes!

## 1. Prerequisites Check
Ensure you have:
- Node.js 18+ (`node --version`)
- pnpm installed (`npm install -g pnpm`)
- Git configured

## 2. Installation (2 minutes)

```bash
# Navigate to project directory
cd Alumni-intrac

# Install all dependencies
pnpm install
```

## 3. Start Development Server (1 minute)

```bash
# Navigate to the frontend app
cd artifacts/nexora-alumni

# Start the dev server
pnpm run dev
```

The application will open at: **http://localhost:5173/**

## 4. Test the Application

### Test User Accounts

Use these credentials to test different roles:

**Admin Account:**
- Email: admin@nexora.com
- Password: Admin@123

**Alumni Account:**
- Email: alumni@nexora.com
- Password: Alumni@123

**Student Account:**
- Email: student@nexora.com
- Password: Student@123

### Test Google Sign-In
Click "Sign in with Google" button on the login page

## 5. Navigation Guide

### Dashboard URLs
- **Student**: http://localhost:5173/student
- **Alumni**: http://localhost:5173/alumni
- **Admin**: http://localhost:5173/admin
- **Login**: http://localhost:5173/

### Student Features (After Login)
- Overview: Dashboard with stats
- Find Alumni: Search and connect
- Jobs & Internships: Browse opportunities
- Mentorship: Find mentors
- Webinars: View upcoming events

### Alumni Features (After Login)
- Overview: Dashboard with connections
- My Profile: Update professional info
- Connections: View network
- Jobs & Internships: Post opportunities
- Mentorship: Mentor students
- Success Stories: Share achievements

### Admin Features (After Login)
- Overview: System analytics
- Alumni Directory: Manage users
- Students: View all students
- Job Portal: Moderate job posts
- Events & Webinars: Organize events
- Donations: Track contributions

## 6. Key Features to Explore

✅ **Authentication**
- Email/password registration and login
- Google OAuth integration
- Automatic role assignment
- Session persistence

✅ **Profile Management**
- Edit professional information
- Add work experience
- Link LinkedIn/portfolio
- Upload profile photo

✅ **Networking**
- Search alumni directory
- View profiles
- Connect with professionals
- Send messages (placeholder)

✅ **Job Portal**
- Post opportunities (Alumni/Admin)
- Browse jobs (Students)
- Apply to positions
- Track applications

✅ **Responsive Design**
- Mobile-friendly interface
- Tablet optimization
- Desktop experience
- Touch-friendly navigation

## 7. Project Commands Reference

```bash
# Development
pnpm run dev              # Start development server with HMR

# Production
pnpm run build            # Create optimized production build
pnpm run serve            # Preview production build locally

# Code Quality
pnpm run typecheck        # Verify TypeScript types

# Workspace Commands (from root)
pnpm run build            # Build all packages
pnpm run typecheck        # Type check everything
```

## 8. Troubleshooting

### Port Already in Use
```bash
# Use different port
PORT=3000 pnpm run dev
```

### Dependencies Issue
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Clear Cache
```bash
# Remove build artifacts
rm -rf artifacts/nexora-alumni/dist

# Restart dev server
pnpm run dev
```

### Firebase Connection Issue
Check `artifacts/nexora-alumni/src/services/firebase.js` configuration matches your Firebase project

## 9. What's Happening Behind the Scenes

### Frontend Architecture
```
App (React Router)
├── Entry Page (Login/Signup)
├── RoleSelection (User type selection)
├── Student Dashboard (Protected)
│   ├── Overview
│   ├── Alumni Directory
│   ├── Jobs
│   ├── Mentorship
│   └── Webinars
├── Alumni Dashboard (Protected)
│   ├── Overview
│   ├── Profile
│   ├── Connections
│   ├── Jobs
│   ├── Mentorship
│   └── Stories
└── Admin Dashboard (Protected)
    ├── Overview
    ├── Alumni Directory
    ├── Students
    ├── Jobs
    ├── Events
    └── Donations
```

### Technology Stack
- **React 19**: Modern UI framework with concurrent rendering
- **Vite**: Ultra-fast bundler with instant HMR
- **TypeScript**: Type safety and better developer experience
- **Firebase**: Backend-as-a-service (Auth + Database)
- **TailwindCSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

## 10. Next Steps

1. **Explore the codebase**: Check `artifacts/nexora-alumni/src/`
2. **Customize styling**: Edit TailwindCSS in `tailwind.config.ts`
3. **Add features**: Create new components and pages
4. **Configure Firebase**: Set up your own Firebase project
5. **Deploy**: Build and deploy to your hosting platform

## 11. Useful Resources

- **React Docs**: https://react.dev
- **Vite Guide**: https://vitejs.dev
- **TailwindCSS**: https://tailwindcss.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Radix UI**: https://www.radix-ui.com

## 12. Support

Having issues? Check:
- README.md for detailed documentation
- Console logs for error messages
- Firebase console for authentication/database issues
- Browser DevTools for UI debugging

## 13. Production Deployment

When ready to deploy:

```bash
# Build for production
pnpm run build

# Output is in: artifacts/nexora-alumni/dist/public/

# Deploy to Vercel (recommended)
vercel deploy

# Or deploy to other platforms:
# - GitHub Pages
# - Netlify
# - AWS S3 + CloudFront
# - Traditional server
```

## 14. Performance Tips

✨ Already optimized with:
- Code splitting for faster initial load
- Lazy loading of dashboard components
- Efficient bundling (~164 KB gzipped)
- Caching strategies
- Responsive images

## 15. Security Checklist

Before production:
- [ ] Set environment variables securely
- [ ] Review Firebase security rules
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Use strong authentication credentials
- [ ] Implement rate limiting
- [ ] Add monitoring and logging

---

**You're all set!** 🚀

Start developing: `cd artifacts/nexora-alumni && pnpm run dev`

Questions? Check README.md or create an issue!
