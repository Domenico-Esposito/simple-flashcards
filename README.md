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
├── app/                        # React Native (Expo) application
│   ├── app/                    # Screens (Expo Router file-based routing)
│   │   ├── (tabs)/             # Bottom tab navigator
│   │   │   ├── index.tsx       #   Decks tab (home)
│   │   │   ├── statistics.tsx  #   Statistics tab
│   │   │   └── settings.tsx    #   Settings tab
│   │   ├── deck/               # Deck routes
│   │   │   ├── new.tsx         #   Create deck
│   │   │   └── [id]/           #   Deck detail, edit, quiz, flashcard CRUD
│   │   ├── flashcard-edit/     # Flashcard editing
│   │   ├── settings/           # Backup, import, export, reset, info
│   │   └── read-more/          # Read more view
│   ├── components/             # Reusable UI components
│   │   ├── screens/            #   Screen-level components (Home, Quiz, Stats, etc.)
│   │   └── ui/                 #   Low-level UI (Markdown renderer, rich text editor, icons)
│   ├── store/                  # Zustand store (flashcards.ts)
│   ├── hooks/                  # Custom hooks (color scheme, alerts, stats, forms)
│   ├── utils/                  # Database, migrations, FTS, import/export helpers
│   ├── types/                  # TypeScript type definitions
│   ├── constants/              # Theme colors and configuration
│   ├── i18n/                   # Translations (it, en, es, fr, de)
│   └── assets/                 # Static assets (images, fonts)
├── site/                       # Website workspace (placeholder)
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
npm run app:start

# Or run on a specific platform
npm run app:ios
npm run app:android
```

### Available Scripts (root)

| Script                      | Description                      |
| --------------------------- | -------------------------------- |
| `npm run dev`               | Start all workspaces in dev mode |
| `npm run build`             | Build all workspaces             |
| `npm run lint`              | Lint all workspaces              |
| `npm run format`            | Format code with Prettier        |
| `npm run format:check`      | Check code formatting            |
| `npm run app:start`         | Start Expo dev server            |
| `npm run app:ios`           | Run on iOS                       |
| `npm run app:android`       | Run on Android                   |
| `npm run app:build:ios`     | Create iOS release build         |
| `npm run app:build:android` | Create Android release build     |
| `npm run app:build:web`     | Build static web bundle          |
| `npm run app:e2e`           | Run Maestro E2E suite            |
| `npm run app:e2e:android`   | Run Maestro E2E on Android       |
| `npm run app:e2e:ios`       | Run Maestro E2E on iOS           |

## E2E Testing (Maestro)

The E2E suite is located in `app/.maestro/` and covers all screens and core app functionalities (deck/flashcard CRUD, study, quiz, statistics, and settings flows).

### Prerequisites

- Install Maestro CLI: https://docs.maestro.dev/getting-started/installing-maestro
- Start the app on a simulator/device (for example with `npm run app:ios` or `npm run app:android`)

### Run tests

```bash
# Auto-select available simulator/device
npm run app:e2e

# Force Android
npm run app:e2e:android

# Force iOS
npm run app:e2e:ios
```

Entry flow: `app/.maestro/main.yaml`.

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
