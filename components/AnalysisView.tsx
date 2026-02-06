import React, { useMemo } from 'react';
import { HotSearchItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ListFilter } from 'lucide-react';
import * as d3 from 'd3';
import { Segment, useDefault } from 'segmentit';
import { STOP_WORDS } from '../utils/stopwords';

interface AnalysisViewProps {
  items: HotSearchItem[];
  onTermClick?: (term: string) => void;
  isDarkMode?: boolean;
}

// Professional Palette (Tableau 10)
const COLOR_SCALE = d3.scaleOrdinal(d3.schemeTableau10);

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
    // Old regex: /[^\u4e00-\u9fa5a-zA-Z0-9]/g  <- Stripped C++ or C#
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
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            <TrendingUp size={48} className="mb-4 text-gray-300 dark:text-gray-600 opacity-50" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">暂无数据可分析</p>
            <p className="text-sm mt-2">请先在看板中获取热搜数据</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <TrendingUp className="text-primary-600 dark:text-primary-400" />
            趋势分析
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start md:self-auto">
            基于 {items.length} 条热搜数据
          </span>
      </div>
      
      {/* Top Keywords Chart - Optimized for mobile and desktop */}
      <div className="bg-white dark:bg-slate-900/60 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <ListFilter className="text-primary-500" size={20} />
              <h3 className="font-bold text-gray-700 dark:text-gray-200">全网热度关键词 TOP 20</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto hidden md:block">点击柱状图可筛选</p>
          </div>

          <div className="w-full h-[600px]">
              {topKeywords.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={topKeywords} 
                        layout="vertical" 
                        margin={{ left: 0, right: 30, top: 10, bottom: 10 }}
                      >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            tick={{ fontSize: 13, fontWeight: 600, fill: isDarkMode ? '#cbd5e1' : '#374151' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                              cursor={{fill: isDarkMode ? '#1e293b' : '#f9fafb', opacity: 0.8}}
                              content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-700 shadow-xl rounded-lg z-50">
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-base mb-1">{payload[0].payload.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                            出现频次: <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-lg">{payload[0].value}</span>
                                        </div>
                                        <p className="text-xs text-primary-500 dark:text-primary-400 mt-2">点击筛选此关键词</p>
                                      </div>
                                    );
                                  }
                                  return null;
                              }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 4, 4, 0]} 
                            barSize={20} 
                            animationDuration={1000}
                            onClick={(data) => onTermClick && onTermClick(data.name)}
                            className="cursor-pointer"
                          >
                              {topKeywords.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLOR_SCALE(index.toString())} className="hover:opacity-80 transition-opacity" />
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