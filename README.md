# Doc Upload Extraction

A document upload and text extraction application built with React 18, Vite, TypeScript, and Tailwind CSS. Upload PDF, DOCX, or TXT files and instantly extract their text content — all in the browser, with no backend required.

## Features

- **Multi-format support** — Extract text from PDF, DOCX, and TXT files
- **Drag-and-drop upload** — Intuitive file upload with drag-and-drop or file picker
- **Real-time progress** — Animated progress bar during upload and extraction
- **Document history** — Browse and review all previously extracted documents
- **Authentication** — Frontend-only signup/login with session persistence
- **Responsive design** — Works on desktop and mobile viewports
- **Persistent storage** — Documents and sessions stored in localStorage

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| PDF Extraction | pdf.js (pdfjs-dist 4) |
| DOCX Extraction | mammoth.js 1.7 |
| Unique IDs | uuid 9 |
| Testing | Vitest + Testing Library |

## Folder Structure

```
doc-upload-extraction/
├── index.html                  # HTML shell and SPA mount point
├── vite.config.ts              # Vite bundler and test runner configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript compiler configuration
├── .env.example                # Environment variable documentation template
└── src/
    ├── main.tsx                # React application bootstrap entry point
    ├── App.tsx                 # Root component with routing and context providers
    ├── index.css               # Global CSS with Tailwind directives
    ├── vite-env.d.ts           # Vite environment type declarations
    ├── types.ts                # Shared type definitions
    ├── constants.ts            # Centralized application constants
    ├── context/
    │   └── AuthContext.tsx     # React context provider for authentication state
    ├── hooks/
    │   ├── useAuth.ts          # Custom hook for authentication context
    │   ├── useDocumentHistory.ts  # Custom hook for document history state
    │   └── useFileUpload.ts    # Custom hook orchestrating upload and extraction
    ├── services/
    │   ├── authService.ts      # Frontend-only authentication service
    │   ├── documentExtractor.ts   # Core text extraction service
    │   ├── documentStorage.ts  # Persistent storage service for documents
    │   ├── extractionStatusManager.ts  # In-memory extraction status tracking
    │   └── fileHistoryManager.ts  # History management wrapping document storage
    ├── utils/
    │   ├── fileValidator.ts    # File type and size validation
    │   ├── textCleaner.ts      # Text cleaning for extracted content
    │   └── storageUtils.ts     # localStorage access abstraction
    ├── components/
    │   ├── Header.tsx          # Application header with user profile and logout
    │   ├── Sidebar.tsx         # Left sidebar navigation
    │   ├── MainLayout.tsx      # Authenticated app shell layout
    │   ├── UploadArea.tsx      # Drag-and-drop file upload area
    │   ├── DocumentCard.tsx    # Card displaying document metadata and preview
    │   ├── ExtractionResult.tsx   # Extraction results display
    │   ├── ProgressBar.tsx     # Animated progress bar
    │   ├── StatusMessage.tsx   # Status and error message display
    │   ├── ProtectedRoute.tsx  # Route guard for authenticated pages
    │   ├── LoginForm.tsx       # Login form with validation
    │   └── SignupForm.tsx      # Signup form with validation
    └── pages/
        ├── LoginPage.tsx       # Login authentication page
        ├── SignupPage.tsx      # Signup/registration page
        ├── DashboardPage.tsx   # Authenticated dashboard home page
        ├── UploadPage.tsx      # Document upload and extraction page
        ├── HistoryPage.tsx     # Document history listing page
        └── NotFoundPage.tsx    # 404 fallback page
```

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd doc-upload-extraction
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` to customize the application name and maximum file size:

```env
# Application name displayed in the UI
VITE_APP_NAME=Doc Upload Extraction

# Maximum file size allowed for upload (in megabytes)
VITE_MAX_FILE_SIZE_MB=10
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot module replacement |
| `npm run build` | Type-check and build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest test suite |
| `npm run lint` | Run ESLint across all TypeScript and TSX source files |

## Usage Guide

### Creating an Account

1. Navigate to `/signup`
2. Enter your name, email address, and a password (minimum 8 characters)
3. Click **Create Account** — you will be redirected to the dashboard

### Logging In

1. Navigate to `/login`
2. Enter your registered email and password
3. Click **Sign In** — your session will persist across page refreshes

### Uploading a Document

1. Navigate to **Upload** via the sidebar
2. Drag and drop a file onto the upload area, or click **Browse files** to open the file picker
3. Supported formats: **PDF**, **DOCX**, **TXT**
4. Maximum file size: **10 MB** (configurable via `VITE_MAX_FILE_SIZE_MB`)
5. Extraction begins automatically after the file is selected
6. The extracted text is displayed below the upload area once complete

### Viewing Document History

1. Navigate to **History** via the sidebar
2. All previously extracted documents are listed as cards
3. Each card shows the file name, type, size, extraction timestamp, and a text preview
4. The dashboard shows a summary of total documents and the most recent upload

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_NAME` | `Doc Upload Extraction` | Application name shown in the header and page title |
| `VITE_MAX_FILE_SIZE_MB` | `10` | Maximum allowed upload file size in megabytes |

All environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Tests are written with **Vitest** and **Testing Library**. The test suite covers:

- File validation logic (`src/utils/fileValidator.test.ts`)
- Text cleaning utility (`src/utils/textCleaner.test.ts`)
- Authentication service (`src/services/authService.test.ts`)
- Document storage service (`src/services/documentStorage.test.ts`)
- File upload hook (`src/hooks/useFileUpload.test.ts`)
- Authentication context (`src/context/AuthContext.test.tsx`)

## Known Limitations

- **Demo-level security** — Authentication is implemented entirely in the browser using localStorage. Passwords are hashed with a simple deterministic function and are not suitable for production use. There is no server-side validation, no HTTPS enforcement, and no protection against XSS-based token theft.
- **localStorage only** — All documents and user data are stored in the browser's localStorage. Data is not persisted across different browsers or devices, and will be lost if the user clears their browser storage. localStorage has a typical size limit of 5–10 MB.
- **No server-side extraction** — Text extraction runs entirely in the browser using pdf.js and mammoth.js. Very large or complex documents may be slow to process or may fail on low-powered devices.
- **No file upload to a server** — Files are processed in memory and never sent to a remote server. This means there is no cloud backup of uploaded documents.
- **Single user per browser** — Multiple accounts can be created, but all data is scoped to the local browser instance.
- **PDF text extraction limitations** — Scanned PDFs (image-based) cannot have their text extracted, as pdf.js only processes embedded text layers.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions including Vercel configuration.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed version history.

## License

Private — All rights reserved.