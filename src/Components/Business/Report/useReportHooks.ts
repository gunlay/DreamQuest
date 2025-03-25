import { homeApi } from '@/api/home';
import { profileApi } from '@/api/profile';
import { DreamCardDTO } from '@/api/types/record';

export interface ReportDTO {
  dreamCount: number; // 梦境记录数量
  emotions: {
    positive: number; // 积极情绪数量
    neutral: number; // 中性情绪数量
    negative: number; // 消极情绪数量
  };
  themes: {
    work: number; // 工作相关
    life: number; // 生活相关
    relationship: number; // 人际关系
    other: number; // 其他
  };
  keywords: string[]; // 关键词列表
}

export interface ReportParams {
  keywords: string;
  analysis: string[];
  emotionTrend: string;
  aiSuggestion: string[];
}

const defaultReport: ReportParams = {
  keywords: '开始记录你的第一个梦境吧',
  analysis: ['开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。'],
  emotionTrend: '开始记录梦境，探索内心情感的变化。',
  aiSuggestion: [
    '建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。',
  ],
};

// 分析梦境情绪
function analyzeDreamEmotion(dream: DreamCardDTO): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['快乐', '开心', '幸福', '美好', '希望', '成功'];
  const negativeWords = ['害怕', '焦虑', '痛苦', '悲伤', '恐惧', '失败'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (dream.desc.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (dream.desc.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// 分析梦境主题
function analyzeDreamTheme(dream: DreamCardDTO): keyof ReportDTO['themes'] {
  const workWords = ['工作', '职场', '老板', '同事', '项目', '会议'];
  const lifeWords = ['生活', '家庭', '休闲', '娱乐', '旅行', '美食'];
  const relationshipWords = ['朋友', '恋人', '家人', '社交', '感情'];

  const counts = {
    work: 0,
    life: 0,
    relationship: 0,
  };

  workWords.forEach((word) => {
    if (dream.desc.includes(word)) counts.work++;
  });

  lifeWords.forEach((word) => {
    if (dream.desc.includes(word)) counts.life++;
  });

  relationshipWords.forEach((word) => {
    if (dream.desc.includes(word)) counts.relationship++;
  });

  const maxCount = Math.max(counts.work, counts.life, counts.relationship);
  if (maxCount === 0) return 'other';
  if (maxCount === counts.work) return 'work';
  if (maxCount === counts.life) return 'life';
  return 'relationship';
}

// 生成周报数据
export function generateReportData(dreams: DreamCardDTO[]): ReportDTO {
  if (!dreams.length) {
    return {
      dreamCount: 0,
      emotions: { positive: 0, neutral: 0, negative: 0 },
      themes: { work: 0, life: 0, relationship: 0, other: 0 },
      keywords: [],
    };
  }

  // 统计情绪分布
  const emotions = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  // 统计主题分布
  const themes = {
    work: 0,
    life: 0,
    relationship: 0,
    other: 0,
  };

  // 收集所有标签
  const allTags = new Set<string>();

  dreams.forEach((dream) => {
    // 情绪统计
    emotions[analyzeDreamEmotion(dream)]++;

    // 主题统计
    themes[analyzeDreamTheme(dream)]++;

    // 收集标签
    if (dream.tags && Array.isArray(dream.tags)) {
      dream.tags.forEach((tag) => allTags.add(tag));
    }
  });

  return {
    dreamCount: dreams.length,
    emotions,
    themes,
    keywords: Array.from(allTags).slice(0, 10), // 最多取10个关键词
  };
}

// 生成周报内容
export function generateReportContent(dreams: DreamCardDTO[]): ReportParams {
  if (!dreams?.length) return defaultReport;

  try {
    const reportData = generateReportData(dreams);

    // 生成关键词字符串
    const keywordsStr = reportData.keywords.map((keyword) => `【${keyword}】`).join(' ');

    // 生成情绪趋势描述
    const emotionTrend = getEmotionTrendDescription(reportData.emotions);

    // 生成最终报告
    const finalReport = {
      keywords: keywordsStr,
      analysis: [],
      emotionTrend,
      aiSuggestion: [],
    };

    return finalReport;
  } catch (error) {
    return defaultReport;
  }
}

// 获取情绪趋势描述
function getEmotionTrendDescription(emotions: ReportDTO['emotions']): string {
  const total = emotions.positive + emotions.neutral + emotions.negative;
  const positiveRatio = emotions.positive / total;
  const negativeRatio = emotions.negative / total;

  if (positiveRatio > 0.6) {
    return '本周梦境情绪总体积极向上，显示你正处于一个不错的状态。';
  } else if (negativeRatio > 0.6) {
    return '本周梦境情绪偏向消极，建议多关注自己的心理状态。';
  } else {
    return '本周梦境情绪平稳，显示你能够较好地平衡各种情绪。';
  }
}

// // 生成AI分析和建议
export async function generateAIAnalysis(
  type: 'week' | 'month',
  retryFlag?: boolean
): Promise<{ analysis: string[]; aiSuggestion: string[] }> {
  try {
    const fecthFn = {
      week: homeApi.fetchWeeklyReport,
      month: profileApi.fetchMonthReport,
    }[type];
    if (!fecthFn) throw new Error('Invalid type');
    const data = await fecthFn({ retryFlag });

    if (!data) throw new Error('Invalid Data');
    const content = JSON.parse(data.replace(/^```json\n|```$/g, ''));

    // 确保建议之间有换行
    const analysis: string[] = content.analysis
      ? content.suggestion.split('\\n').filter(Boolean)
      : defaultReport.analysis;
    const suggestion: string[] = content.suggestion
      ? content.suggestion.split('\\n').filter(Boolean)
      : defaultReport;

    return {
      analysis,
      aiSuggestion: suggestion,
    };
  } catch (error) {
    return {
      analysis: defaultReport.analysis,
      aiSuggestion: defaultReport.aiSuggestion,
    };
  }
}
