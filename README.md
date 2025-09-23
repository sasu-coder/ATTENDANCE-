# AI Attendance System

## 🎯 Project Overview

A modern AI-driven attendance system with QR code generation, face recognition, and comprehensive lecturer/student portals.

## ✨ Features

### **For Lecturers**
- **Modern QR Generator**: Professional course-based QR codes with download/copy functionality
- **Session Management**: Real-time attendance tracking and analytics
- **Student Analytics**: Performance tracking, scoring, and export capabilities
- **Multi-format Export**: PDF, Excel, and JSON reports

### **For Students**  
- **QR Code Scanning**: Enhanced 8-second minimum scan time for realistic detection
- **Face Recognition**: iPhone-style phased detection with MediaPipe integration
- **GPS Verification**: Location-based attendance confirmation
- **Real-time Feedback**: Progress indicators and error handling

### **Technical Features**
- **HTTPS Ready**: Camera permissions work on secure deployments
- **Mobile Support**: Capacitor Android app integration
- **Error Handling**: AbortError fixes and graceful camera cleanup
- **Modern UI**: Professional design with shadcn/ui components

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/sasu-coder/ATTENDANCE-.git
cd ATTENDANCE-

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Mobile App

```bash
# Build Android app
npx cap build android
npx cap open android
```

## 🌐 Deployment

Deploy to HTTPS for camera access:

**Vercel (Recommended)**
1. Import from GitHub at [vercel.com](https://vercel.com)
2. Framework: Vite (auto-detected)
3. Deploy

**Netlify**
1. New site from Git at [netlify.com](https://netlify.com)
2. Build: `npm run build`, Publish: `dist`

## 🔧 Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Lucide React
- **AI/Camera**: MediaPipe Face Landmarks, QR Scanner
- **Backend**: Supabase (Auth, Database, RLS)
- **Mobile**: Capacitor (Android/iOS)
- **Deployment**: Vercel, Netlify ready
# schollattend
