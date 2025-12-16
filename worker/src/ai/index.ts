import type { AIAnalysis } from '../types';

export interface AIProvider {
  analyze(text: string, topK: number, language: string): Promise<AIAnalysis>;
}

export interface AIConfig {
  provider: 'openai' | 'deepseek';
  apiKey: string;
  model?: string;
}

// 生成分析prompt
function generatePrompt(text: string, topK: number, language: string): string {
  const langInstruction = language === 'zh' ? '请用中文回答' : 'Please respond in English';

  return `${langInstruction}。请分析以下文章内容，提取关键信息：

文章内容：
${text.substring(0, 4000)} ${text.length > 4000 ? '...(内容已截断)' : ''}

请以JSON格式返回以下内容：
1. keywords: 提取${topK}个最重要的关键词（数组）
2. tags: 推荐3-5个主题标签（数组）
3. summary: 150-300字的内容摘要（字符串）

返回格式示例：
{
  "keywords": ["关键词1", "关键词2", ...],
  "tags": ["标签1", "标签2", ...],
  "summary": "文章摘要..."
}

只返回JSON，不要包含其他说明文字。`;
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4.1-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(text: string, topK: number, language: string): Promise<AIAnalysis> {
    const prompt = generatePrompt(text, topK, language);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容分析助手，擅长提取关键词和总结要点。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0].message.content;

    return JSON.parse(content);
  }
}

// DeepSeek Provider
export class DeepSeekProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'deepseek-chat') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(text: string, topK: number, language: string): Promise<AIAnalysis> {
    const prompt = generatePrompt(text, topK, language);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容分析助手，擅长提取关键词和总结要点。请始终以JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0].message.content;

    // DeepSeek可能返回带```json标记的内容，需要清理
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanContent);
  }
}

// 创建AI Provider
export function createAIProvider(config: AIConfig): AIProvider {
  if (config.provider === 'openai') {
    return new OpenAIProvider(config.apiKey, config.model);
  } else if (config.provider === 'deepseek') {
    return new DeepSeekProvider(config.apiKey, config.model);
  } else {
    throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}
