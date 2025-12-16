import type { Env, AnalyzeRequest, AnalyzeResponse } from './types';
import { identifyPlatform, getCorsHeaders } from './utils';
import { getParser } from './parsers';
import { createAIProvider } from './ai';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: getCorsHeaders(),
      });
    }

    // 只处理POST请求到/api/analyze
    if (request.method !== 'POST' || !request.url.endsWith('/api/analyze')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
      });
    }

    try {
      // 解析请求
      const body = await request.json() as AnalyzeRequest;
      const {
        url,
        provider,
        model,
        topK = 12,
        language = 'zh',
      } = body;

      // 验证必需参数
      if (!url || !provider) {
        return new Response(JSON.stringify({ error: 'Missing required parameters: url, provider' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        });
      }

      // 识别平台
      const platform = identifyPlatform(url);
      if (platform === 'unknown') {
        return new Response(JSON.stringify({ error: 'Unsupported platform. Only WeChat and Xiaohongshu are supported.' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        });
      }

      // 获取解析器
      const parser = getParser(url);
      if (!parser) {
        return new Response(JSON.stringify({ error: 'No parser found for this URL' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        });
      }

      // 抓取页面内容
      let fetchStatus = 200;
      let html = '';

      try {
        const pageResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        fetchStatus = pageResponse.status;

        if (!pageResponse.ok) {
          throw new Error(`Failed to fetch page: ${pageResponse.status} ${pageResponse.statusText}`);
        }

        html = await pageResponse.text();
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Failed to fetch article',
          details: error instanceof Error ? error.message : String(error),
          suggestion: '请检查URL是否正确，或者文章是否需要登录访问',
        }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        });
      }

      // 解析文章
      const parsed = parser.parse(html);

      // 检查是否有足够的内容进行分析
      if (!parsed.content.text || parsed.content.text.length < 50) {
        return new Response(JSON.stringify({
          error: 'Insufficient content',
          details: '提取的文章内容过少，可能页面结构已变化或需要登录访问',
          suggestion: '请尝试复制文章正文后直接粘贴进行分析',
        }), {
          status: 422,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        });
      }

      // AI分析
      let aiAnalysis;
      try {
        const apiKey = provider === 'openai' ? env.OPENAI_API_KEY : env.DEEPSEEK_API_KEY;

        if (!apiKey) {
          throw new Error(`${provider.toUpperCase()} API key not configured`);
        }

        const aiProvider = createAIProvider({
          provider,
          apiKey,
          model,
        });

        aiAnalysis = await aiProvider.analyze(parsed.content.text, topK, language);
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'AI analysis failed',
          details: error instanceof Error ? error.message : String(error),
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        });
      }

      // 构建响应
      const response: AnalyzeResponse = {
        platform,
        meta: parsed.meta,
        metrics: parsed.metrics,
        content: parsed.content,
        ai: aiAnalysis,
        debug: {
          fetchStatus,
          notes: parsed.notes,
        },
      };

      const responseBody = JSON.stringify(response);

      return new Response(responseBody, {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
      });

    } catch (error) {
      console.error('Unexpected error:', error);

      return new Response(JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
      });
    }
  },
};
