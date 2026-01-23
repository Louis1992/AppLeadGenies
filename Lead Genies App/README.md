# Lead Genies App

Ressourcen-Management-App für Callcenter mit integriertem Reporting und Schulungssystem.

## Features

- **Kunden-Verwaltung**: Verwalte deinen Kundenstamm mit Anforderungsprofilen
- **Mitarbeiter-Verwaltung**: Mitarbeiter mit unterschiedlichen Status (Minijob, Teilzeit, Springer)
- **Zuordnungen**: Drag & Drop Zuordnung von Mitarbeitern zu Kunden
- **Wocheneingabe**: Erfasse wöchentliche Arbeitsberichte
- **Reports**: Wochenreporting-Generator (CSV-basiert)
- **Schulungen**: Integriertes E-Learning-System mit Kursen, Lektionen und Quizzes

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Radix UI + Tailwind CSS (Clay Design System)
- **State Management**: TanStack React Query
- **Routing**: React Router v6
- **Drag & Drop**: @hello-pangea/dnd

## Setup

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto
2. Erstelle ein neues Projekt
3. Warte bis das Projekt bereit ist (~2 Minuten)

### 2. Datenbank einrichten

1. Öffne dein Supabase Projekt
2. Gehe zu **SQL Editor**
3. Kopiere das komplette SQL aus `SUPABASE_MIGRATION_PLAN.md` (Abschnitt 2.1)
4. Führe das SQL aus

### 3. Storage Bucket erstellen

Für Reports (File-Uploads):
1. Gehe zu **Storage** in Supabase
2. Klicke auf "New Bucket"
3. Name: `reports`
4. Public: ✅ (Aktiviert)
5. Speichern

### 4. Environment Variables setzen

1. Kopiere `.env.example` zu `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Öffne `.env.local` und trage deine Supabase Credentials ein:
   - Gehe in Supabase zu **Settings → API**
   - Kopiere **Project URL** → `VITE_SUPABASE_URL`
   - Kopiere **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 5. Dependencies installieren

```bash
npm install
```

### 6. Development Server starten

```bash
npm run dev
```

Die App läuft jetzt auf [http://localhost:5173](http://localhost:5173)

## Deployment (Vercel)

### 1. GitHub Repository erstellen

```bash
git init
git add .
git commit -m "Initial commit - Supabase migration"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/AppLeadGenies.git
git push -u origin main
```

### 2. Vercel Deployment

1. Gehe zu [vercel.com](https://vercel.com)
2. Importiere dein GitHub Repository
3. Setze die Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Bekannte Einschränkungen

⚠️ **CSV-Datenextraktion (Wochenreporting)** ist nach der Supabase-Migration noch nicht verfügbar.

Die ursprüngliche Base44-Version nutzte AI zur automatischen Extraktion von Daten aus CSV-Dateien. Um diese Funktion zu reaktivieren, muss eine AI-API integriert werden (z.B. OpenAI, Claude).

**Workaround**: Implementiere manuelle CSV-Parsing-Logik oder integriere OpenAI/Claude API.

Siehe `SUPABASE_MIGRATION_PLAN.md` für Details zur Migration und fehlenden Features.

## Projektstruktur

```
src/
├── api/
│   ├── supabaseClient.js        # Supabase Client Setup
│   ├── entities.js               # CRUD-Wrapper für Datenbank
│   └── supabase-integrations.js # File-Upload und Integrationen
├── components/
│   ├── ui/                       # Radix UI Components
│   ├── dashboard/                # Dashboard-Components
│   └── reporting/                # Reporting-Components
├── pages/
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Employees.jsx
│   ├── Assignments.jsx
│   ├── WeeklyEntry.jsx
│   ├── Wochenreporting.jsx
│   ├── Courses.jsx               # Schulungen
│   ├── Progress.jsx
│   ├── Admin.jsx
│   ├── CourseDetail.jsx
│   ├── Lesson.jsx
│   └── Quiz.jsx
├── lib/
│   ├── query-client.js           # React Query Config
│   ├── NavigationTracker.jsx
│   └── PageNotFound.jsx
├── App.jsx                        # Main App Component
├── Layout.jsx                     # Navigation & Layout
└── pages.config.js               # Routing Config
```

## Scripts

```bash
npm run dev        # Development Server
npm run build      # Production Build
npm run preview    # Preview Production Build
npm run lint       # ESLint
npm run lint:fix   # ESLint Auto-Fix
```

## Support

Bei Fragen oder Problemen, siehe `SUPABASE_MIGRATION_PLAN.md` oder erstelle ein Issue.

## License

Proprietary - © Lead Genies
