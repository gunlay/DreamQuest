import Taro, { useShareAppMessage } from '@tarojs/taro';
import DreamContent from '@/Components/Business/DreamContent';

const Analysis = () => {
  const chatId = (Taro.getCurrentInstance()?.router?.params?.chatId as string) || '';
  useShareAppMessage((res) => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
    }
    return {
      title: '自定义转发标题',
      imageUrl: 'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/WechatIMG636.jpg',
      path: `/pages/sub/shareDream/index?chatId=${chatId}`,
    };
  });
  return <DreamContent />;
};

export default Analysis;
