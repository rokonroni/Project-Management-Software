# Project Management Software

A modern, full-stack project management solution built with Next.js 15.5, MongoDB, and TypeScript. Features role-based access control, real-time task management, and team collaboration tools.

![Project Management Software](https://rokonroni-pms.vercel.app/)

## 🌟 Features

### For Managers

- Create and manage multiple projects
- Assign tasks to team members
- Track project progress with detailed statistics
- Monitor task completion rates
- Communicate with team through comments

### For Developers

- View assigned tasks and subtasks
- Update task status and progress
- Break down tasks into subtasks
- Collaborate through comments
- Track personal performance

### General Features

- 🔐 Role-based authentication (Manager/Developer)
- 📊 Interactive dashboards with real-time updates
- 💬 Comment system for team communication
- 📱 Responsive design for all devices
- 🎯 Task priority management
- 📅 Deadline tracking
- 🔄 Project status monitoring

## 🛠️ Tech Stack

- **Frontend:**

  - Next.js 15.5
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - React Hot Toast

- **Backend:**

  - MongoDB
  - JWT Authentication
  - Next.js API Routes

- **Development Tools:**
  - pnpm
  - ESLint
  - Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB connection string

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rokonroni/project-management-software.git
cd project-management-software
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── (auth)/        # Authentication routes
│   ├── (dashboard)/   # Protected dashboard routes
│   └── api/           # API routes
├── components/        # React components
│   ├── auth/          # Authentication components
│   ├── developer/     # Developer-specific components
│   ├── manager/       # Manager-specific components
│   └── shared/        # Shared components
├── lib/               # Utility functions and middleware
├── models/            # MongoDB models
└── types/             # TypeScript type definitions
```

## 🔑 Authentication

The application uses JWT-based authentication with two roles:

- **Manager:** Can create projects, assign tasks, and manage team
- **Developer:** Can manage assigned tasks and update progress

## 📱 Screenshots

### Manager Dashboard

![Manager Dashboard](https://your-screenshot-url.com)

### Developer Dashboard

![Developer Dashboard](https://your-screenshot-url.com)

### Task Management

![Task Management](https://your-screenshot-url.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Rokon Roni**

- GitHub: [@rokonroni](https://github.com/rokonroni)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- MongoDB for database
- All contributors and supporters

---

Made with ❤️ by Rokon Roni
