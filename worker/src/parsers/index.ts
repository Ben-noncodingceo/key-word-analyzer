import type { PlatformParser } from '../types';
import { WechatParser } from './wechat';
import { XiaohongshuParser } from './xiaohongshu';

const parsers: PlatformParser[] = [
  new WechatParser(),
  new XiaohongshuParser(),
];

export function getParser(url: string): PlatformParser | null {
  return parsers.find(parser => parser.canHandle(url)) || null;
}

export { WechatParser, XiaohongshuParser };
