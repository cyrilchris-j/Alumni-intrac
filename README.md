# NEXORA Alumni Network

A comprehensive web platform connecting students, alumni, and administrators to foster mentorship, career opportunities, and professional networking.

## Project Overview

NEXORA Alumni Network is a full-stack monorepo built with a modern tech stack featuring:

- **Frontend**: React 19 with TypeScript, Vite bundler, TailwindCSS
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Database**: Firebase Firestore for user profiles and data
- **UI Components**: Radix UI with customizable theming
- **Monorepo Management**: pnpm workspaces

## Project Structure

```
Alumni-intrac/
├── artifacts/
│   ├── nexora-alumni/           # Main React frontend application
│   ├── api-server/              # Express.js backend API (Node.js)
│   └── mockup-sandbox/          # Sandbox environment for testing
├── lib/
│   ├── api-client-react/        # React hooks for API consumption
│   ├── api-spec/                # API specifications
│   ├── api-zod/                 # Zod schemas for validation
│   └── db/                      # Database utilities and models
├── scripts/                     # Build and utility scripts
└── package.json                 # Workspace root configuration
```

## Features

### Student Dashboard
- Browse and search alumni directory
- Find mentorship opportunities
- Access job postings and internships
- View upcoming webinars and events
- Connect with alumni professionals

### Alumni Dashboard
- Maintain and update professional profile
- View and manage connections
- Post job opportunities
- Mentor students
- Share success stories
- Participate in webinars and events

### Admin Dashboard
- Manage alumni directory
- Monitor student users
- Moderate job postings
- Organize events and webinars
- Track donations and contributions
- View analytics and reports

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (npm install -g pnpm)

### Installation

1. **Clone and navigate to the project**
```bash
cd Alumni-intrac
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start the development server**
```bash
cd artifacts/nexora-alumni
pnpm run dev
```

The frontend will be available at `http://localhost:5173/`

### Available Scripts

**Frontend (nexora-alumni)**
```bash
pnpm run dev          # Start dev server with hot module replacement
pnpm run build        # Build for production
pnpm run serve        # Preview production build
pnpm run typecheck    # Run TypeScript type checking
```

**API Server**
```bash
cd artifacts/api-server
pnpm run dev          # Start API server with auto-reload
pnpm run build        # Build for production
pnpm run typecheck    # Run type checking
```

**Workspace**
```bash
pnpm run build        # Build all packages
pnpm run typecheck    # Type check entire workspace
```

## Authentication Flow

### Firebase Configuration
The application uses Firebase for authentication and data storage. Configuration is located in:
- `artifacts/nexora-alumni/src/services/firebase.js`

Default Firebase project: `onestopalumni` (can be customized)

### Auth Context
Central authentication context managing:
- User session state
- Role-based access control (student/alumni/admin)
- Profile data synchronization
- Google OAuth integration

Location: `artifacts/nexora-alumni/src/context/AuthContext.jsx`

## Role-Based Access Control

### User Roles
- **Student**: Access to alumni directory, mentorship, jobs, webinars
- **Alumni**: Full profile management, posting jobs, mentoring, networking
- **Admin**: System administration, moderation, analytics

Protected routes ensure users can only access sections appropriate for their role.

## Database Schema (Firestore)

### Users Collection
```javascript
{
  uid: string,
  email: string,
  role: 'student' | 'alumni' | 'admin',
  name: string,
  displayName: string,
  photoURL: string,
  profileRole: string,
  company: string,
  location: string,
  about: string,
  education: [{degree, year, college}],
  experience: [{company, position, duration}],
  linkedin: string,
  website: string,
  createdAt: timestamp
}
```

## Performance Optimizations

### Code Splitting
- Lazy loading of dashboard components
- Vendor bundle splitting (React, UI, Forms)
- Dynamic imports for better initial load time

### Build Metrics
- Main bundle: ~523 KB (164 KB gzipped)
- Vendor React: ~47.9 KB (16.8 KB gzipped)
- Vendor UI: ~0.5 KB (0.3 KB gzipped)
- Lazy-loaded dashboard chunks: 8-25 KB each

## UI Components

Built with Radix UI and TailwindCSS:
- Dialogs & Modals
- Dropdown menus
- Tabs & Accordions
- Form controls
- Progress indicators
- Cards & Layouts
- Tooltips & Popovers

All components are customizable via CSS variables and Tailwind theming.

## Styling

### CSS Variables (Design Tokens)
- Primary color: LinkedIn Blue (#0077B5)
- Background: Light surface colors
- Text: Semantic foreground/secondary colors

Location: `artifacts/nexora-alumni/src/index.css`

### TailwindCSS
- Mobile-first responsive design
- Utility-first styling approach
- Custom typography and spacing scales

Configuration: `tailwind.config.ts`

## Development Guidelines

### TypeScript
- Strict mode enabled
- Component interfaces well-defined
- Type checking enforced in build

### ESLint & Prettier
- Code formatting on save
- Consistent code style across project
- Pre-commit hooks recommended

### Testing
Integration and e2e testing recommended for:
- Authentication flows
- Role-based access
- Data persistence

## Deployment

### Production Build
```bash
cd artifacts/nexora-alumni
pnpm run build
```

Output: `dist/public/` directory

### Deployment Options
- Vercel (recommended for Next.js-like features)
- GitHub Pages (static hosting)
- Docker containers
- Traditional web servers (Node.js + static serving)

## Environment Variables

### Firebase Configuration
Set in `src/services/firebase.js`:
```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### Optional
- `BASE_URL`: Custom base path for deployments
- `BASE_PATH`: Vite base path configuration
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting

### Build Issues
- Clear node_modules: `pnpm install --force`
- Clear build cache: `rm -rf dist/`
- Verify TypeScript: `pnpm run typecheck`

### Auth Issues
- Check Firebase project security rules
- Verify API key and domain configuration
- Clear browser localStorage and cookies

### Port Already in Use
- Default port: 5173
- Override: `PORT=3000 pnpm run dev`

## Future Enhancements

- [ ] Real-time messaging system
- [ ] Video call integration
- [ ] Advanced search and filters
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Payment integration
- [ ] API documentation (OpenAPI/Swagger)

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a pull request

## License

MIT - See LICENSE file for details

## Support

For issues, questions, or feedback:
- Create an issue in the repository
- Contact the development team
- Check documentation in `/docs`

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite 7.3 |
| Styling | TailwindCSS 4 |
| UI Components | Radix UI |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Routing | React Router 7 |
| State Management | React Context + Hooks |
| Authentication | Firebase Auth |
| Database | Firebase Firestore |
| Package Manager | pnpm |
| Monorepo | pnpm workspaces |

## Project Status

✅ **Fully Functional**
- All authentication flows working
- Dashboard navigation complete
- Role-based access control implemented
- Firebase integration operational
- Production build optimized

Ready for deployment and testing.
