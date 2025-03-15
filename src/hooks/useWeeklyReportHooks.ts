import { WeeklyReportDTO } from "@/api/types/home";
import { DreamCardDTO } from "@/api/types/record";

export interface WeeklyReportParams {
  keywords: string;
  analysis: string;
  emotionTrend: string;
  aiSuggestion: string;
}

const defaultWeeklyReport: WeeklyReportParams = {
  keywords: "开始记录你的第一个梦境吧",
  analysis:
    "开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。",
  emotionTrend: "开始记录梦境，探索内心情感的变化。",
  aiSuggestion:
    "建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。",
};
  
// 分析梦境情绪
function analyzeDreamEmotion(
  dream: DreamCardDTO
): "positive" | "neutral" | "negative" {
  const positiveWords = ["快乐", "开心", "幸福", "美好", "希望", "成功"];
  const negativeWords = ["害怕", "焦虑", "痛苦", "悲伤", "恐惧", "失败"];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (dream.desc.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (dream.desc.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}
  
// 分析梦境主题
function analyzeDreamTheme(
  dream: DreamCardDTO
): keyof WeeklyReportDTO["themes"] {
  const workWords = ["工作", "职场", "老板", "同事", "项目", "会议"];
  const lifeWords = ["生活", "家庭", "休闲", "娱乐", "旅行", "美食"];
  const relationshipWords = ["朋友", "恋人", "家人", "社交", "感情"];

  let counts = {
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
  if (maxCount === 0) return "other";
  if (maxCount === counts.work) return "work";
  if (maxCount === counts.life) return "life";
  return "relationship";
}

// 生成周报数据
export function generateWeeklyReportData(
  dreams: DreamCardDTO[]
): WeeklyReportDTO {
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
export function generateWeeklyReportContent(
  dreams: DreamCardDTO[]
): WeeklyReportParams {
  if (!dreams?.length) return defaultWeeklyReport;

  try {
    const reportData = generateWeeklyReportData(dreams);

    // 生成关键词字符串
    const keywordsStr = reportData.keywords
      .map((keyword) => `【${keyword}】`)
      .join(" ");

    // 生成情绪趋势描述
    const emotionTrend = getEmotionTrendDescription(reportData.emotions);

    // 生成分析和建议

    // const { analysis, aiSuggestion } = await generateAIAnalysis(
    //   dreams,
    //   reportData
    // );

    // 生成最终报告
    const finalReport = {
      keywords: keywordsStr,
      analysis: '',
      emotionTrend,
      aiSuggestion: '',
    };

    return finalReport;
  } catch (error) {
    return defaultWeeklyReport;
  }
}
  
// 获取情绪趋势描述
function getEmotionTrendDescription(
  emotions: WeeklyReportDTO["emotions"]
): string {
  const total = emotions.positive + emotions.neutral + emotions.negative;
  const positiveRatio = emotions.positive / total;
  const negativeRatio = emotions.negative / total;

  if (positiveRatio > 0.6) {
    return "本周梦境情绪总体积极向上，显示你正处于一个不错的状态。";
  } else if (negativeRatio > 0.6) {
    return "本周梦境情绪偏向消极，建议多关注自己的心理状态。";
  } else {
    return "本周梦境情绪平稳，显示你能够较好地平衡各种情绪。";
  }
}

// // 生成AI分析和建议
// async function generateAIAnalysis(
//   dreams: DreamRecord[],
//   reportData: WeeklyReportDTO
// ): Promise<{ analysis: string; aiSuggestion: string }> {
//   try {
//     const prompt = generateAnalysisPrompt(dreams, reportData);

//     const response = await client.chat({
//       model: "deepseek-chat",
//       messages: [
//         {
//           role: "system",
//           content:
//             "你是一个专业的梦境分析师，负责生成用户的梦境周报。请基于提供的梦境记录数据，生成包含梦境解析和建议的分析报告。输出格式必须是JSON，包含analysis和suggestion两个字段。analysis字段分析梦境的共性特征和潜在含义，suggestion字段基于分析给出具体可行的建议，每条建议需要用'\\n'换行符分隔。",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 0.7,
//       response_format: { type: "json_object" },
//     });

//     if (
//       !response ||
//       !response.choices ||
//       !response.choices[0] ||
//       !response.choices[0].message ||
//       !response.choices[0].message.content
//     ) {
//       return {
//         analysis: getDefaultAnalysis(),
//         aiSuggestion: getDefaultSuggestion(),
//       };
//     }

//     const content = JSON.parse(response.choices[0].message.content);

//     // 确保建议之间有换行
//     const suggestion = content.suggestion
//       ? content.suggestion
//           .split("建议")
//           .filter(Boolean)
//           .map((s: string) => "建议" + s.trim())
//           .join("\n\n")
//       : getDefaultSuggestion();

//     return {
//       analysis: content.analysis || getDefaultAnalysis(),
//       aiSuggestion: suggestion,
//     };
//   } catch (error) {
//     return {
//       analysis: getDefaultAnalysis(),
//       aiSuggestion: getDefaultSuggestion(),
//     };
//   }
// }
  
// // 生成分析提示词
// function generateAnalysisPrompt(
//   dreams: DreamRecord[],
//   reportData: WeeklyReportDTO
// ): string {
//   return JSON.stringify({
//     task: "weekly_dream_analysis",
//     role: "你是一位专业的梦境分析师和心理咨询师，擅长通过分析梦境来帮助人们理解自己的潜意识和心理状态。",
//     dreams: dreams.map((dream) => ({
//       content: dream.content,
//       emotion: analyzeDreamEmotion(dream),
//       theme: analyzeDreamTheme(dream),
//       date: dream.date,
//       weekday: dream.weekday,
//     })),
//     statistics: {
//       dreamCount: reportData.dreamCount,
//       emotions: reportData.emotions,
//       themes: reportData.themes,
//       keywords: reportData.keywords,
//     },
//     requirements: {
//       analysis: {
//         focus_points: [
//           "梦境的共性特征和核心主题",
//           "情绪变化趋势及其可能反映的心理状态",
//           "重复出现的符号或场景的深层含义",
//           "潜在的压力源或困扰",
//           "积极的成长迹象和潜力",
//         ],
//         style: "专业、温和、富有洞察力，避免过于玄学的解读",
//         length: "200-300字",
//       },
//       suggestion: {
//         principles: [
//           "针对性：基于分析给出的具体建议",
//           "可行性：确保建议具体且容易执行",
//           "积极性：以建设性和支持性的语气表达",
//           "全面性：覆盖生活、工作、情感等多个维度",
//         ],
//         format: "3-5条清晰的建议，每条建议应该简洁明了",
//         example: "建议1：每晚睡前花10分钟进行冥想，帮助缓解工作压力...",
//       },
//       output_format: {
//         analysis: "连贯的段落，避免分点",
//         suggestion: "分点列出，每点都要具体且可执行",
//       },
//     },
//   });
// }