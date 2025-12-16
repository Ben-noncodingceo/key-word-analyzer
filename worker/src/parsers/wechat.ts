import { load } from 'cheerio';
import type { PlatformParser, ParsedArticle } from '../types';
import { stripHtml, countWords, extractExcerpt } from '../utils';

export class WechatParser implements PlatformParser {
  canHandle(url: string): boolean {
    return url.includes('mp.weixin.qq.com');
  }

  parse(html: string): ParsedArticle {
    const $ = load(html);
    const notes: string[] = [];

    // 提取标题
    const title = $('#activity-name').text().trim() ||
                  $('h1.rich_media_title').text().trim() ||
                  'N/A';

    // 提取作者
    const author = $('#js_name').text().trim() ||
                   $('.rich_media_meta_text').first().text().trim() ||
                   'N/A';

    // 提取发布时间
    const publishTime = $('#publish_time').text().trim() ||
                        $('.rich_media_meta_text').eq(1).text().trim() ||
                        'N/A';

    // 提取正文
    const contentHtml = $('#js_content').html() || '';
    const text = stripHtml(contentHtml);
    const wordCount = countWords(text);
    const excerpt = extractExcerpt(text);

    // 尝试提取互动数据（通常需要登录或从API获取）
    let views: number | string = 'N/A';
    let likes: number | string = 'N/A';
    let replies: number | string = 'N/A';
    let collects: number | string = 'N/A';

    // 微信公众号文章的阅读量等数据通常不在HTML中直接暴露
    // 这些数据需要通过微信公众平台API获取，且仅对已授权账号有效
    notes.push('微信公众号的阅读量、点赞数等数据需要通过官方API获取，仅对已授权账号有效');

    // 尝试从页面中提取可能存在的数据
    const readNumText = $('#js_read_num').text().trim();
    if (readNumText) {
      views = parseInt(readNumText) || readNumText;
    }

    const likeNumText = $('#js_like_num').text().trim();
    if (likeNumText) {
      likes = parseInt(likeNumText) || likeNumText;
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
