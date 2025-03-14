// 周报内容接口定义
interface WeeklyReportContent {
  keywords: string;      // 关键词分析
  analysis: string;      // 梦境解析
  emotionTrend: string;  // 情绪趋势
  aiSuggestion: string;  // AI建议
}

interface DreamRecord {
  id: number;           // 记录ID
  title: string;        // 标题
  content: string;      // 梦境内容
  date: string;         // 记录日期
  weekday: string;      // 星期几
  emotion?: string;     // 情绪标签
  tags?: string[];      // 标签
  image?: string;       // 梦境图片
  analysis?: string;    // AI分析
}

// 周报数据接口定义
interface WeeklyReportData {
  startDate: string;    // 开始日期
  endDate: string;      // 结束日期
  dreamCount: number;   // 梦境记录数量
  emotions: {
    positive: number;   // 积极情绪数量
    neutral: number;    // 中性情绪数量
    negative: number;   // 消极情绪数量
  };
  themes: {
    work: number;      // 工作相关
    life: number;      // 生活相关
    relationship: number; // 人际关系
    other: number;     // 其他
  };
  keywords: string[];   // 关键词列表
}

const { config } = require('../config/config')

// DeepSeek API 响应类型
interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 初始化API客户端
const client = {
  async chat(params: any): Promise<DeepSeekResponse> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.deepseek.com/v1/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`
        },
        data: params,
        success(res: any) {
          resolve(res.data as DeepSeekResponse);
        },
        fail(error) {
          console.error('API调用失败:', error);
          reject(error);
        }
      });
    });
  }
};

// 获取本周的梦境数据
export function getWeeklyDreams(): DreamRecord[] {
  const dreams = wx.getStorageSync('dreams') || []
  console.log('从存储中获取的所有梦境记录:', dreams);
  
  const now = new Date()
  console.log('当前时间:', now);
  
  // 获取本周一的日期
  const monday = new Date(now)
  const day = monday.getDay() || 7 // 将周日的0改为7
  monday.setDate(monday.getDate() - day + 1) // 将日期设置为本周一
  monday.setHours(0, 0, 0, 0) // 设置时间为零点
  console.log('本周一日期:', monday);
  
  const weeklyDreams = dreams.filter((dream: DreamRecord) => {
    const dreamDate = new Date(dream.date.replace(/\./g, '-'))
    console.log('梦境记录日期:', dream.date, '转换后:', dreamDate);
    const isInRange = dreamDate >= monday && dreamDate <= now;
    console.log('是否在范围内:', isInRange);
    return isInRange;
  })
  
  console.log('本周的梦境记录:', weeklyDreams);
  return weeklyDreams;
}

// 分析梦境情绪
function analyzeDreamEmotion(dream: DreamRecord): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['快乐', '开心', '幸福', '美好', '希望', '成功']
  const negativeWords = ['害怕', '焦虑', '痛苦', '悲伤', '恐惧', '失败']
  
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    if (dream.content.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (dream.content.includes(word)) negativeCount++
  })
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// 分析梦境主题
function analyzeDreamTheme(dream: DreamRecord): keyof WeeklyReportData['themes'] {
  const workWords = ['工作', '职场', '老板', '同事', '项目', '会议']
  const lifeWords = ['生活', '家庭', '休闲', '娱乐', '旅行', '美食']
  const relationshipWords = ['朋友', '恋人', '家人', '社交', '感情']
  
  let counts = {
    work: 0,
    life: 0,
    relationship: 0
  }
  
  workWords.forEach(word => {
    if (dream.content.includes(word)) counts.work++
  })
  
  lifeWords.forEach(word => {
    if (dream.content.includes(word)) counts.life++
  })
  
  relationshipWords.forEach(word => {
    if (dream.content.includes(word)) counts.relationship++
  })
  
  const maxCount = Math.max(counts.work, counts.life, counts.relationship)
  if (maxCount === 0) return 'other'
  if (maxCount === counts.work) return 'work'
  if (maxCount === counts.life) return 'life'
  return 'relationship'
}

// 生成周报数据
export function generateWeeklyReportData(dreams: DreamRecord[]): WeeklyReportData {
  if (!dreams.length) {
    return {
      startDate: '',
      endDate: '',
      dreamCount: 0,
      emotions: { positive: 0, neutral: 0, negative: 0 },
      themes: { work: 0, life: 0, relationship: 0, other: 0 },
      keywords: []
    }
  }

  // 排序梦境记录
  const sortedDreams = dreams.sort((a, b) => 
    new Date(b.date.replace(/\./g, '-')).getTime() - 
    new Date(a.date.replace(/\./g, '-')).getTime()
  )

  // 统计情绪分布
  const emotions = {
    positive: 0,
    neutral: 0,
    negative: 0
  }
  
  // 统计主题分布
  const themes = {
    work: 0,
    life: 0,
    relationship: 0,
    other: 0
  }
  
  // 收集所有标签
  const allTags = new Set<string>()
  
  dreams.forEach(dream => {
    // 情绪统计
    emotions[analyzeDreamEmotion(dream)]++
    
    // 主题统计
    themes[analyzeDreamTheme(dream)]++
    
    // 收集标签
    if (dream.tags && Array.isArray(dream.tags)) {
      dream.tags.forEach(tag => allTags.add(tag))
    }
  })

  return {
    startDate: sortedDreams[sortedDreams.length - 1].date,
    endDate: sortedDreams[0].date,
    dreamCount: dreams.length,
    emotions,
    themes,
    keywords: Array.from(allTags).slice(0, 10) // 最多取10个关键词
  }
}

// 生成周报内容
export async function generateWeeklyReportContent(dreams: DreamRecord[]): Promise<WeeklyReportContent> {
  console.log('开始生成周报内容，输入的梦境记录:', dreams);
  
  // 检查缓存
  const cachedReport = wx.getStorageSync('weeklyReport')
  const lastDreamCount = wx.getStorageSync('lastDreamCount') || 0
  console.log('缓存状态 - 上次记录数:', lastDreamCount, '当前记录数:', dreams.length);
  console.log('缓存的报告:', cachedReport);
  
  // 如果没有新的梦境记录，且缓存存在，直接返回缓存
  if (dreams.length === lastDreamCount && cachedReport) {
    console.log('使用缓存的周报内容');
    return cachedReport;
  }
  
  if (!dreams || dreams.length === 0) {
    console.log('没有梦境数据，返回默认周报');
    const defaultReport = getDefaultWeeklyReport();
    console.log('默认周报内容:', defaultReport);
    return defaultReport;
  }

  try {
    console.log('生成统计数据...');
    const reportData = generateWeeklyReportData(dreams);
    console.log('统计数据:', reportData);
    
    // 生成关键词字符串
    const keywordsStr = reportData.keywords
      .map(keyword => `【${keyword}】`)
      .join(' ');
    console.log('关键词字符串:', keywordsStr);

    // 生成情绪趋势描述
    const emotionTrend = getEmotionTrendDescription(reportData.emotions);
    console.log('情绪趋势:', emotionTrend);

    // 生成分析和建议
    console.log('开始生成AI分析...');
    const { analysis, aiSuggestion } = await generateAIAnalysis(dreams, reportData);
    console.log('AI分析结果:', { analysis, aiSuggestion });

    // 生成最终报告
    const finalReport = {
      keywords: keywordsStr,
      analysis,
      emotionTrend,
      aiSuggestion
    };

    console.log('生成的最终报告:', finalReport);

    // 更新缓存
    wx.setStorageSync('weeklyReport', finalReport);
    wx.setStorageSync('lastDreamCount', dreams.length);
    console.log('缓存已更新 - 记录数:', dreams.length);

    return finalReport;
  } catch (error) {
    console.error('生成周报过程中出错:', error);
    const defaultReport = getDefaultWeeklyReport();
    console.log('返回默认周报:', defaultReport);
    return defaultReport;
  }
}

// 获取情绪趋势描述
function getEmotionTrendDescription(emotions: WeeklyReportData['emotions']): string {
  const total = emotions.positive + emotions.neutral + emotions.negative
  const positiveRatio = emotions.positive / total
  const negativeRatio = emotions.negative / total
  
  if (positiveRatio > 0.6) {
    return '本周梦境情绪总体积极向上，显示你正处于一个不错的状态。'
  } else if (negativeRatio > 0.6) {
    return '本周梦境情绪偏向消极，建议多关注自己的心理状态。'
  } else {
    return '本周梦境情绪平稳，显示你能够较好地平衡各种情绪。'
  }
}

// 生成AI分析和建议
async function generateAIAnalysis(dreams: DreamRecord[], reportData: WeeklyReportData): Promise<{ analysis: string, aiSuggestion: string }> {
  try {
    console.log('准备生成分析提示词...');
    const prompt = generateAnalysisPrompt(dreams, reportData);
    console.log('生成的提示词:', prompt);

    console.log('调用DeepSeek API...');
    const response = await client.chat({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的梦境分析师，负责生成用户的梦境周报。请基于提供的梦境记录数据，生成包含梦境解析和建议的分析报告。输出格式必须是JSON，包含analysis和suggestion两个字段。analysis字段分析梦境的共性特征和潜在含义，suggestion字段基于分析给出具体可行的建议，每条建议需要用'\\n'换行符分隔。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    console.log('API响应:', response);

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
      console.error('API返回内容为空');
      return {
        analysis: getDefaultAnalysis(),
        aiSuggestion: getDefaultSuggestion()
      };
    }

    console.log('解析API返回内容...');
    const content = JSON.parse(response.choices[0].message.content);
    console.log('解析后的内容:', content);

    // 确保建议之间有换行
    const suggestion = content.suggestion ? content.suggestion.split('建议').filter(Boolean).map((s: string) => '建议' + s.trim()).join('\n\n') : getDefaultSuggestion();

    return {
      analysis: content.analysis || getDefaultAnalysis(),
      aiSuggestion: suggestion
    };
  } catch (error) {
    console.error('生成AI分析失败:', error);
    return {
      analysis: getDefaultAnalysis(),
      aiSuggestion: getDefaultSuggestion()
    };
  }
}

// 生成分析提示词
function generateAnalysisPrompt(dreams: DreamRecord[], reportData: WeeklyReportData): string {
  return JSON.stringify({
    task: 'weekly_dream_analysis',
    role: '你是一位专业的梦境分析师和心理咨询师，擅长通过分析梦境来帮助人们理解自己的潜意识和心理状态。',
    dreams: dreams.map(dream => ({
      content: dream.content,
      emotion: analyzeDreamEmotion(dream),
      theme: analyzeDreamTheme(dream),
      date: dream.date,
      weekday: dream.weekday
    })),
    statistics: {
      period: `${reportData.startDate} 至 ${reportData.endDate}`,
      dreamCount: reportData.dreamCount,
      emotions: reportData.emotions,
      themes: reportData.themes,
      keywords: reportData.keywords
    },
    requirements: {
      analysis: {
        focus_points: [
          "梦境的共性特征和核心主题",
          "情绪变化趋势及其可能反映的心理状态",
          "重复出现的符号或场景的深层含义",
          "潜在的压力源或困扰",
          "积极的成长迹象和潜力"
        ],
        style: "专业、温和、富有洞察力，避免过于玄学的解读",
        length: "200-300字"
      },
      suggestion: {
        principles: [
          "针对性：基于分析给出的具体建议",
          "可行性：确保建议具体且容易执行",
          "积极性：以建设性和支持性的语气表达",
          "全面性：覆盖生活、工作、情感等多个维度"
        ],
        format: "3-5条清晰的建议，每条建议应该简洁明了",
        example: "建议1：每晚睡前花10分钟进行冥想，帮助缓解工作压力..."
      },
      output_format: {
        analysis: "连贯的段落，避免分点",
        suggestion: "分点列出，每点都要具体且可执行"
      }
    }
  })
}

// 获取默认周报内容
function getDefaultWeeklyReport(): WeeklyReportContent {
  return {
    keywords: '开始记录你的第一个梦境吧',
    analysis: getDefaultAnalysis(),
    emotionTrend: '开始记录梦境，探索内心情感的变化。',
    aiSuggestion: getDefaultSuggestion()
  }
}

function getDefaultAnalysis(): string {
  return '开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。'
}

function getDefaultSuggestion(): string {
  return '建议1：在睡醒后第一时间记录梦境，这样能记住更多细节。\n\n建议2：从印象最深刻的片段开始写起，慢慢培养记录习惯。\n\n建议3：尝试每天固定时间记录，让记录梦境成为一种习惯。'
} 