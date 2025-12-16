# Kinna - Social Media for Book Readers
[![Deploy to GitHub Pages](https://github.com/RentableBalloon/Kinna/actions/workflows/deploy.yml/badge.svg)](https://github.com/RentableBalloon/Kinna/actions/workflows/deploy.yml)

**By Midas Studios**

Kinna is a premium social media platform designed by readers, for readers. Connect, discuss your favorite books, authors, series, genres, theories, and characters in a beautifully designed interface with Midas gold accents.

## 🌐 Live Site

**Frontend**: [https://rentableballoon.github.io/Kinna/](https://rentableballoon.github.io/Kinna/)

> ⚠️ **Note**: Backend API must be deployed separately. See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions.

## Features

- 📚 **Book-Centric Forums** - Reddit-style forums for each book with community moderation
- 👥 **Like-Minded Communities** - Connect with readers who share your interests
- 🔍 **Smart Search** - Find books, characters, and content easily
- 📝 **Rich Posts** - Create posts with text and media
- 🎯 **Personalized Recommendations** - Algorithm based on your genre and author preferences
- 🔒 **Privacy Controls** - Comprehensive settings for your comfort
- 📱 **Multi-Platform** - Available as web app, desktop app, and mobile apps (iOS & Android)

## Project Structure

```
kinna-monorepo/
├── packages/
│   ├── backend/       # Node.js + Express API
│   ├── frontend/      # React + TypeScript web app
│   ├── mobile/        # React Native mobile app
│   └── desktop/       # Electron desktop app
├── database/          # PostgreSQL schemas and migrations
└── docs/              # Documentation
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Mobile**: React Native, Expo
- **Desktop**: Electron
- **Authentication**: JWT
- **File Storage**: Multer (expandable to S3)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RentableBalloon/Kinna.git
cd Kinna
```

2. Install dependencies for all packages:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
# Copy example env files in each package
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

4. Set up the database:
```bash
cd packages/backend
npm run migrate
npm run seed
```

### Development

Run all services in development mode:

```bash
# Terminal 1 - Backend API
npm run dev:backend

# Terminal 2 - Frontend Web App
npm run dev:frontend

# Terminal 3 - Desktop App
npm run dev:desktop

# Terminal 4 - Mobile App
npm run dev:mobile
```

### Production Build

```bash
npm run build:backend
npm run build:frontend
npm run build:desktop
npm run build:mobile
```

## Database Schema

See [database/schema.sql](database/schema.sql) for the complete database structure.

## API Documentation

API endpoints are documented in [docs/API.md](docs/API.md).

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details.

## Contact

Midas Studios - Building communities for readers
