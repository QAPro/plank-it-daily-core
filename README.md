# Inner Fire - Fitness PWA

A progressive web application for fitness tracking and community engagement.

## 🚀 Deployment

This project uses automated CI/CD with separate staging and production environments:

- **Production:** https://www.innerfire.fit (main branch)
- **Staging:** https://inner-fire-git-develop-phils-projects-36ed4b87.vercel.app (develop branch)

### Deployment Workflow

- Push to `main` → Automatic production deployment
- Push to `develop` → Automatic staging deployment  
- Pull requests → Automatic preview deployment with URL comment

## 🛠️ Technologies

This project is built with:

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn-ui
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

## 💻 Local Development

### Prerequisites

- Node.js 18+ & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup

```sh
# Clone the repository
git clone https://github.com/QAPro/plank-it-daily-core.git

# Navigate to the project directory
cd plank-it-daily-core

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📝 Development Workflow

1. Create a feature branch from `develop`
2. Make your changes and test locally
3. Push your branch and create a Pull Request
4. Review the automatic preview deployment
5. Merge to `develop` for staging
6. Merge to `main` for production

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📚 Documentation

- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)
- [Custom Domain Setup](./CUSTOM_DOMAIN_SETUP.md)
- [CI/CD Setup](./CI_CD_SETUP.md)
- [Staging Environment](./STAGING.md)

## 🔐 Environment Variables

Required environment variables are managed through Vercel:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `VITE_VAPID_PUBLIC_KEY` - Web push notification public key
- `VAPID_PRIVATE_KEY` - Web push notification private key (server-side only)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ for the Inner Fire community**
