import React, { useMemo, useState } from 'react';
import { HotSearchItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ListFilter } from 'lucide-react';
import { Segment, useDefault } from 'segmentit';
import { STOP_WORDS } from '../utils/stopwords';

interface AnalysisViewProps {
  items: HotSearchItem[];
  onTermClick?: (term: string) => void;
  isDarkMode?: boolean;
}

// Modern vibrant color palette - teal to purple gradient
const COLORS = [
  '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#2dd4bf',
  '#5eead4', '#99f6e4', '#a855f7', '#9333ea', '#7e22ce',
  '#c084fc', '#d8b4fe', '#06b6d4', '#0891b2', '#0e7490',
  '#22d3ee', '#67e8f9', '#ec4899', '#f472b6', '#fb7185'
];

// Initialize segmentit
const segmentit = useDefault(new Segment());

// Custom Dictionary for explicit priority extraction
const CUSTOM_DICTIONARY = [
  '微博之夜', '星穹铁道', '绝区零', '王者荣耀', '英雄联盟', '和平精英',
  '原神', '崩坏', '米哈游', '腾讯', '阿里', '字节跳动', '拼多多',
  '华为', '小米', '苹果', '三星', '比亚迪', '特斯拉', '理想汽车', '蔚来',
  '演唱会', '发布会', '音乐节', '跨年晚会', '春晚', '奥运会', '亚运会',
  '电视剧', '电影', '综艺', '直播间', '预售', '首发', '官宣', '定档',
  '考研', '高考', '公务员', '双十一', '618', '情人节', '母亲节', '父亲节',
  '人工智能', 'ChatGPT', 'Sora', 'Gemini', 'DeepSeek', 'OpenAI', '英伟达',
  '特朗普', '拜登', '普京', '泽连斯基', '马斯克', '胖东来', '爱泼斯坦'
];

const AnalysisView: React.FC<AnalysisViewProps> = ({ items, onTermClick, isDarkMode = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Data Processing
  const topKeywords = useMemo(() => {
    if (!items || items.length === 0) return [];

    const frequency: Record<string, number> = {};
    let allTitles = items.map(i => i.title).join(' ');

    // 1. Pre-process explicitly known terms from CUSTOM_DICTIONARY
    CUSTOM_DICTIONARY.forEach(term => {
      const regex = new RegExp(term, 'gi');
      const matches = allTitles.match(regex);
      if (matches) {
        frequency[term] = (frequency[term] || 0) + matches.length;
        allTitles = allTitles.replace(regex, ' ');
      }
    });

    // 2. Clean text (Keep Chinese, English, Numbers, AND special tech characters like +, #, .)
    const cleanText = allTitles.replace(/[^\u4e00-\u9fa5a-zA-Z0-9+#.]/g, ' ');

    // 3. Advanced Segmentation using 'segmentit'
    try {
        const result = segmentit.doSegment(cleanText, {
          simple: true,
          stripPunctuation: true
        });

        result.forEach((segment: string) => {
             const word = segment.trim();

             // Filter Logic:
             // 1. Must be longer than 1 character
             // 2. Must not be in the comprehensive STOP_WORDS list
             // 3. Must not be a pure number
             if (word.length > 1 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
                 frequency[word] = (frequency[word] || 0) + 1;
             }
        });

    } catch (e) {
        console.warn("Segmentit failed, falling back to simple split", e);
        // Fallback: Simple Split
        const parts = cleanText.split(/\s+/);
        parts.forEach(part => {
            if (!part || STOP_WORDS.has(part) || /^\d+$/.test(part)) return;
            if (part.length > 1) {
                 frequency[part] = (frequency[part] || 0) + 1;
            }
        });
    }

    const sortedKeywords = Object.entries(frequency)
      .map(([text, value]) => ({ name: text, value }))
      .sort((a, b) => b.value - a.value);

    // Limit to top 20 for the bar chart
    return sortedKeywords.slice(0, 20);
  }, [items]);

  if (!items || items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
            <TrendingUp size={48} className="mb-4 text-gray-300 dark:text-gray-600 opacity-50" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">暂无数据可分析</p>
            <p className="text-sm mt-2">请先在看板中获取热搜数据</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700">
              <TrendingUp size={20} className="text-white" />
            </div>
            趋势分析
          </h2>
          <div className="badge badge-primary">
            基于 {items.length} 条热搜数据
          </div>
      </div>

      {/* Top Keywords Chart */}
      <div className="card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50 dark:border-slate-700/50">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600">
                <ListFilter size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">全网热度关键词 TOP 20</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">点击柱状图可筛选相关热搜</p>
              </div>
          </div>

          <div className="w-full h-[580px]">
              {topKeywords.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart
                        data={topKeywords}
                        layout="vertical"
                        margin={{ left: 10, right: 50, top: 20, bottom: 20 }}
                        barCategoryGap="25%"
                      >
                          <CartesianGrid
                            strokeDasharray="0"
                            horizontal={true}
                            vertical={false}
                            stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
                          />
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={110}
                            tick={{ fontSize: 13.5, fontWeight: 500, fill: isDarkMode ? '#cbd5e1' : '#475569' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                              cursor={false}
                              contentStyle={{
                                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                padding: '16px'
                              }}
                              labelStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', fontWeight: '600' }}
                              content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="p-2">
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">{payload[0].payload.name}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg">
                                                <span className="text-white font-bold text-lg">{payload[0].value}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">出现频次</span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">热搜关键词</span>
                                            </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                              }}
                          />
                          <Bar
                            dataKey="value"
                            radius={[0, 10, 10, 0]}
                            barSize={26}
                            animationDuration={1000}
                            animationBegin={0}
                            onClick={(data) => onTermClick && onTermClick(data.name)}
                            onMouseEnter={(_, index) => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          >
                              {topKeywords.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    opacity={hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.3}
                                  />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    暂无足够数据生成图表
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AnalysisView;
