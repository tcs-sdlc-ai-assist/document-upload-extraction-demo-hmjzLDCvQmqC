# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-15

### Added

#### Authentication
- Frontend-only authentication system using `localStorage` for session persistence
- User signup with name, email, and password (password hashing via SHA-256 simulation)
- User login with email and password credential validation
- Session management with expiry tracking and automatic logout
- Protected routes that redirect unauthenticated users to the login page
- `AuthContext` React context provider exposing `user`, `session`, `isAuthenticated`, `isLoading`, `login`, `signup`, and `logout`
- `useAuth` custom hook for consuming authentication context throughout the app

#### Document Upload
- Drag-and-drop file upload area with visual feedback for drag-over state
- Click-to-browse file picker as an alternative to drag-and-drop
- File type validation supporting PDF (`.pdf`), DOCX (`.docx`), and plain text (`.txt`) files
- File size validation with a configurable maximum (default 10 MB via `VITE_MAX_FILE_SIZE_MB`)
- Real-time upload progress bar with descriptive status labels
- Disabled upload state during active extraction to prevent concurrent uploads

#### Text Extraction
- PDF text extraction using `pdfjs-dist` with page-by-page content aggregation
- DOCX text extraction using `mammoth` converting Word documents to plain text
- Plain text file extraction using the `FileReader` API
- Automatic retry logic (up to 3 attempts) for transient extraction failures
- Text cleaning pipeline: null byte removal, control character stripping, formatting artifact removal, whitespace normalization, and non-printable character filtering
- Extraction status tracking (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) via in-memory `extractionStatusManager`

#### Document History
- Persistent document history stored in `localStorage` under a namespaced key
- `DocumentCard` component displaying file name, type badge, size, timestamp, extraction status, and a collapsible text preview
- Full history page listing all past uploads in reverse-chronological order
- Ability to clear entire document history
- `useDocumentHistory` custom hook for history state management with reactive updates

#### Extraction Result Display
- `ExtractionResult` component showing full extracted text with metadata (file name, type, size, timestamp, status)
- Color-coded status badges for each extraction state
- Copy-to-clipboard support for extracted text
- Graceful empty state when no document has been processed yet

#### Navigation & Layout
- `MainLayout` shell with collapsible sidebar and persistent header for authenticated pages
- `Sidebar` navigation with links to Dashboard, Upload, and History pages
- `Header` displaying the application name and a user profile/logout control
- `ProtectedRoute` component guarding all authenticated pages
- `NotFoundPage` 404 fallback for unknown routes
- React Router v6 `BrowserRouter` with declarative `Routes` and `Route` definitions

#### Dashboard
- Summary statistics: total documents processed and most recent upload date
- Quick-action buttons linking to the Upload and History pages
- Personalized greeting using the authenticated user's name

#### Error Handling
- `StatusMessage` component supporting `success`, `error`, `warning`, and `info` message types with dismissal
- Inline form validation errors on Login and Signup forms
- Extraction error messages stored alongside failed documents in history
- `localStorage` access wrapped in a safe utility layer (`storageUtils`) that handles unavailable storage gracefully

### Technical Stack

- **React 18** — UI library with concurrent features
- **TypeScript 5** — Static typing throughout the entire codebase
- **Vite 5** — Fast development server and optimized production bundler
- **React Router v6** — Client-side routing with nested route support
- **Tailwind CSS 3** — Utility-first CSS framework with custom brand and neutral color palettes
- **pdfjs-dist 4** — Mozilla PDF.js for in-browser PDF text extraction
- **mammoth 1.7** — DOCX-to-text conversion library
- **uuid 9** — RFC 4122 UUID generation for document and session identifiers
- **Vitest 1** — Unit and integration test runner compatible with Vite
- **@testing-library/react 14** — React component testing utilities

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_NAME` | `Doc Upload Extraction` | Application display name shown in the UI |
| `VITE_MAX_FILE_SIZE_MB` | `10` | Maximum allowed upload file size in megabytes |

### Notes

- All data (users, sessions, documents) is stored exclusively in the browser's `localStorage`. There is no backend server or database.
- Authentication is frontend-only and is **not suitable for production security** — it is intended as a demonstration of auth flow patterns.
- PDF.js requires a worker script; the worker is loaded from the `pdfjs-dist` package via a CDN-compatible path configured in `documentExtractor.ts`.
- The application is deployed as a single-page application (SPA) with Vercel rewrite rules configured in `vercel.json` to support client-side routing.

[1.0.0]: https://github.com/your-org/doc-upload-extraction/releases/tag/v1.0.0