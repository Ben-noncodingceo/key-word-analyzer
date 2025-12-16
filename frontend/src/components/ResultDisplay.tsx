import type { AnalyzeResponse } from '../types';

interface ResultDisplayProps {
  result: AnalyzeResponse;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const platformName = result.platform === 'wechat' ? '微信公众号' : '小红书';
  const platformClass = `platform-badge platform-${result.platform}`;

  return (
    <div className="result">
      <div className={platformClass}>
        {platformName}
      </div>

      {/* 基础信息 */}
      <div className="section">
        <h2>基础信息</h2>
        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">标题</div>
            <div className="meta-value">{result.meta.title}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">作者</div>
            <div className="meta-value">{result.meta.author}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">发布时间</div>
            <div className="meta-value">{result.meta.publishTime}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">字数</div>
            <div className="meta-value">{result.meta.wordCount}</div>
          </div>
        </div>
      </div>

      {/* 互动数据 */}
      <div className="section">
        <h2>互动数据</h2>
        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">阅读量</div>
            <div className="meta-value">{result.metrics.views}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">点赞数</div>
            <div className="meta-value">{result.metrics.likes}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">评论数</div>
            <div className="meta-value">{result.metrics.replies}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">收藏数</div>
            <div className="meta-value">{result.metrics.collects}</div>
          </div>
        </div>
      </div>

      {/* AI 分析 */}
      <div className="section">
        <h2>
          关键词
          <button
            className="copy-button"
            onClick={() => copyToClipboard(result.ai.keywords.join(', '))}
          >
            复制
          </button>
        </h2>
        <div className="keywords">
          {result.ai.keywords.map((keyword, index) => (
            <span
              key={index}
              className="keyword-tag"
              onClick={() => copyToClipboard(keyword)}
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {result.ai.tags && result.ai.tags.length > 0 && (
        <div className="section">
          <h2>推荐标签</h2>
          <div className="keywords">
            {result.ai.tags.map((tag, index) => (
              <span
                key={index}
                className="keyword-tag"
                onClick={() => copyToClipboard(tag)}
                style={{ background: '#764ba2' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h2>
          内容摘要
          <button
            className="copy-button"
            onClick={() => copyToClipboard(result.ai.summary)}
          >
            复制
          </button>
        </h2>
        <div className="summary">{result.ai.summary}</div>
      </div>

      {/* 原文预览 */}
      <div className="section">
        <h2>原文预览</h2>
        <div className="preview">
          {result.content.text.substring(0, 1000)}
          {result.content.text.length > 1000 && '...'}
        </div>
      </div>

      {/* 调试信息 */}
      {result.debug.notes && result.debug.notes.length > 0 && (
        <div className="notes">
          <strong>提示：</strong>
          <ul>
            {result.debug.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
