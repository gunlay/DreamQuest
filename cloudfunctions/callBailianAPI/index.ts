import cloud from 'wx-server-sdk';
import axios from 'axios';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const BAILIAN_API_KEY = 'sk-eed28a31d2fa47a585c9c7e898d5ac50';
const BAILIAN_API_URL = 'https://bailian-api.aliyun.com/v1/text/generation';

export async function main(event: any) {
  const { prompt } = event;

  try {
    const response = await axios.post(BAILIAN_API_URL, {
      model: "deepseek-v3",
      input: prompt,
      parameters: {
        top_p: 0.8,
        temperature: 0.7,
        max_tokens: 1500
      }
    }, {
      headers: {
        'Authorization': `Bearer ${BAILIAN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.output || !response.data.output.text) {
      throw new Error('API返回数据格式错误');
    }

    return {
      content: response.data.output.text
    };
  } catch (error) {
    console.error('Bailian API call failed:', error);
    throw new Error('API调用失败');
  }
} 