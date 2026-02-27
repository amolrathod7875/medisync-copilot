import type { Document, Summary, SummaryContent, Citation } from "./types";

export const demoPatient = {
  name: "John Doe",
  initials: "JD",
  age: 65,
  gender: "Male",
  bloodGroup: "B+",
  mrn: "MRN-2024-001234",
  ward: "Cardiac Telemetry",
  bed: "4B",
  attending: "Dr. Sarah Chen",
  diagnosis: "Rule out Acute MI",
  chiefComplaint: "Acute Chest Pain",
  allergies: ["Penicillin", "Sulfa"],
  admittedDate: "2024-12-15T08:30:00Z",
  status: "Active",
};

export const demoVitals = [
  { label: "Heart Rate", value: "78", unit: "bpm", status: "normal" as const, trend: "stable" as const, delta: "±0", icon: "Heart" },
  { label: "Blood Pressure", value: "142/88", unit: "mmHg", status: "elevated" as const, trend: "up" as const, delta: "+8", icon: "Activity" },
  { label: "Temperature", value: "98.6", unit: "°F", status: "normal" as const, trend: "stable" as const, delta: "±0", icon: "Thermometer" },
  { label: "SpO₂", value: "97", unit: "%", status: "normal" as const, trend: "down" as const, delta: "-1", icon: "Wind" },
  { label: "Resp. Rate", value: "18", unit: "/min", status: "normal" as const, trend: "stable" as const, delta: "±0", icon: "Waves" },
  { label: "Pain Score", value: "6", unit: "/10", status: "elevated" as const, trend: "down" as const, delta: "-2", icon: "Flame" },
];

export const demoTimeline = [
  { time: "08:30", type: "admission", text: "Admitted via ED. IV access x2. ECG obtained.", color: "bg-blue-500" },
  { time: "09:00", type: "lab", text: "Troponin I: 2.5 ng/mL (elevated). Cardiology paged.", color: "bg-purple-500" },
  { time: "10:15", type: "consult", text: "Cardiology consult: Dr. Patel. Recommends serial enzymes + echo.", color: "bg-teal-500" },
  { time: "13:00", type: "imaging", text: "Echocardiogram: EF 55%, no wall motion abnormalities.", color: "bg-indigo-500" },
  { time: "16:45", type: "lab", text: "Repeat Troponin I: 1.9 ng/mL (trending down). Stable.", color: "bg-purple-500" },
  { time: "20:00", type: "note", text: "Patient reports pain 6/10. NTG 0.4mg SL given. Relief in 5 min.", color: "bg-slate-500" },
];

export const demoSummaryContent: SummaryContent = {
  chief_complaint: "Acute Chest Pain — substernal, radiating to left arm, onset 3 hours prior to admission",
  diagnosis: ["Acute Coronary Syndrome (NSTEMI)", "Hypertension, uncontrolled", "Hyperlipidemia"],
  medications: [
    { name: "Aspirin", dosage: "325mg", frequency: "Daily", route: "PO" },
    { name: "Metoprolol", dosage: "50mg", frequency: "BID", route: "PO" },
    { name: "Atorvastatin", dosage: "80mg", frequency: "QHS", route: "PO" },
    { name: "Heparin", dosage: "5000 units", frequency: "Q8H", route: "SubQ" },
    { name: "Nitroglycerin", dosage: "0.4mg", frequency: "PRN", route: "SL" },
  ],
  allergies: ["Penicillin", "Sulfa"],
  vitals: { blood_pressure: "142/88 mmHg", heart_rate: "78 bpm", temperature: "98.6 °F", respiratory_rate: "18 /min" },
  procedures_performed: ["12-lead ECG", "Serial Troponin I", "Echocardiogram", "IV access x2"],
  follow_up_instructions: "Follow up with Cardiology (Dr. Patel) within 1 week. Continue medications as prescribed. Return to ED if chest pain recurs, worsens, or new symptoms develop. Low-sodium, heart-healthy diet. Cardiac rehab referral placed.",
  discharge_disposition: "Home with follow-up",
};

export const demoCitations: Citation[] = [
  { claim: "Troponin I elevated at 2.5 ng/mL", source_document: "lab_results_dec15.pdf", chunk_id: "chunk-001" },
  { claim: "EF 55% on echocardiogram", source_document: "echo_report.pdf", chunk_id: "chunk-003" },
  { claim: "Patient allergic to Penicillin", source_document: "admission_notes.pdf", chunk_id: "chunk-005" },
];

export const demoSummary: Summary = {
  summary_id: "demo-summary-001",
  patient_id: "patient-001",
  summary_type: "discharge",
  content: demoSummaryContent,
  citations: demoCitations,
  document_ids: [],
  generated_at: new Date().toISOString(),
  status: "generated",
};

export const demoDocuments: Document[] = [
  {
    document_id: "doc-001",
    patient_id: "patient-001",
    filename: "admission_notes.pdf",
    file_type: "pdf",
    content: "Patient John Doe, 65M, presented to ED with acute chest pain...",
    chunks: [],
    metadata: { size: 245000 },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "created",
  },
  {
    document_id: "doc-002",
    patient_id: "patient-001",
    filename: "lab_results_dec15.pdf",
    file_type: "pdf",
    content: "Lab Results:\nTroponin I: 2.5 ng/mL (H)\nBMP: Normal\nCBC: WBC 8.2...",
    chunks: [],
    metadata: { size: 182000 },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: "created",
  },
  {
    document_id: "doc-003",
    patient_id: "patient-001",
    filename: "echo_report.pdf",
    file_type: "pdf",
    content: "Echocardiogram Report:\nEF: 55%\nNo wall motion abnormalities...",
    chunks: [],
    metadata: { size: 320000 },
    created_at: new Date(Date.now() - 1800000).toISOString(),
    status: "chunked",
  },
];
