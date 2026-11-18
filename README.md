# Wortschatz MM 🇩🇪🇲🇲

> **A modern, intuitive German vocabulary learning application tailored for Myanmar and English-speaking learners.**  
> Built with React 18, Vite, TypeScript, Tailwind CSS, Firebase, and Capacitor for Web, iOS, and Android.

---

## 1. Project Description

**Wortschatz MM** is an open, cross-platform German vocabulary learning application designed to bridge the language gap for learners whose native or preferred languages are **Myanmar (မြန်မာ)** and **English**.

Learning German requires mastering grammatical nuances that many language apps overlook—specifically grammatical gender (`der`, `die`, `das`), plural variations, irregular verb conjugations, and contextual usage. **Wortschatz MM** provides:

- **Structured Curriculum**: Organized according to the Common European Framework of Reference for Languages (**CEFR Levels: A1, A2, B1, B2, C1, C2**).
- **Dual-Language Context**: Every vocabulary entry includes dual translations in both **Myanmar (မြန်မာ)** and **English**, complete with example sentences.
- **Accurate Grammar Essentials**: Clear distinctions for noun genders, plural forms, verb conjugations (*3rd person, Präteritum, Partizip II*), and comparative/superlative adjective forms.
- **Cross-Platform Access**: A single unified codebase running as a responsive Web app and native iOS & Android applications via Capacitor.
- **Offline Reliability**: Full multi-tab local persistence so learners can search and study without an active internet connection.

---

## 2. Features

### 📊 Interactive Dashboard
- **Live Database Synchronization**: Dynamic metrics connected directly to Cloud Firestore, displaying real-time word counts for each CEFR level.
- **Level Summary Cards**: Pastel visual cards with progress bars that let you jump directly into pre-filtered study sets.
- **Smart Curated Decks**: Quick-access drill entry points for *"Top 100 Most Frequent"* words and *"Article Mastery Drill"*.

### 📖 Searchable Word Bank (Dictionary)
- **Multi-Field Instant Search**: High-speed search matching across German headwords, English definitions, Myanmar translations, and German plurals.
- **Granular Filter System**:
  - **CEFR Levels**: Filter by `A1`, `A2`, `B1`, `B2`, `C1`, `C2`, or view all.
  - **Word Types**: Quick pills for `Nouns`, `Verbs`, `Adjectives`, `Phrases`, and `Sentences`.
  - **16 Life Categories**: Greetings, People, Home, Food, Shopping, Travel, Work, Education, Health, Nature, Time, Places, Emotions, Clothing, Leisure, and Other.
- **Rich Vocabulary Cards**:
  - Color-coded grammatical article pills (`der` indigo, `die` rose, `das` emerald).
  - Plural forms and grammar tips.
  - Verb conjugations and adjective comparisons.
  - Example sentences in German accompanied by English and Myanmar translations.

### 🔊 Audio Pronunciation
- **Native German Pronunciation**: Integrated Text-to-Speech using native German (`de-DE`) voices for natural listening practice.

### 📴 Offline Persistence & Resilience
- **Zero-Network Usability**: Powered by Firestore `persistentLocalCache` (multi-tab IndexedDB).
- **Network Status Detector**: Automatic online/offline indicator banner—search and study without interruption even when offline.

### 🔐 Administrative & Data Tools
- **Secure Admin Authentication**: Firebase Auth login for authorized content managers.
- **In-App Vocabulary Editor**: Create, edit, and update words directly in Cloud Firestore.
- **Batch Import & Export**:
  - Drag-and-drop or paste `.json` / `.csv` vocabulary datasets.
  - Automated pre-import validation (valid entries, duplicates, fallbacks).
  - Duplicate detection with optional overwrite controls.
  - One-click full JSON database backup export.

### 📱 Mobile-First Responsive Shell
- **Desktop**: Top sticky navbar with active indicators and quick admin actions.
- **Mobile**: Native header, safe-area inset padding (`pb-safe`, `pt-safe`), floating action triggers, and bottom pill navigation.

---

## 3. Tech Stack

| Domain | Technology / Library | Description |
|---|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) | Component-based user interface architecture |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Next-generation fast frontend tooling and HMR |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict static typing for bug prevention and maintainability |
| **Styling & Design** | [Tailwind CSS 3](https://tailwindcss.com/) + PostCSS | Utility-first responsive design matching modern mobile aesthetics |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent, lightweight SVG iconography |
| **Backend & Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) | Scalable NoSQL real-time document database |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) | Secure admin authentication and session management |
| **Local Cache** | Firestore Persistent Cache | Multi-tab IndexedDB persistence for offline-first operation |
| **Mobile Runtime** | [Capacitor 7](https://capacitorjs.com/) | Cross-platform bridge for native iOS & Android apps |
| **Speech Audio** | Web Speech API | Client-side native `de-DE` pronunciation synthesis |

---

## 4. Contributing & Issue Reporting

We welcome contributions from the community! Whether you are fixing a typo, improving a Myanmar translation, adding new German vocabulary, or reporting a bug, your help makes Wortschatz MM better for everyone.

### 🐛 Reporting Issues

If you encounter a bug, incorrect translation, or grammar error, feel free to open an issue on GitHub:


---
