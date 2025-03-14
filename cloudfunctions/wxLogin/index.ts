import cloud from 'wx-server-sdk';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

interface WxLoginResult {
  session_key: string;
  openid: string;
  unionid?: string;
}

export async function main(event: any) {
  const { code, userInfo } = event;

  try {
    // 获取微信接口调用凭证
    const { APPID, SECRET } = cloud.getWXContext();
    
    // 调用微信登录凭证校验接口
    const response = await cloud.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      data: {
        appid: APPID,
        secret: SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const wxLoginResult = response.data as WxLoginResult;

    if (!wxLoginResult.openid) {
      throw new Error('获取用户openid失败');
    }

    // 这里可以根据需要生成自定义登录态token
    // 为了演示，这里简单地使用openid作为token
    const token = wxLoginResult.openid;
    console.log(wxLoginResult, response);
    
    console.log('云函数', {
      code: 0,
      data: {
        token,
        userInfo
      },
      message: '登录成功'
    };);
    
    return {
      code: 0,
      data: {
        token,
        userInfo
      },
      message: '登录成功'
    };

  } catch (error) {
    console.error('微信登录失败:', error);
    return {
      code: -1,
      data: null,
      message: '登录失败'
    };
  }
}