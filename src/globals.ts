import { h } from './components/h';

/**
 * 转义输入文本，处理内链和换行
 */
export function escapeInput (input: string): string {
  const escapeHtml = (text: string): string => h('div', { textContent: text }).innerHTML;
  const createLink = (href: string, text: string): string =>
    h('a', { href: '/wiki/' + href, textContent: text }).outerHTML;

  // 转义 HTML 特殊字符
  let escaped = escapeHtml(input);

  // 处理内链 [[页面|显示文本]] 或 [[页面]]
  escaped = escaped.replace(/\[\[(.+?)\]\]/g, (_, p1) => {
    const result = /([^\|]+)\|(.+)/.exec(p1);
    if (result === null) {
      // 简单链接 [[页面]]
      return createLink(p1, p1);
    } else {
      // 带显示文本的链接 [[页面|显示文本]]
      return createLink(result[1], result[2]);
    }
  });

  // 处理换行
  return escaped.replace(/\n/g, '<br/>');
}

/**
 * 检查 Leaflet 是否已加载
 */
function isLeafletLoaded (): boolean {
  return typeof window.L !== 'undefined' && !!window.L.version && !!window.L.TileLayer;
}

/**
 * 等待 Leaflet 加载完成
 */
export async function waitForLeaflet (timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLeafletLoaded()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (isLeafletLoaded()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for Leaflet to load.'));
      }
    }, 100);
  });
}

/**
 * 创建一个错误提示的 HTML span 元素
 * @param message 错误信息
 * @returns HTML 字符串
 */
export function errorSpan (message: string): HTMLSpanElement {
  return h('span', {
    className: 'scribunto-error',
    id: 'mw-scribunto-error-0',
    textContent: message,
  });
}
