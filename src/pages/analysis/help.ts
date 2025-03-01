import Taro from "@tarojs/taro"
import { DreamData } from "./types"


// 获取初始分析
export const getInitialAnalysis = async (dreamData: DreamData): Promise<string> => {
  const result = await new Promise((resolve, reject) => {
    Taro.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-276d5267971644bca803a9130d6db1ac'
      },
      data: {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的梦境分析师，请严格按照以下格式分析用户的梦境。使用温和、专业、富有洞察力的语气，并确保段落结构清晰。请使用HTML标签来格式化输出：\n\n<h3>🌟 梦境主题</h3>\n<p><strong>✨ 核心主题：</strong><br/>用简短的一句话总结梦境的核心主题</p>\n<p><strong>🔑 关键元素：</strong></p>\n<ul>\n<li>元素一</li>\n<li>元素二</li>\n<li>元素三</li>\n</ul>\n\n<h3>🔍 心理学解析</h3>\n<p><strong>🧠 弗洛伊德视角：</strong><br/>从潜意识和原欲望的角度分析</p>\n<p><strong>🌌 荣格视角：</strong><br/>从原型理论和集体无意识的角度解读</p>\n<p><strong>🔬 现代心理学：</strong><br/>结合当代心理学理论的见解</p>\n\n<h3>💭 潜意识解读</h3>\n<p><strong>💫 心理需求：</strong></p>\n<ul>\n<li>需求点一</li>\n<li>需求点二</li>\n</ul>\n<p><strong>🌊 情绪状态：</strong></p>\n<ul>\n<li>情绪点一</li>\n<li>情绪点二</li>\n</ul>\n\n<h3>💡 启发建议</h3>\n<p><strong>🎯 具体建议：</strong></p>\n<ol>\n<li>第一条建议</li>\n<li>第二条建议</li>\n<li>第三条建议</li>\n</ol>\n<p><strong>🔮 反思方向：</strong></p>\n<ul>\n<li>反思点一</li>\n<li>反思点二</li>\n</ul>"
          },
          {
            role: "user",
            content: `请分析这个梦境：${dreamData.content}`
          }
        ],
        temperature: 0.7,
        stream: false
      },
      success: resolve,
      fail: reject
    })
  }) as any

  const response = result.data as any
  if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
    return response.choices[0].message.content
  }
  throw new Error('AI 回复格式错误')
}

// 生成标签
export const generateTags = async (dreamData: DreamData): Promise<string[]> => {
  const result = await new Promise((resolve, reject) => {
    Taro.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-276d5267971644bca803a9130d6db1ac'
      },
      data: {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个梦境标签生成器。请分析用户的梦境，生成2-5个标签，每个标签不超过5个字。标签应该涵盖梦境中的关键人物、场景、情绪、场所等要素。请直接返回标签数组，用逗号分隔，不要包含其他内容。例如：'焦虑,海边,追逐'"
          },
          {
            role: "user",
            content: `请为这个梦境生成标签：${dreamData.content}`
          }
        ],
        temperature: 0.7,
        stream: false
      },
      success: resolve,
      fail: reject
    })
  }) as any

  const response = result.data as any
  if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
    // 解析返回的标签字符串
    const tags = response.choices[0].message.content
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0 && tag.length <= 5)
      .slice(0, 5) // 确保不超过5个标签
    return tags
  }
  throw new Error('标签生成失败')
}