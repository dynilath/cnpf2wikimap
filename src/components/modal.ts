export const modal = {
  show: (el: HTMLElement) => {
    document.body.appendChild(el);
    ($(el) as any).modal('show');
  },
  hide: (el: HTMLElement) => {
    // NOTE: 取消焦点，避免在隐藏时仍然有元素处于焦点状态
    (document.activeElement as HTMLElement)?.blur?.();
    el.addEventListener('transitionend', () => el.remove());
    ($(el) as any).modal('hide');
  },
};
