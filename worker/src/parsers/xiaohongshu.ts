import type { PlatformParser, ParsedArticle } from '../types';
import { stripHtml, countWords, extractExcerpt } from '../utils';

export class XiaohongshuParser implements PlatformParser {
  canHandle(url: string): boolean {
    return url.includes('xiaohongshu.com') || url.includes('xhslink.com');
  }

  parse(html: string): ParsedArticle {
    const notes: string[] = [];

    let title = 'N/A';
    let author = 'N/A';
    let publishTime = 'N/A';
    let text = '';
    let views: number | string = 'N/A';
    let likes: number | string = 'N/A';
    let replies: number | string = 'N/A';
    let collects: number | string = 'N/A';

    // 尝试从 JSON-LD 中提取数据
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'Article') {
          title = jsonData.headline || title;
          author = jsonData.author?.name || author;
          publishTime = jsonData.datePublished || publishTime;
          text = jsonData.articleBody || text;
        }
      } catch (e) {
        // JSON 解析失败，继续使用其他方法
      }
    }

    // 如果 JSON-LD 没有数据，尝试从 meta 标签提取
    if (title === 'N/A') {
      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                         html.match(/<title[^>]*>(.*?)<\/title>/s);
      if (titleMatch) {
        title = stripHtml(titleMatch[1]).trim();
      }
    }

    if (author === 'N/A') {
      const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"/);
      if (authorMatch) {
        author = authorMatch[1].trim();
      }
    }

    // 尝试提取正文内容
    if (!text) {
      const contentSelectors = [
        /class="[^"]*note-content[^"]*"[^>]*>(.*?)<\/div>/s,
        /class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s,
        /class="[^"]*desc[^"]*"[^>]*>(.*?)<\/div>/s,
      ];

      for (const selector of contentSelectors) {
        const match = html.match(selector);
        if (match) {
          text = stripHtml(match[1]);
          if (text.length > 50) break;
        }
      }
    }

    // 如果还是没有内容，提取 body
    if (!text || text.length < 50) {
      const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/s);
      if (bodyMatch) {
        text = stripHtml(bodyMatch[1]);
      }
    }

    notes.push('小红书的数据结构可能因页面更新而变化');
    if (views === 'N/A') {
      notes.push('浏览量数据未在页面公开展示');
    }

    const wordCount = countWords(text);
    const excerpt = extractExcerpt(text);

    return {
      meta: {
        title,
        author,
        publishTime,
        wordCount,
      },
      metrics: {
        views,
        replies,
        likes,
        collects,
      },
      content: {
        text,
        excerpt,
      },
      notes,
    };
  }
}
