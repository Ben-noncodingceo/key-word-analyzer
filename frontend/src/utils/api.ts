import type { AnalyzeRequest, AnalyzeResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api/analyze';

export async function analyzeArticle(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
