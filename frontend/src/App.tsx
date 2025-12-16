import React, { useState } from 'react';
import './App.css';
import type { AnalyzeRequest, AnalyzeResponse } from './types';
import { analyzeArticle } from './utils/api';
import { ResultDisplay } from './components/ResultDisplay';

function App() {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<'openai' | 'deepseek'>('deepseek');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('请输入文章URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: AnalyzeRequest = {
        url: url.trim(),
        provider,
        model: model || undefined,
        topK: 12,
        language: 'zh',
      };

      const response = await analyzeArticle(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const defaultModels = {
    openai: 'gpt-4o-mini',
    deepseek: 'deepseek-chat',
  };

  return (
    <div className="app">
      <div className="header">
        <h1>社媒文章一键解析器</h1>
        <p>支持小红书和微信公众号文章关键词提取与AI分析</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="input-section">
          <div className="input-group">
            <label htmlFor="url">文章URL</label>
            <input
              id="url"
              type="text"
              placeholder="粘贴小红书或微信公众号文章链接..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="provider">AI 模型提供方</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as 'openai' | 'deepseek';
                setProvider(newProvider);
                setModel(defaultModels[newProvider]);
              }}
            >
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="model">模型名称（可选）</label>
            <input
              id="model"
              type="text"
              placeholder={`默认: ${defaultModels[provider]}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="analyze-button"
            disabled={loading}
          >
            {loading ? '分析中...' : '开始分析'}
          </button>
        </form>

        {error && (
          <div className="error">
            <strong>错误：</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>正在分析文章，请稍候...</p>
          </div>
        )}
      </div>

      {result && (
        <div className="card">
          <ResultDisplay result={result} />
        </div>
      )}

      <div className="footer">
        <p>
          由 Cloudflare Workers + React 驱动 |{' '}
          <a href="https://github.com/Ben-noncodingceo/key-word-analyzer" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
