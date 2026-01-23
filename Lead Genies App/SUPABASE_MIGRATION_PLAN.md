# Supabase Migration Plan

## Übersicht
Migration der Lead Genies App von Base44 Backend zu Supabase Backend.

**Ziel:** Vollständig funktionsfähige App mit Supabase als Backend (Datenbank + Auth + Storage)

---

## 1. Supabase Setup (Manuell - vom User durchzuführen)

### 1.1 Supabase Projekt erstellen
1. Gehe zu https://supabase.com
2. Erstelle ein kostenloses Konto
3. Klicke auf "New Project"
4. Gib einen Namen ein: `lead-genies-app`
5. Wähle ein starkes Passwort (speichere es!)
6. Wähle Region: `Central EU (Frankfurt)` (am nächsten zu Deutschland)
7. Warte ~2 Minuten bis das Projekt erstellt ist

### 1.2 API Keys kopieren
1. Gehe zu Settings → API
2. Kopiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon public** Key (sieht aus wie `eyJhbGc...`)

---

## 2. Datenbank-Schema erstellen

### 2.1 Tabellen

**Customers** (Kunden)
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  requires_tech_expertise BOOLEAN DEFAULT false,
  min_appointments_per_week INTEGER DEFAULT 2,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Alle können lesen (da keine Auth)
CREATE POLICY "Enable read access for all users" ON customers
  FOR SELECT USING (true);

-- Policy: Alle können erstellen
CREATE POLICY "Enable insert access for all users" ON customers
  FOR INSERT WITH CHECK (true);

-- Policy: Alle können updaten
CREATE POLICY "Enable update access for all users" ON customers
  FOR UPDATE USING (true);

-- Policy: Alle können löschen
CREATE POLICY "Enable delete access for all users" ON customers
  FOR DELETE USING (true);
```

**Employees** (Mitarbeiter)
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Minijob', 'Teilzeit', 'Springer')),
  has_tech_skills BOOLEAN DEFAULT false,
  max_customers INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies (gleiche wie bei customers)
CREATE POLICY "Enable read access for all users" ON employees
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employees
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employees
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON employees
  FOR DELETE USING (true);
```

**Customer Assignments** (Zuordnungen)
```sql
CREATE TABLE customer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, employee_id)
);

-- Enable Row Level Security
ALTER TABLE customer_assignments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON customer_assignments
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customer_assignments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customer_assignments
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customer_assignments
  FOR DELETE USING (true);
```

**Weekly Reports** (Wochenberichte)
```sql
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  week_number INTEGER,
  year INTEGER,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON weekly_reports
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON weekly_reports
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON weekly_reports
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON weekly_reports
  FOR DELETE USING (true);
```

**Courses** (Schulungen/Kurse)
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON courses
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON courses
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON courses
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON courses
  FOR DELETE USING (true);
```

**Modules** (Kurs-Module)
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON modules
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON modules
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON modules
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON modules
  FOR DELETE USING (true);
```

**Lessons** (Lektionen)
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON lessons
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON lessons
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON lessons
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON lessons
  FOR DELETE USING (true);
```

**Quizzes** (Quiz)
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON quizzes
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON quizzes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON quizzes
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON quizzes
  FOR DELETE USING (true);
```

**User Progress** (Lernfortschritt)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON user_progress
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_progress
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON user_progress
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON user_progress
  FOR DELETE USING (true);
```

**Quiz Results** (Quiz-Ergebnisse)
```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON quiz_results
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON quiz_results
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON quiz_results
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON quiz_results
  FOR DELETE USING (true);
```

### 2.2 Datenbank erstellen (Manuell)
1. Gehe in Supabase zu **SQL Editor**
2. Kopiere das komplette SQL von oben
3. Klicke auf "Run"
4. Fertig! ✅

---

## 3. Code-Änderungen (Automatisch - von Claude)

### 3.1 Dependencies aktualisieren
**package.json** - Supabase SDK hinzufügen:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

Entfernen:
- `@base44/sdk`
- `@base44/vite-plugin`

### 3.2 Supabase Client erstellen
**Neue Datei:** `src/api/supabaseClient.js`
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Neue Datei:** `.env.local` (für lokale Entwicklung)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3.3 Daten-Layer abstrahieren
**Neue Datei:** `src/api/entities.js`

Wrapper um Supabase CRUD-Operationen zu vereinfachen:

```javascript
export const createEntity = (tableName) => ({
  async list(orderBy = 'created_at') {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending: false })

    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  },

  async delete(id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async filter(filters) {
    let query = supabase.from(tableName).select('*')

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
})

export const entities = {
  Customer: createEntity('customers'),
  Employee: createEntity('employees'),
  CustomerAssignment: createEntity('customer_assignments'),
  WeeklyReport: createEntity('weekly_reports'),
  Course: createEntity('courses'),
  Module: createEntity('modules'),
  Lesson: createEntity('lessons'),
  Quiz: createEntity('quizzes'),
  UserProgress: createEntity('user_progress'),
  QuizResult: createEntity('quiz_results'),
}
```

### 3.4 Alte Base44-Aufrufe ersetzen

**Alle Files ändern:**
- `src/pages/Customers.jsx`
- `src/pages/Employees.jsx`
- `src/pages/Assignments.jsx`
- `src/pages/WeeklyEntry.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/Wochenreporting.jsx`
- `src/pages/Courses.jsx`
- `src/pages/Progress.jsx`
- `src/pages/Admin.jsx`
- `src/pages/CourseDetail.jsx`
- `src/pages/Lesson.jsx`
- `src/pages/Quiz.jsx`

**Änderungen:**
```javascript
// ALT (Base44)
import { base44 } from '@/api/base44Client';
const { data } = useQuery({
  queryFn: () => base44.entities.Customer.list('-created_date')
});

// NEU (Supabase)
import { entities } from '@/api/entities';
const { data } = useQuery({
  queryFn: () => entities.Customer.list('created_at')
});
```

### 3.5 File Upload für Reports
**Wochenreporting.jsx** - Upload anpassen:

```javascript
// ALT (Base44)
import { UploadFile } from "@/api/integrations";

// NEU (Supabase Storage)
import { supabase } from '@/api/supabaseClient';

const uploadFile = async (file) => {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('reports')
    .getPublicUrl(fileName)

  return publicUrl
}
```

**Supabase Storage Bucket erstellen:**
1. Gehe in Supabase zu **Storage**
2. Klicke "New Bucket"
3. Name: `reports`
4. Public: ✅ (Ja)
5. Speichern

### 3.6 Auth entfernen (da nicht benötigt)
**Entfernen:**
- `src/lib/AuthContext.jsx` (Datei löschen)
- Alle Auth-Provider aus App.jsx entfernen

---

## 4. Vercel Environment Variables setzen

Nach dem Push zu GitHub, in Vercel:

1. Gehe zu deinem Projekt → Settings → Environment Variables
2. Füge hinzu:
   - `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGc...`
3. Speichern & Redeploy

---

## 5. Testing Checklist

Nach der Migration testen:

- [ ] Kunden erstellen
- [ ] Kunden bearbeiten
- [ ] Kunden löschen
- [ ] Mitarbeiter erstellen
- [ ] Mitarbeiter bearbeiten
- [ ] Zuordnungen erstellen (Drag & Drop)
- [ ] Dashboard lädt Daten
- [ ] Wochenreporting funktioniert
- [ ] Schulungen anzeigen
- [ ] Kurs erstellen (Admin)
- [ ] Lektion absolvieren
- [ ] Quiz machen

---

## 6. Rollback-Plan (falls etwas schief geht)

1. Git zurücksetzen: `git reset --hard HEAD~1`
2. Alte Version nochmal pushen
3. Problem analysieren

---

## Zeitplan

- **Schritt 1-2** (Supabase Setup + DB): ~10 Minuten (manuell vom User)
- **Schritt 3** (Code ändern): ~30-45 Minuten (automatisch von Claude)
- **Schritt 4** (Vercel Config): ~2 Minuten (manuell vom User)
- **Schritt 5** (Testing): ~10 Minuten

**Gesamt: ~1 Stunde**

---

## Nächste Schritte

1. ✅ Plan erstellt
2. ⏳ User erstellt Supabase Projekt
3. ⏳ User erstellt Datenbank (SQL ausführen)
4. ⏳ Claude ändert Code
5. ⏳ User pusht zu GitHub
6. ⏳ User setzt Vercel Environment Variables
7. ✅ Fertig!
