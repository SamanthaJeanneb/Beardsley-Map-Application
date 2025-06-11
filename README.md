# Beardsley Map Application

The Beardsley Map Application is an interactive, map-based portfolio used to present architectural and engineering projects from Beardsley Architects + Engineers. The application includes project filtering, administrative controls, CSV import/export, and is mobile-responsive.

## Features

* Interactive map showing project locations by coordinates
* Search and filter projects by market sector, status, and keyword
* CSV import and export capabilities for project data
* Add, edit, and delete projects using admin modals
* Project image galleries with zoom functionality
* Admin login for secure access to content management features
* Mobile-responsive design for use on all screen sizes

## Getting Started

### Prerequisites

* Node.js and npm installed
* Supabase credentials (optional; falls back to local IndexedDB if not set)

### Installation

```bash
git clone https://github.com/SamanthaJeanneb/Beardsley-Map-Application.git
cd Beardsley-Map-Application
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following entries:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=admin_email
VITE_ADMIN_PASSWORD=admin_password
```

These values are used for Supabase integration and admin login.

### Run the Application

```bash
npm run dev
```

## Project Structure

```
/src
├── components              # Reusable UI and modal components
├── data                    # Static data such as market sectors
├── types                   # TypeScript types and interfaces
├── utils                   # CSV parser and database helpers
├── App.tsx                 # Main application component
└── index.tsx               # Application entry point
```

## Admin Mode

To access admin features:

1. Click the three-dot menu in the header.
2. Select "Admin Login".
3. Use the credentials set in the `.env` file.

Admin features include adding, editing, deleting, importing, and exporting project data, as well as bulk deletion.

## Deployment

This project is built with Vite and can be deployed on services like Vercel or Netlify. Be sure to configure environment variables in the deployment settings to match your local `.env` values.


Created by Samantha Brown
