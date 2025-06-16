/**
 * 创建 HTML 元素的辅助函数
 * @param tag HTML 标签名
 * @param attrs 元素属性对象，支持 id、classList、className 等属性
 * @param children 子元素，可以是字符串或 HTML 元素
 * @returns 创建的 HTML 元素实例
 */
export function h<key extends keyof HTMLElementTagNameMap> (
  tag: key,
  attrs: {
    id?: HTMLElement['id'];
    classList?: DOMTokenList | string[];
    className?: HTMLElement['className'];
    [key: string]: any; // 允许其他属性
  } = {},
  ...children: (string | HTMLElement | undefined)[]
): HTMLElementTagNameMap[key] {
  const el = document.createElement(tag);
  const _attrs = { ...attrs };

  if ('classList' in _attrs) {
    if (_attrs.classList instanceof DOMTokenList) {
      el.className = _attrs.classList.value;
    } else if (Array.isArray(attrs.classList)) {
      el.className = _attrs.classList.join(' ');
    }
    delete _attrs.classList;
  }

  for (const key in _attrs) {
    if (key in el) {
      (el as any)[key] = attrs[key];
    } else {
      // 如果属性不存在于元素上，使用 setAttribute
      el.setAttribute(key, attrs[key]);
    }
  }

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  });
  return el;
}
