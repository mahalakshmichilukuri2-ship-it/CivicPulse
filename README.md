
# 🌍 CivicPulse – Smart Community Problem Reporting System

## 📌 Project Overview

CivicPulse is a Smart Community Problem Reporting System developed using React.js. It provides a user-friendly platform where citizens can report community issues such as garbage accumulation, water leakage, and damaged roads. Users can submit issues, view reported problems, and track their current status. The application also provides admin-side features to manage reported issues.

## ✨ Features

- Report community issues with title, category, location, and description.
- Upload and preview issue images.
- Dashboard displaying total, reported, in-progress, and resolved issues.
- Search and filter issues by category.
- Sort reported issues.
- View detailed issue information.
- Edit and delete reported issues.
- Admin-side issue status management.
- Store issue information using browser localStorage.
- Responsive user interface.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| JavaScript | Application functionality |
| HTML5 | Web page structure |
| CSS3 | Styling |
| Bootstrap | Responsive design |
| localStorage | Browser-side data persistence |

## 📂 Project Structure

```text
CivicPulse/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js
- npm
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/mahalakshmichilukuri2-ship-it/CivicPulse.git
```

### 2. Navigate to the Project Folder

```bash
cd CivicPulse
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

Open the local URL displayed in your terminal. Usually:

```text
http://localhost:5173/
```

### 5. Build for Production

```bash
npm run build
```

## 🔐 Environment Variables

No environment variables are required for the current frontend-only version.

## 🗄️ API and Database Notes

- The current version does not use a backend API.
- No external database such as MySQL or MongoDB is connected.
- Browser localStorage is used to store issue information.
- Data is stored locally in the browser and is not automatically shared across devices or users.

## 👩‍💻 Team Member Contributions

**Project Developer: Chilukuri Mahalakshmi**

This is an individual project. I worked on:

- Designing and developing the CivicPulse user interface.
- Implementing issue reporting functionality.
- Developing dashboard statistics.
- Implementing issue status management.
- Developing search, filtering, and sorting features.
- Implementing edit and delete functionality.
- Using browser localStorage for data persistence.
- Testing the frontend application.

## 🚀 Future Enhancements

- Backend integration using Flask or another backend framework.
- Database integration using MySQL.
- Secure user authentication and role-based access.
- Real-time issue status updates.
- Location mapping.
- Server-side notifications.


