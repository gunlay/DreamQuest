import Taro from '@tarojs/taro';

// 获取当前页面完整路径（含参数）
export const getCurrentPageUrl = () => {
  const current = Taro.getCurrentInstance();
  if (!current.router) return '';

  const { path, params } = current.router;
  const query = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key] || '')}`)
    .join('&');

  return query ? `${path}?${query}` : path;
};

export const navigateToLogin = (redirect?: string) => {
  const pages = Taro.getCurrentPages();
  if (pages.length > 0) {
    const current = pages[pages.length - 1].route;
    if (current?.startsWith('/pages/login')) return;
  }

  Taro.redirectTo({
    url: `/pages/sub/login/index${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`,
  });
};
