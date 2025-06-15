import { h } from './h';

export async function showInfo (info: string | HTMLElement): Promise<void> {
  return new Promise(resolve => {
    const el = h(
      'div',
      { classList: ['modal', 'fade'], id: 'infoModal' },
      h(
        'div',
        { className: 'modal-dialog', role: 'document' },
        h(
          'div',
          { className: 'modal-content' },
          h('div', { className: 'modal-header' }, h('h3', {}, '信息')),
          h('div', { className: 'modal-body' }, typeof info === 'string' ? h('p', {}, info) : info),
          h(
            'div',
            { className: 'modal-footer' },
            h(
              'button',
              {
                type: 'button',
                className: 'btn btn-secondary',
                onclick: () => {
                  resolve();
                  el.classList.remove('show');
                  setTimeout(() => {
                    el.remove();
                  }, 300);
                },
              },
              '关闭'
            )
          )
        )
      )
    );

    document.body.appendChild(el);
    el.classList.add('show');
    el.classList.remove('fade');
  });
}
