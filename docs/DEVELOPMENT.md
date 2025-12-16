# Kinna Development Guide

## Project Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Initial Setup

1. **Clone and Install**
```bash
git clone https://github.com/RentableBalloon/Kinna.git
cd Kinna
npm run install-all
```

2. **Database Setup**
```bash
# Create PostgreSQL database
createdb kinna_db

# Run schema
psql kinna_db < database/schema.sql
```

3. **Environment Configuration**

Backend (.env):
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

Frontend (.env):
```bash
cd packages/frontend
cp .env.example .env
```

4. **Run Development Servers**

Terminal 1 - Backend:
```bash
cd packages/backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd packages/frontend
npm run dev
```

Terminal 3 - Desktop (optional):
```bash
cd packages/desktop
npm run dev
```

Terminal 4 - Mobile (optional):
```bash
cd packages/mobile
npm start
```

## Project Structure

```
Kinna/
├── packages/
│   ├── backend/          # Node.js + Express API
│   │   ├── src/
│   │   │   ├── config/   # Database & config
│   │   │   ├── middleware/  # Auth, upload, etc.
│   │   │   ├── routes/   # API routes
│   │   │   └── index.ts  # Entry point
│   │   └── package.json
│   │
│   ├── frontend/         # React + Vite web app
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/    # Page components
│   │   │   ├── store/    # Zustand state management
│   │   │   ├── lib/      # API client
│   │   │   └── App.tsx   # Main app
│   │   └── package.json
│   │
│   ├── mobile/           # React Native + Expo
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── desktop/          # Electron wrapper
│       ├── main.js
│       └── package.json
│
├── database/             # SQL schemas
│   └── schema.sql
│
├── docs/                 # Documentation
│   └── API.md
│
└── package.json          # Root package
```

## Key Technologies

### Backend
- **Express**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Database
- **JWT**: Authentication
- **Multer**: File uploads
- **Bcrypt**: Password hashing

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Zustand**: State management
- **React Router**: Navigation
- **React Hook Form**: Form handling
- **Axios**: HTTP client

### Mobile
- **React Native**: Mobile framework
- **Expo**: Development platform

### Desktop
- **Electron**: Desktop wrapper

## Development Tips

### Adding New Features

1. **Backend Route**
```typescript
// packages/backend/src/routes/feature.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  // Implementation
});

export default router;
```

2. **Frontend Page**
```typescript
// packages/frontend/src/pages/Feature.tsx
export default function Feature() {
  // Implementation
  return <div>Feature</div>;
}
```

3. **Add Route**
```typescript
// packages/frontend/src/App.tsx
<Route path="/feature" element={<Feature />} />
```

### Database Changes

After modifying schema.sql:
```bash
psql kinna_db < database/schema.sql
```

### Common Commands

```bash
# Install dependencies
npm run install-all

# Development
npm run dev:backend
npm run dev:frontend
npm run dev:desktop
npm run dev:mobile

# Build
npm run build:backend
npm run build:frontend
npm run build:desktop

# Start production
npm run start:backend
npm run start:frontend
```

## Testing

Create tests in:
- Backend: `packages/backend/src/__tests__/`
- Frontend: `packages/frontend/src/__tests__/`

Run tests:
```bash
cd packages/backend && npm test
cd packages/frontend && npm test
```

## Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, DigitalOcean, AWS EC2
- Set environment variables
- Ensure PostgreSQL is accessible

### Frontend (Static)
- Deploy to: Vercel, Netlify, AWS S3 + CloudFront
- Build: `npm run build`
- Deploy `dist/` folder

### Database
- Use managed PostgreSQL: AWS RDS, Heroku Postgres, Supabase

### Desktop
- Build installers: `npm run build` in packages/desktop
- Distribute .exe (Windows), .dmg (Mac), .AppImage (Linux)

### Mobile
- Build with Expo: `expo build:android` / `expo build:ios`
- Submit to Google Play / App Store

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License - Midas Studios
