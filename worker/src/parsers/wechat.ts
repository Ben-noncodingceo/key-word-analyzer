import type { PlatformParser, ParsedArticle } from '../types';
import { stripHtml, countWords, extractExcerpt } from '../utils';

export class WechatParser implements PlatformParser {
  canHandle(url: string): boolean {
    return url.includes('mp.weixin.qq.com');
  }

  parse(html: string): ParsedArticle {
    const notes: string[] = [];

    // 使用正则表达式提取标题
    let title = 'N/A';
    const titleMatch = html.match(/<h1[^>]*class="[^"]*rich_media_title[^"]*"[^>]*>(.*?)<\/h1>/s) ||
                       html.match(/id="activity-name"[^>]*>(.*?)</s);
    if (titleMatch) {
      title = stripHtml(titleMatch[1]).trim();
    }

    // 提取作者
    let author = 'N/A';
    const authorMatch = html.match(/id="js_name"[^>]*>(.*?)</s) ||
                        html.match(/class="[^"]*rich_media_meta_text[^"]*"[^>]*>(.*?)</s);
    if (authorMatch) {
      author = stripHtml(authorMatch[1]).trim();
    }

    // 提取发布时间
    let publishTime = 'N/A';
    const timeMatch = html.match(/id="publish_time"[^>]*>(.*?)</s);
    if (timeMatch) {
      publishTime = stripHtml(timeMatch[1]).trim();
    }

    // 提取正文内容
    let text = '';
    const contentMatch = html.match(/id="js_content"[^>]*>(.*?)<\/div>/s);
    if (contentMatch) {
      text = stripHtml(contentMatch[1]);
    }

    // 如果没有找到内容，尝试提取整个 body
    if (!text || text.length < 100) {
      const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/s);
      if (bodyMatch) {
        text = stripHtml(bodyMatch[1]);
      }
    }

    const wordCount = countWords(text);
    const excerpt = extractExcerpt(text);

    // 尝试提取互动数据
    let views: number | string = 'N/A';
    let likes: number | string = 'N/A';
    let replies: number | string = 'N/A';
    let collects: number | string = 'N/A';

    notes.push('微信公众号的阅读量、点赞数等数据需要通过官方API获取，仅对已授权账号有效');

    // 尝试提取阅读量
    const viewsMatch = html.match(/id="js_read_num"[^>]*>(.*?)</s);
    if (viewsMatch) {
      const num = parseInt(viewsMatch[1].trim());
      views = isNaN(num) ? viewsMatch[1].trim() : num;
    }

    // 尝试提取点赞数
    const likesMatch = html.match(/id="js_like_num"[^>]*>(.*?)</s);
    if (likesMatch) {
      const num = parseInt(likesMatch[1].trim());
      likes = isNaN(num) ? likesMatch[1].trim() : num;
    }

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
