# Flashcards

A minimal, open-source flashcard app built with React Native and Expo. Create decks, study with a TikTok-style quiz interface, and track your progress with built-in statistics.

## Features

- **Deck management** — Create, edit, and delete decks of flashcards
- **Quiz mode** — Full-screen, swipeable card interface (TikTok-style vertical scroll for questions, Instagram Stories-style flip for answers)
- **Markdown support** — Questions and answers support Markdown formatting, including images
- **Statistics** — Track study sessions with difficulty ratings (easy/medium/hard) and view charts over time
- **Import / Export** — Share decks as JSON files or import from a URL
- **Backup & Restore** — Full database backup and restore
- **Search** — Full-text search across decks and flashcards (FTS5 on native, LIKE fallback on web)
- **E2E tests** — Full user-flow coverage with Maestro using stable `testID` selectors
- **i18n** — Italian, English, Spanish, French, German (auto-detects device language)
- **Dark / Light theme** — Neutral, eye-friendly color palette in both modes

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Framework  | React Native + Expo (SDK 54)  |
| Navigation | Expo Router                   |
| UI         | Tamagui (Inter font family)   |
| State      | Zustand                       |
| Database   | Expo SQLite (with migrations) |
| Forms      | React Hook Form               |
| Animations | React Native Reanimated, Skia |
| i18n       | i18next + react-i18next       |

## Project Structure

This is a Turborepo monorepo with two workspaces:

```
flashcards/
├── apps/
│   ├── app/                    # React Native (Expo) application
│   │   ├── app/                # Screens (Expo Router file-based routing)
│   │   │   ├── (tabs)/         # Bottom tab navigator
│   │   │   │   ├── index.tsx   #   Decks tab (home)
│   │   │   │   ├── statistics.tsx
│   │   │   │   └── settings.tsx
│   │   │   ├── deck/           # Deck routes
│   │   │   ├── flashcard-edit/
│   │   │   ├── settings/
│   │   │   └── read-more/
│   │   ├── components/         # Reusable UI components
│   │   ├── store/              # Zustand store
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Database and import/export helpers
│   │   ├── types/              # TypeScript type definitions
│   │   ├── i18n/               # Translations
│   │   └── assets/             # Static assets
│   └── site/                   # Website workspace (placeholder)
├── turbo.json                  # Turborepo configuration
└── package.json                # Root workspace config
```

## Data Model

```typescript
type Deck = {
  id: number;
  title: string;
  description?: string;
  createdAt: string; // ISO date
};

// Standard flashcard (question + answer)
type StandardFlashcard = {
  id: number;
  type: 'standard';
  question: string; // Markdown
  answer: string; // Markdown
  deckId: number;
};

// Multiple-choice flashcard (question + options)
type MultipleChoiceFlashcard = {
  id: number;
  type: 'multiple_choice';
  question: string; // Markdown
  deckId: number;
  options: FlashcardOption[];
};

type FlashcardOption = {
  id: number;
  text: string;
  isCorrect: boolean;
};

type Flashcard = StandardFlashcard | MultipleChoiceFlashcard;
```

Quiz sessions and answers are tracked in separate tables for statistics.

## Getting Started

### Prerequisites

- Node.js (with npm)
- Expo CLI
- iOS Simulator / Android Emulator (or a physical device with Expo Go)

### Install & Run

```bash
# Install dependencies
npm install

# Start the Expo dev server
cd apps/app && npm run start

# Or run on a specific platform
cd apps/app && npm run ios
cd apps/app && npm run android
```

### Available Scripts (root)

| Script                      | Description                      |
| --------------------------- | -------------------------------- |
| `npm run dev`               | Start all workspaces in dev mode |
| `npm run build`             | Build all workspaces             |
| `npm run lint`              | Lint all workspaces              |
| `npm run format`            | Format code with Prettier        |
| `npm run format:check`      | Check code formatting            |

### Available Scripts (`apps/app`)

| Script                  | Description                   |
| ----------------------- | ----------------------------- |
| `npm run start`         | Start Expo dev server         |
| `npm run start:e2e`     | Start Expo dev server for E2E |
| `npm run ios`           | Run on iOS                    |
| `npm run android`       | Run on Android                |
| `npm run build:ios`     | Create iOS release build      |
| `npm run build:android` | Create Android release build  |
| `npm run build:web`     | Build static web bundle       |
| `npm run e2e`           | Run Maestro E2E suite         |
| `npm run e2e:android`   | Run Maestro E2E on Android    |
| `npm run e2e:ios`       | Run Maestro E2E on iOS        |

### EAS in this Turborepo

Per la configurazione monorepo di Expo, l'app EAS di questo repository e` `apps/app/`.

- Esegui i comandi EAS da `apps/app/`, ad esempio `cd apps/app && npx eas-cli build --platform ios`.
- I file EAS restano dentro `apps/app/` (`apps/app/eas.json`, eventuale `apps/app/credentials.json`).
- Il lockfile npm e la configurazione workspace restano in root (`package-lock.json` e `package.json`), come previsto da npm workspaces.

Questo allinea il progetto al pattern suggerito da Expo per i monorepo: EAS parte da `apps/app`, mentre lockfile e configurazione workspace restano nella root del repository.

### Web SEO configuration

When building for web, the app uses `EXPO_PUBLIC_SITE_URL` to generate canonical and social metadata URLs.

```bash
cd apps/app && EXPO_PUBLIC_SITE_URL=https://your-domain.example npm run build:web
```

If not provided, it falls back to `https://flashcards.deploynk.com`.

## E2E Testing (Maestro)

The E2E suite is located in `apps/app/.maestro/` and covers all screens and core app functionalities (deck/flashcard CRUD, study, quiz, statistics, and settings flows).

### Prerequisites

- Install Maestro CLI: https://docs.maestro.dev/getting-started/installing-maestro
- Start the app on a simulator/device (for example with `cd apps/app && npm run ios` or `cd apps/app && npm run android`)

### Run tests

```bash
# Auto-select available simulator/device
cd apps/app && npm run e2e

# Force Android
cd apps/app && npm run e2e:android

# Force iOS
cd apps/app && npm run e2e:ios
```

Entry flow: `apps/app/.maestro/main.yaml`.

## Import / Export Format

Decks can be imported and exported as JSON. Flashcards can be standard (question + answer) or multiple-choice (question + options):

```json
{
  "title": "My Deck",
  "description": "Optional description",
  "flashcards": [
    {
      "question": "What is 2 + 2?",
      "answer": "**4**"
    },
    {
      "question": "Which planet is closest to the Sun?",
      "type": "multiple_choice",
      "options": [
        { "text": "Mercury", "isCorrect": true },
        { "text": "Venus", "isCorrect": false },
        { "text": "Earth", "isCorrect": false },
        { "text": "Mars", "isCorrect": false }
      ]
    }
  ]
}
```

Standard flashcards only require `question` and `answer`. Multiple-choice flashcards require `type: "multiple_choice"`, at least 2 options, and exactly one option with `isCorrect: true`.

Import supports both local files and remote URLs.

## License

This project is open source. See the repository for license details.
