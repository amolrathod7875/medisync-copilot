Build a full production-grade frontend for "MediSync — AI Discharge & Handoff Copilot", 

a clinical documentation app for doctors. The backend is FastAPI running at 

[http://localhost:8000](http://localhost:8000). Wire every UI action to real API calls. 

Use React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, and Zustand for state.

════════════════════════════════════════════════

 BACKEND API REFERENCE (Base URL: [http://localhost:8000](http://localhost:8000))

════════════════════════════════════════════════

All endpoints live under /api/v1/

── HEALTH ──────────────────────────────────────

GET  /api/v1/health

  Response: { status, service, version, timestamp }

── UPLOAD ──────────────────────────────────────

POST /api/v1/upload/

  Body: multipart/form-data  { file: File }

  Supported types: .pdf .png .jpg .jpeg .tiff .csv .json .txt (max 50MB)

  Response: {

    file_id, filename, file_type, status: "uploaded",

    processed: true,

    document: { document_id, filename, file_type, content, metadata },

    uploaded_at

  }

POST /api/v1/upload/batch

  Body: multipart/form-data  { files: File[] }

  Response: { total_files, results: [...], uploaded_at }

── DOCUMENTS ───────────────────────────────────

GET    /api/v1/documents/?patient_id=&limit=50&offset=0

  Response: { total, documents: [{ document_id, patient_id, filename,

              file_type, content, chunks, metadata, created_at, status }] }

GET    /api/v1/documents/{document_id}

DELETE /api/v1/documents/{document_id}

POST   /api/v1/documents/{document_id}/chunk

  Response: { document_id, chunks: [{chunk_id, content, metadata}], chunk_count }

── SUMMARY ─────────────────────────────────────

POST /api/v1/summary/generate

  Body JSON: {

    patient_id: string,

    document_ids: string[],

    summary_type: "discharge" | "handoff",

    include_citations: boolean

  }

  Response: {

    summary_id, patient_id, summary_type,

    content: {

      chief_complaint: string,

      diagnosis: string[],

      medications: [{ name, dosage, frequency, route }],

      allergies: string[],

      vitals: { blood_pressure, heart_rate, temperature, respiratory_rate },

      procedures_performed: string[],

      follow_up_instructions: string,

      discharge_disposition: string

    },

    citations: [{ claim, source_document, chunk_id }],

    generated_at, status

  }

GET  /api/v1/summary/?patient_id=&limit=50&offset=0

  Response: { total, summaries: [...] }

GET  /api/v1/summary/{summary_id}

PUT  /api/v1/summary/{summary_id}/edit

  Body JSON: { ...edited content object }

POST /api/v1/summary/{summary_id}/sign-off

  Body JSON: { signed_by: "Dr. Sarah Chen" }

  Response: { ...summary, status: "signed", signed_by, signed_at }

DELETE /api/v1/summary/{summary_id}

════════════════════════════════════════════════

 GLOBAL LAYOUT

════════════════════════════════════════════════

Overall shell: full viewport height, no scroll on body.

Left: narrow dark icon sidebar (w-16, bg-slate-900) with icon-only nav buttons 

  and tooltip labels on hover.

Right: flex-col containing a top bar (h-14, white) and a scrollable main area.

Top bar content:

  - Breadcrumb trail on the left

  - Center: patient quick-info pill (avatar initials + name + MRN + green status dot)

  - Right: notification bell with red dot badge + doctor avatar (initials "SC", 

    violet-purple gradient)

Sidebar icons (lucide-react) top-to-bottom:

  LayoutDashboard → /dashboard (active = blue-600 bg)

  UploadCloud     → /upload

  FolderOpen      → /documents

  ClipboardList   → /patients (placeholder)

  Settings        → /settings (placeholder)

  ── spacer ──

  LogOut          → bottom (hover = rose text)

Logo at top of sidebar: small rounded square with Zap icon, 

blue-to-cyan gradient, animate-pulse-ring.

════════════════════════════════════════════════

 PAGE 1 — DASHBOARD  (route: /)

════════════════════════════════════════════════

Left patient panel (w-72, white, border-r):

  A) Patient Hero Card

     - Blue gradient banner (from-blue-700 to-cyan-500), h-24

     - White rounded-2xl avatar card centered, "JD" initials in blue-700

     - Below banner: patient name (bold), MRN (mono font), "In-Patient · Active" 

       pill (amber, pulsing dot)

     - Chips row: 65 yrs · Male · B+ · Cardiac Telemetry · Bed 4B

     - Info rows (icon + label + value): Admitted · Physician · Ward · Diagnosis

     - Chief Complaint block: amber-50 bg, amber border-l-4, AlertCircle icon, 

       "Acute Chest Pain" bold

     - Allergies section: rose-100 pills per allergy (Penicillin, Sulfa)

  B) Current Vitals  (2×3 grid of small tiles)

     Each tile has: icon, bold large value + unit, label, trend arrow + delta

     Tile colors: normal=emerald-50/border, elevated=amber-50/border, critical=rose-50/border

     Vitals data (hardcoded for now, will be replaced by real patient data later):

       Heart Rate     78 bpm    normal   stable  ±0

       Blood Pressure 142/88 mmHg elevated up    +8

       Temperature    98.6 °F   normal   stable  ±0

       SpO₂           97 %      normal   down    -1

       Resp. Rate     18 /min   normal   stable  ±0

       Pain Score     6 /10     elevated down    -2

     Header: "Current Vitals" + Clock icon + "Live" text + pulsing green dot

  C) Upload Records zone (at the bottom of patient panel)

     Dashed border, rounded-xl, hover→blue-400 border + blue-50 bg

     UploadCloud icon, "Upload Records" label, "PDF · DOCX · JPG" hint

     On click → opens file picker → calls POST /api/v1/upload/ 

     Show upload progress bar while in flight

     On success → add document to documents list in Zustand store

Right main panel (flex-1, bg with subtle dot-grid pattern):

  Panel header row:

    Left: page title "AI Discharge Copilot" (Sparkles icon) + subtitle

    Right: "Summary Ready" emerald badge (visible after generation) + 

           "Generate Summary" shimmer-gradient button

  Three tabs below header:

    [FileText]    Discharge Summary

    [Pill]        Medications

    [StickyNote]  Timeline

  ── Tab: Discharge Summary ──

  If no summary yet:

    Empty state centered: large Sparkles icon in white card, 

    "Ready to Generate" heading, description, 

    3 feature cards: Discharge Plan / Clinical Notes / Handoff Ready

  When "Generate Summary" clicked:

    1. Call POST /api/v1/summary/generate with:

       { patient_id: "patient-001", document_ids: [all doc IDs from store],

         summary_type: "discharge", include_citations: true }

    2. Show shimmer/skeleton loading state in the summary card

    3. On response: render content using typewriter character-by-character effect 

       (6 chars per 16ms tick)

    4. Render structured content from response.content:

       - chief_complaint as a highlighted amber block

       - diagnosis as a bulleted list with blue dots

       - medications as a small table (name | dose | freq | route)

       - allergies as rose pills

       - vitals as a compact 2-col grid

       - procedures_performed as bullet list

       - follow_up_instructions as a teal info block

       - discharge_disposition as a badge

    5. Citations section at the bottom:

       Each citation = grey card with claim text + source_document chip + chunk_id

  Sticky export bar at bottom (inside summary card):

    "Export as:" label + [Copy Text] [PDF] [Markdown] buttons

    Copy calls navigator.clipboard.writeText()

    PDF and Markdown show a toast "Coming soon"

  ── Tab: Medications ──

  White card with table header "Active Medication List" + drug count badge

  Rows: Pill icon | Name (bold) | dose · freq · route | Active/PRN badge

  Use the medications array from the last generated summary content

  If no summary: show empty state "Generate a summary to see medications"

  ── Tab: Timeline ──

  Vertical timeline spine (colored dot + vertical line between events)

  Hardcoded events (replace with real data after backend wires up):

    08:30  admission   Admitted via ED. IV access x2. ECG obtained.

    09:00  lab         Troponin I: 2.5 ng/mL (elevated). Cardiology paged.

    10:15  consult     Cardiology consult: Dr. Patel. Recommends serial enzymes + echo.

    13:00  imaging     Echocardiogram: EF 55%, no wall motion abnormalities.

    16:45  lab         Repeat Troponin I: 1.9 ng/mL (trending down). Stable.

    20:00  note        Patient reports pain 6/10. NTG 0.4mg SL given. Relief in 5 min.

  Event type → dot color: admission=blue, lab=purple, consult=teal, imaging=indigo, note=slate

  Each event = white rounded card with type badge + timestamp + event text

════════════════════════════════════════════════

 PAGE 2 — UPLOAD  (route: /upload)

════════════════════════════════════════════════

Full upload center page. Header breadcrumb: MediSync → Upload Records.

Top stats row (3 cards):

  Total Uploaded | Processed | Pending

Large drag-and-drop zone (center):

  - Dashed border, rounded-2xl, min-h-64

  - UploadCloud large icon, title "Drop clinical documents here"

  - Subtitle "PDF, PNG, JPG, JPEG, TIFF, CSV, JSON, TXT — max 50MB each"

  - "Browse Files" button (blue gradient)

  - Hover state: blue border + blue-50 bg

On file drop / browse:

  - For each file call POST /api/v1/upload/ with multipart form

  - Show per-file progress card: filename chip, file-type icon, progress bar (0→100%), 

    then ✓ success / ✗ error state

  - On success store returned document in Zustand documents store

Below drop zone: "Uploaded Documents" table

  Columns: # | Filename | Type | Size | Uploaded At | Status | Actions

  Actions: [View] [Delete → calls DELETE /api/v1/documents/{id}]

  Status chips: uploaded (emerald), processing (amber+spin), error (rose)

  Empty state: "No documents uploaded yet" with illustration

════════════════════════════════════════════════

 PAGE 3 — DOCUMENTS  (route: /documents)

════════════════════════════════════════════════

Header: "Document Library" + count badge + search input (filter by filename)

On mount: call GET /api/v1/documents/?limit=50 and populate list.

Grid of document cards (3-col on desktop, 2-col tablet, 1-col mobile):

  Each card:

    - File type icon (large, colored bg): PDF=rose, CSV=green, JSON=blue, IMG=violet, TXT=slate

    - Filename (bold, truncated)

    - file_type chip + file size

    - created_at (relative: "2 hours ago")

    - status badge

    - Footer: [View Content] [Delete] buttons

"View Content" opens a slide-over / sheet panel on the right:

  - Document filename as title

  - Tabs: [Raw Text] [Chunks]

  - Raw Text: monospace scrollable pre block

  - Chunks tab: shows chunked content if status = "chunked", else a 

    "Process Chunks" button that calls POST /api/v1/documents/{id}/chunk

    Each chunk = numbered card with chunk_id + content preview

════════════════════════════════════════════════

 PAGE 4 — SUMMARIES  (route: /summaries)

════════════════════════════════════════════════

On mount: call GET /api/v1/summary/?limit=50

Header: "Generated Summaries" + count + "New Summary" button (→ navigates to Dashboard)

Table columns: # | Patient ID | Type | Status | Generated At | Signed By | Actions

  Type chip: discharge=blue, handoff=teal

  Status chip: generated=amber, edited=purple, signed=emerald

  Actions: [View] [Sign Off → POST /api/v1/summary/{id}/sign-off] 

           [Delete → DELETE /api/v1/summary/{id}]

"View" opens a full-screen modal or a route /summaries/{id}:

  - Same structured content render as Dashboard summary tab

  - Edit mode: toggle to make all text fields editable, 

    save calls PUT /api/v1/summary/{id}/edit

  - "Sign Off" button (only if status != "signed"): 

    opens modal with "Signing as: Dr. Sarah Chen" confirm → 

    calls POST /api/v1/summary/{id}/sign-off

    On success show: ✓ signed badge + signed_by + signed_at

════════════════════════════════════════════════

 GLOBAL STATE  (Zustand store)

════════════════════════════════════════════════

interface AppStore {

  // Backend status

  backendOnline: boolean

  checkBackendHealth: () => Promise<void>

  // Documents

  documents: Document[]

  fetchDocuments: () => Promise<void>

  addDocument: (doc: Document) => void

  removeDocument: (id: string) => void

  // Summaries

  summaries: Summary[]

  activeSummary: Summary | null

  fetchSummaries: () => Promise<void>

  setActiveSummary: (s: Summary | null) => void

  // Upload

  uploadQueue: UploadItem[]

  addToQueue: (file: File) => void

  updateQueueItem: (id: string, update: Partial<UploadItem>) => void

}

On app load: run checkBackendHealth() → if offline show a top banner 

"Backend offline — running in demo mode" (amber bar with AlertCircle icon)

════════════════════════════════════════════════

 TYPES

════════════════════════════════════════════════

interface Document {

  document_id: string

  patient_id?: string

  filename: string

  file_type: string

  content: string

  chunks: Chunk[]

  metadata: Record<string, any>

  created_at: string

  status: "created" | "chunked" | "error"

}

interface Chunk {

  chunk_id: string

  content: string

  metadata: Record<string, any>

}

interface SummaryContent {

  chief_complaint: string

  diagnosis: string[]

  medications: { name: string; dosage: string; frequency: string; route: string }[]

  allergies: string[]

  vitals: { blood_pressure: string; heart_rate: string; temperature: string; respiratory_rate: string }

  procedures_performed: string[]

  follow_up_instructions: string

  discharge_disposition: string

}

interface Citation {

  claim: string

  source_document: string

  chunk_id: string

}

interface Summary {

  summary_id: string

  patient_id: string

  summary_type: "discharge" | "handoff"

  content: SummaryContent

  citations: Citation[]

  document_ids: string[]

  generated_at: string

  status: "generated" | "edited" | "signed"

  signed_by?: string

  signed_at?: string

  edited_at?: string

}

interface UploadItem {

  id: string

  file: File

  progress: number

  status: "pending" | "uploading" | "done" | "error"

  result?: Document

  error?: string

}

════════════════════════════════════════════════

 DESIGN TOKENS

════════════════════════════════════════════════

Font: Inter (Google Fonts)

Border radius: rounded-xl for cards, rounded-2xl for hero elements

Shadows: shadow-sm on cards, shadow-md on hover, shadow-lg on modals

Background: bg-slate-50 with a subtle radial-dot CSS pattern on main areas

Scrollbar: thin (5px), rounded, slate-200 track, slate-400 thumb

Color palette:

  Primary blue:  #1d4ed8  (blue-700)

  Cyan accent:   #0891b2  (cyan-600)

  Gradient btn:  from-blue-600 to-cyan-500 (shimmer animation)

  Sidebar bg:    #0f172a  (slate-900)

  Card bg:       #ffffff

  Page bg:       #f8fafc  (slate-50)

  Success:       #10b981  (emerald-500)

  Warning:       #f59e0b  (amber-500)

  Danger:        #f43f5e  (rose-500)

  Text primary:  #0f172a  (slate-900)

  Text secondary:#64748b  (slate-500)

  Border:        #e2e8f0  (slate-200)

CSS animations to add in globals.css:

  @keyframes shimmer: slide gradient 3s infinite (for generate button)

  @keyframes pulse-ring: box-shadow pulse 2s infinite (for logo)

  @keyframes fadeInUp: opacity 0 → 1, translateY 12px → 0, 0.4s ease

  @keyframes blink: opacity 1 → 0 → 1, 1s step-end (for typewriter cursor |)

  Custom scrollbar: 5px, slate-200 track, slate-300 thumb

Utility classes:

  .bg-dot-grid: radial-gradient dot pattern, 24px spacing, slate-50 base

  .shimmer-btn: gradient background-size 200%, animated shimmer

  .typing-cursor::after: content "|", animate blink, text-blue-500

  .glass: bg white/85, backdrop-blur-12px

════════════════════════════════════════════════

 TOAST / NOTIFICATIONS

════════════════════════════════════════════════

Use sonner or react-hot-toast for toasts:

  - File upload success: "✓ filename.pdf uploaded successfully"  (green)

  - File upload error: "✗ Upload failed: {error message}"  (red)

  - Summary generated: "✓ Discharge summary generated"  (green)

  - Summary signed: "✓ Signed off by Dr. Sarah Chen"  (green)

  - Copy success: "✓ Copied to clipboard"  (green)

  - Backend offline: persistent amber top banner (not a toast)

════════════════════════════════════════════════

 IMPORTANT NOTES FOR LOVABLE

════════════════════════════════════════════════

1. All API calls should use a central apiClient or fetch wrapper with base URL 

   [http://localhost:8000](http://localhost:8000) and proper error handling.

2. The backend is NOT yet connected — use mock/demo data as fallback 

   when API calls fail, so the UI always looks populated and functional.

3. Demo patient data (hardcode as fallback):

   Name: John Doe | Age: 65 | Gender: Male | Blood Group: B+

   MRN: MRN-2024-001234 | Ward: Cardiac Telemetry | Bed: 4B

   Attending: Dr. Sarah Chen | Diagnosis: Rule out Acute MI

   Chief Complaint: Acute Chest Pain | Allergies: Penicillin, Sulfa

4. The "Generate Summary" button always works even with no uploaded documents — 

   in that case pass document_ids: [] (the backend will use its own context).

5. Do NOT include any authentication / login page — the app is single-user (doctor).

6. The app is NOT mobile-first — optimize for 1440px desktop / clinical workstation 

   widescreen monitors. Responsive down to 1024px is nice-to-have.

7. All shadcn/ui components should be properly initialized 

   (Card, Button, Badge, ScrollArea, Separator, Sheet, Dialog, Tabs, Progress, Toast).