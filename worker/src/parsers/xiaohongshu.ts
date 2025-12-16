import { load } from 'cheerio';
import type { PlatformParser, ParsedArticle } from '../types';
import { stripHtml, countWords, extractExcerpt } from '../utils';

export class XiaohongshuParser implements PlatformParser {
  canHandle(url: string): boolean {
    return url.includes('xiaohongshu.com') || url.includes('xhslink.com');
  }

  parse(html: string): ParsedArticle {
    const $ = load(html);
    const notes: string[] = [];

    // 小红书的页面结构经常变化，这里提供一个基础实现
    // 实际使用时可能需要根据最新的页面结构调整

    let title = 'N/A';
    let author = 'N/A';
    let publishTime = 'N/A';
    let text = '';
    let views: number | string = 'N/A';
    let likes: number | string = 'N/A';
    let replies: number | string = 'N/A';
    let collects: number | string = 'N/A';

    // 尝试从JSON-LD中提取数据
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const jsonData = JSON.parse($(elem).html() || '{}');
        if (jsonData['@type'] === 'Article') {
          title = jsonData.headline || title;
          author = jsonData.author?.name || author;
          publishTime = jsonData.datePublished || publishTime;
          text = jsonData.articleBody || text;
        }
      } catch (e) {
        // JSON解析失败，跳过
      }
    });

    // 尝试从页面元素中提取
    if (title === 'N/A') {
      title = $('meta[property="og:title"]').attr('content') ||
              $('.title').first().text().trim() ||
              'N/A';
    }

    if (author === 'N/A') {
      author = $('meta[name="author"]').attr('content') ||
               $('.author-name').first().text().trim() ||
               'N/A';
    }

    if (!text) {
      // 尝试提取正文内容
      const contentSelectors = [
        '.note-content',
        '.content',
        '[class*="note-text"]',
        '[class*="desc"]'
      ];

      for (const selector of contentSelectors) {
        const content = $(selector).first().html();
        if (content) {
          text = stripHtml(content);
          break;
        }
      }
    }

    // 尝试提取互动数据
    // 小红书的互动数据可能在页面中，但格式经常变化
    $('[class*="count"], [class*="number"]').each((_, elem) => {
      const elemText = $(elem).text().trim();
      const parent = $(elem).parent();
      const parentText = parent.text().toLowerCase();

      if (parentText.includes('赞') || parentText.includes('like')) {
        likes = parseInt(elemText) || elemText;
      } else if (parentText.includes('评论') || parentText.includes('comment')) {
        replies = parseInt(elemText) || elemText;
      } else if (parentText.includes('收藏') || parentText.includes('collect')) {
        collects = parseInt(elemText) || elemText;
      } else if (parentText.includes('浏览') || parentText.includes('view')) {
        views = parseInt(elemText) || elemText;
      }
    });

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
