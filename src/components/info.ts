import { h } from './h';
import { modal } from './modal';

interface InfoResult {
  confirm?: boolean;
  cancel?: boolean;
}

interface InfoOptions {
  info?: string | HTMLElement;
  title?: string | HTMLElement;
  buttons?: { confirm?: string; cancel?: string };
}

/**
 * 显示信息对话框
 * @param options 对话框选项，包含信息内容、标题和按钮文本
 * @returns Promise，解析为用户操作结果对象
 * @throws 当选项为空或缺少必需内容时抛出异常
 */
export async function showInfo (options: InfoOptions): Promise<InfoResult> {
  if (!options || (!options.info && !options.title)) {
    throw new Error('showInfo: options must contain either info or title');
  }

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
          options.title &&
            h(
              'div',
              { className: 'modal-header' },
              typeof options.title === 'string' ? h('h3', {}, options.title) : options.title
            ),
          options.info &&
            h(
              'div',
              { className: 'modal-body' },
              typeof options.info === 'string' ? h('p', {}, options.info) : options.info
            ),
          h(
            'div',
            { className: 'modal-footer' },
            h(
              'button',
              {
                type: 'button',
                className: 'btn btn-primary',
                onclick: () => {
                  resolve({ confirm: true });
                  modal.hide(el);
                },
              },
              options?.buttons.confirm || '确认'
            ),
            options?.buttons.cancel &&
              h(
                'button',
                {
                  type: 'button',
                  className: 'btn btn-secondary',
                  onclick: () => {
                    resolve({ cancel: true });
                    modal.hide(el);
                  },
                },
                options.buttons.cancel
              )
          )
        )
      )
    );
    modal.show(el);
  });
}
