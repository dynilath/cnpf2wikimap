import { MarkerInfo } from '../types';
import { h } from './h';
import { modal } from './modal';

/**
 * 创建标记详细信息编辑器
 * @param initInfo 初始标记信息，用于预填充表单
 * @returns Promise，解析为用户编辑后的标记信息对象
 */
export function createMarkerDetailEditor (initInfo: MarkerInfo): Promise<MarkerInfo> {
  const result = { ...initInfo };

  const formTag = h('input', {
    id: 'markerTag',
    className: 'form-control',
    placeholder: '此处输入标记标签。此标签用于地图自动定位。',
    value: initInfo.tag || '',
  });

  const formImage = h('input', {
    id: 'markerImage',
    type: 'text',
    className: 'form-control',
    placeholder: '此处输入图片名，如"我的图片.png"，不要包含“File:”前缀。留空则使用默认标记。',
    value: initInfo.markerImage || '',
  });

  const formTooltip = h('textarea', {
    id: 'markerTooltip',
    className: 'form-control',
    rows: 5,
    placeholder: '此处输入描述文字。文字中可以使用简单的内链，如[[XXX|XX]]和[[XXX]]。',
    textContent: initInfo.tooltip || '',
  });

  return new Promise(resolve => {
    const el = h(
      'div',
      { classList: ['modal', 'fade'], id: 'markerInfoEditor' },
      h(
        'div',
        { className: 'modal-dialog', role: 'document' },
        h(
          'div',
          { className: 'modal-content' },
          h('div', { className: 'modal-header' }, h('h3', {}, '编辑地图标记信息')),
          h(
            'div',
            { className: 'modal-body' },
            h(
              'form',
              {},
              h(
                'div',
                { className: 'form-group' },
                h('label', { for: 'markerTag', className: 'form-control-label' }, '地图标记坐标：'),
                `{ X: ${initInfo.coords?.x}, Y: ${initInfo.coords?.y} }`
              ),
              h(
                'div',
                { className: 'form-group' },
                h('label', { for: 'markerTag', className: 'form-control-label' }, '地图标记标签：'),
                formTag
              ),
              h(
                'div',
                { className: 'form-group' },
                h('label', { for: 'markerImage', className: 'form-control-label' }, '地图标记图片文件名：'),
                formImage
              ),
              h(
                'div',
                { className: 'form-group' },
                h('label', { for: 'markerTooltip', className: 'form-control-label' }, '地图标记提示信息：'),
                formTooltip
              )
            )
          ),
          h(
            'div',
            { className: 'modal-footer' },
            h('button', {
              id: 'confirm',
              type: 'button',
              className: 'btn btn-primary',
              textContent: '保存更改',
              onclick: () => {
                const tag = formTag.value.trim();
                const markerImage = formImage.value.trim();
                const tooltip = formTooltip.value.trim();

                result.tag = tag || undefined;
                result.markerImage = markerImage || undefined;
                result.tooltip = tooltip || undefined;

                resolve(result);
                modal.hide(el);
              },
            }),
            h('button', {
              type: 'button',
              className: 'btn btn-secondary',
              textContent: '关闭',
              onclick: () => modal.hide(el),
            })
          )
        )
      )
    );
    modal.show(el);
    formTag.focus();
  });
}
