import md5 from 'md5';

/**
 * 根据文件名生成图片 URL
 * @param filename 图片文件名
 * @returns 生成的图片 URL，使用灰机 Wiki 静态资源域名和 MD5 哈希路径
 */
export function huijiImageURL (filename: string): string {
  const hex = md5(filename);
  return [
    'https://huiji-public.huijistatic.com/' + mw.config.get('wgHuijiPrefix') + '/uploads',
    hex[0],
    hex[0] + hex[1],
    filename,
  ].join('/');
}
