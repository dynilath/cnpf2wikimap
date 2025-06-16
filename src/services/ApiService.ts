import { API_CONFIG } from '../constants';
import { ApiQueryData } from '../types';

/**
 * 发送请求并处理回调
 * @param queryData API 查询数据对象
 * @param reqType 请求类型，GET 或 POST，默认为 GET
 * @returns Promise，解析为 API 响应数据
 * @throws 网络错误、超时或 API 错误时抛出异常
 */
async function requestWithCallback<T = any> (queryData: ApiQueryData, reqType: 'GET' | 'POST' = 'GET'): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    let url = API_CONFIG.ENDPOINT;
    let body: string | FormData | undefined;

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (reqType === 'GET') {
      const searchParams = new URLSearchParams();
      Object.entries(queryData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += '?' + searchParams.toString();
    } else {
      const formData = new URLSearchParams();
      Object.entries(queryData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      body = formData.toString();
    }

    const response = await fetch(url, {
      method: reqType,
      headers,
      body,
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`API error: ${data.error.code} - ${data.error.info}`);
    }

    return data;
  } catch (error) {
    console.error('请求过程中出现错误！', error);
    throw error;
  }
}

/**
 * API 服务类 - 处理与后端的通信
 */
export const ApiService = {
  /**
   * 获取图片信息
   * @param imageName 图片文件名（单个字符串）或图片文件名数组
   * @returns Promise，解析为包含图片信息的 API 响应数据
   */
  getImageInfo: async (imageName: string | string[]): Promise<any> => {
    const fName = n => `File:${n}`;
    const titles = Array.isArray(imageName) ? imageName.map(fName).join('|') : fName(imageName);

    return requestWithCallback({
      action: 'query',
      format: 'json',
      prop: 'imageinfo',
      titles,
      formatversion: '2',
      iiprop: API_CONFIG.IMAGE_INFO_PROPS,
    });
  },
  /**
   * 获取页面内容
   * @param pageName 页面名称
   * @returns Promise，解析为包含页面版本内容的 API 响应数据
   */
  getPageContent: async (pageName: string): Promise<any> => {
    return requestWithCallback({
      action: 'query',
      format: 'json',
      prop: 'revisions',
      titles: pageName,
      formatversion: '2',
      rvprop: API_CONFIG.REVISION_PROPS,
      rvlimit: API_CONFIG.REVISION_LIMIT,
    });
  },
  /**
   * 获取页面的 JSON 数据
   * @param pageName 页面名称
   * @returns Promise，解析为页面内容的 JSON 数据
   * @throws 当页面不存在或没有内容时抛出异常
   *
   * 注意：此方法与 getPageContent 类似，但返回的数据格式为 JSON。
   */
  getPageJSON: async (pageName: string): Promise<any> => {
    const response = await requestWithCallback({
      action: 'query',
      format: 'json',
      prop: 'revisions',
      titles: pageName,
      formatversion: '2',
      rvprop: API_CONFIG.REVISION_PROPS,
      rvlimit: API_CONFIG.REVISION_LIMIT,
    });

    const page = response?.query?.pages.find(p => !p.missing && p.revisions?.[0]);
    if (!page) {
      throw new Error(`页面 ${pageName} 不存在或没有内容`);
    }
    const data = JSON.parse(page.revisions[0].content);
    return data;
  },
  /**
   * 保存页面内容
   * @param pageName 页面名称
   * @param content 页面内容字符串
   * @param summary 编辑摘要
   * @returns Promise，解析为保存操作的 API 响应数据
   */
  savePageContent: async (pageName: string, content: string, summary: string): Promise<any> => {
    return requestWithCallback(
      {
        format: 'json',
        action: 'edit',
        contentformat: 'application/json',
        title: pageName,
        summary: `${summary} - 通过 ${mediaWiki.config.get('wgPageName')} 页面更新`,
        text: content,
        minor: true,
        token: mediaWiki.user.tokens.get('csrfToken'),
      },
      'POST'
    );
  },
};
