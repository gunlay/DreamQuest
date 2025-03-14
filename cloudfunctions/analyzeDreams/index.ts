import cloud from 'wx-server-sdk';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

interface AnalyzeResponse {
  content: string;
}

export async function main(event: any) {
  try {
    const { dreams } = event;

    // 构建提示词
    const prompt = `
      作为一个专业的梦境分析师，请对以下梦境记录进行全面的分析和总结。分析报告需要包含：
      
      1. 梦境主题分析：
         - 识别主要出现的场景、人物和情节
         - 归纳主要的情感倾向（如焦虑、快乐、恐惧等）
      
      2. 心理状态解读：
         - 分析这些梦境可能反映的潜在心理状态
         - 指出可能存在的压力源或困扰
      
      3. 建议和指导：
         - 根据分析结果给出具体的建议
         - 提供一些可以改善心理状态的实际方法
      
      以下是需要分析的梦境记录：
      ${dreams}
      
      请用温和、专业的语气进行分析，避免过于消极的解读。
    `;

    // 调用百炼大模型API
    const response = await cloud.callFunction({
      name: 'callBailianAPI',
      data: {
        prompt: prompt
      }
    }) as { result: AnalyzeResponse };

    return response.result;
  } catch (error) {
    console.error(error);
    throw new Error('梦境分析失败');
  }
} 