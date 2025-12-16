// 请求类型
export interface AnalyzeRequest {
  url: string;
  provider: 'openai' | 'deepseek';
  model?: string;
  topK?: number;
  language?: string;
}

// 响应类型
export interface AnalyzeResponse {
  platform: 'wechat' | 'xiaohongshu' | 'unknown';
  meta: ArticleMeta;
  metrics: ArticleMetrics;
  content: ArticleContent;
  ai: AIAnalysis;
  debug: DebugInfo;
}

// 文章元数据
export interface ArticleMeta {
  title: string;
  author: string;
  publishTime: string;
  wordCount: number;
}

// 文章互动数据
export interface ArticleMetrics {
  views: number | string;
  replies: number | string;
  likes: number | string;
  collects: number | string;
}

// 文章内容
export interface ArticleContent {
  text: string;
  excerpt: string;
}

// AI分析结果
export interface AIAnalysis {
  keywords: string[];
  tags: string[];
  summary: string;
}

// 调试信息
export interface DebugInfo {
  fetchStatus: number;
  notes: string[];
}

// 平台解析器接口
export interface PlatformParser {
  canHandle(url: string): boolean;
  parse(html: string): ParsedArticle;
}

// 解析后的文章
export interface ParsedArticle {
  meta: ArticleMeta;
  metrics: ArticleMetrics;
  content: ArticleContent;
  notes: string[];
}

// Worker环境变量
export interface Env {
  CACHE: KVNamespace;
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
}
