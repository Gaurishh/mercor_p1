# Mercor Time Tracker

A comprehensive employee time tracking and monitoring system with desktop and web applications.

## 🌐 Live Demo

**Web Admin Panel**: [inciteful-webapp.onrender.com](https://inciteful-webapp.onrender.com)

**Desktop App**: Download from [GitHub Releases](https://github.com/your-username/mercor_p1/releases)

## ✨ Features

### Desktop App (Employee)

- ⏰ Real-time time tracking (clock in/out)
- 📸 Automatic and manual screenshot capture
- 📋 Task management and assignment
- 🔒 IP/MAC address tracking for security
- 🚪 Auto clock-out on app close

### Web Admin Panel

- 👥 Employee management and monitoring
- 📊 Real-time employee status dashboard
- 🎯 Project and task management
- 📸 Remote screenshot capture
- 📈 Time log analysis and reports

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB
- Cloudinary account
- SMTP server

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm start
```

### Web Admin Setup

```bash
cd web-admin
npm install
npm start
```

### Desktop App Setup

```bash
cd desktop
npm install
npm run electron-dev
```

## 🏗️ Architecture

- **Frontend**: React 18, Redux Toolkit, Electron
- **Backend**: Node.js, Express.js, MongoDB
- **External Services**: Cloudinary (image storage), SMTP (emails)
- **Security**: bcryptjs, email verification, IP/MAC tracking

## 📱 Screenshots

_Add screenshots of the desktop app and web admin panel here_

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [inciteful-webapp.onrender.com](https://inciteful-webapp.onrender.com)
- **Desktop App**: [GitHub Releases](https://github.com/Gaurishh/mercor_p1/releases)
- **Issues**: [GitHub Issues](https://github.com/Gaurishh/mercor_p1/issues)
