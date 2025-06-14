import md5 from 'md5';

/**
 * 根据文件名生成图片 URL
 */
export function huijiImageURL(filename: string): string {
  const hex = md5(filename);
  return [
    'https://huiji-public.huijistatic.com/' + mw.config.get('wgHuijiPrefix') + '/uploads',
    hex[0],
    hex[0] + hex[1],
    filename
  ].join('/');
}

