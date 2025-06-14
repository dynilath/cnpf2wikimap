/**
 * 将字符串首字母大写
 */
export function ucFirst (string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 解析数字对参数
 */
export function parseNumPairParam (param: string): number[] {
  const paramList = param.split(',');
  return paramList.map(value => Number(value));
}

/**
 * 转义输入文本，处理内链和换行
 */
export function escapeInput (input: string): string {
  return $('<span/>')
    .text(input)
    .wrap('<span/>')
    .parent()
    .text()
    .replace(/\[\[(.+?)\]\]/g, (_, p1) => {
      const result = /([^\|]+)\|(.+)/.exec(p1);
      if (result === null) {
        return $('<a/>')
          .attr('href', '/wiki/' + p1)
          .text(p1)
          .wrap('<span/>')
          .parent()
          .html();
      } else {
        return $('<a/>')
          .attr('href', '/wiki/' + result[1])
          .text(result[2])
          .wrap('<span/>')
          .parent()
          .html();
      }
    })
    .replace(/\n/g, '<br/>');
}

/**
 * 检查 Leaflet 是否已加载
 */
function isLeafletLoaded (): boolean {
  return typeof L !== 'undefined' && !!L.version && !!L.TileLayer;
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
  const span = document.createElement('span');
  span.className = 'scribunto-error';
  span.id = 'mw-scribunto-error-0';
  span.textContent = message;
  return span;
}
