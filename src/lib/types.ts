export interface Chunk {
  chunk_id: string;
  content: string;
  metadata: Record<string, any>;
}

export interface Document {
  document_id: string;
  patient_id?: string;
  filename: string;
  file_type: string;
  content: string;
  chunks: Chunk[];
  metadata: Record<string, any>;
  created_at: string;
  status: "created" | "chunked" | "error";
}

export interface SummaryContent {
  chief_complaint: string;
  diagnosis: string[];
  medications: { name: string; dosage: string; frequency: string; route: string }[];
  allergies: string[];
  vitals: { blood_pressure: string; heart_rate: string; temperature: string; respiratory_rate: string };
  procedures_performed: string[];
  follow_up_instructions: string;
  discharge_disposition: string;
}

export interface Citation {
  claim: string;
  source_document: string;
  chunk_id: string;
}

export interface Summary {
  summary_id: string;
  patient_id: string;
  summary_type: "discharge" | "handoff";
  content: SummaryContent;
  citations: Citation[];
  document_ids: string[];
  generated_at: string;
  status: "generated" | "edited" | "signed";
  signed_by?: string;
  signed_at?: string;
  edited_at?: string;
}

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  result?: Document;
  error?: string;
}
