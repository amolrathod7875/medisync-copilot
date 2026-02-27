const BASE_URL = "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => request<{ status: string; service: string; version: string; timestamp: string }>("/health"),

  uploadFile: (file: File, onProgress?: (p: number) => void) => {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/upload/`);
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    });
  },

  getDocuments: (limit = 50, offset = 0) =>
    request<{ total: number; documents: any[] }>(`/documents/?limit=${limit}&offset=${offset}`),

  getDocument: (id: string) => request<any>(`/documents/${id}`),

  deleteDocument: (id: string) => request<any>(`/documents/${id}`, { method: "DELETE" }),

  chunkDocument: (id: string) =>
    request<{ document_id: string; chunks: any[]; chunk_count: number }>(`/documents/${id}/chunk`, { method: "POST" }),

  generateSummary: (body: { patient_id: string; document_ids: string[]; summary_type: string; include_citations: boolean }) =>
    request<any>("/summary/generate", { method: "POST", body: JSON.stringify(body) }),

  getSummaries: (limit = 50, offset = 0) =>
    request<{ total: number; summaries: any[] }>(`/summary/?limit=${limit}&offset=${offset}`),

  getSummary: (id: string) => request<any>(`/summary/${id}`),

  editSummary: (id: string, content: any) =>
    request<any>(`/summary/${id}/edit`, { method: "PUT", body: JSON.stringify(content) }),

  signOffSummary: (id: string, signedBy: string) =>
    request<any>(`/summary/${id}/sign-off`, { method: "POST", body: JSON.stringify({ signed_by: signedBy }) }),

  deleteSummary: (id: string) => request<any>(`/summary/${id}`, { method: "DELETE" }),
};
