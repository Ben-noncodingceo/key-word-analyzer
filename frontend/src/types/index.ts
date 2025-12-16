export interface AnalyzeRequest {
  url: string;
  provider: 'openai' | 'deepseek';
  model?: string;
  topK?: number;
  language?: string;
}

export interface AnalyzeResponse {
  platform: 'wechat' | 'xiaohongshu' | 'unknown';
  meta: ArticleMeta;
  metrics: ArticleMetrics;
  content: ArticleContent;
  ai: AIAnalysis;
  debug: DebugInfo;
}

export interface ArticleMeta {
  title: string;
  author: string;
  publishTime: string;
  wordCount: number;
}

export interface ArticleMetrics {
  views: number | string;
  replies: number | string;
  likes: number | string;
  collects: number | string;
}

export interface ArticleContent {
  text: string;
  excerpt: string;
}

export interface AIAnalysis {
  keywords: string[];
  tags: string[];
  summary: string;
}

export interface DebugInfo {
  fetchStatus: number;
  notes: string[];
}
