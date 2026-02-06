import React from 'react';
import { HotSearchItem, Platform } from '../types';
import { PLATFORM_CONFIG } from '../constants';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface PlatformCardProps {
  platform: Platform;
  items: HotSearchItem[];
  isLoading: boolean;
  onRefresh: () => void;
  readOnly?: boolean;
  lastUpdated?: number;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ 
  platform, 
  items, 
  isLoading, 
  onRefresh, 
  readOnly = false,
  lastUpdated 
}) => {
  const config = PLATFORM_CONFIG[platform];

  // Helper for rank styling
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 shadow-sm';
    if (rank === 2) return 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-500 shadow-sm';
    if (rank === 3) return 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 shadow-sm';
    return 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 border-transparent';
  };

  return (
    <div className="glass-card rounded-2xl flex flex-col h-[520px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 group dark:bg-slate-900/60 dark:border-slate-700/50">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-gray-100/50 dark:border-slate-700/50 flex justify-between items-center relative overflow-hidden`}>
        {/* Subtle decorative background in header */}
        <div className={`absolute inset-0 opacity-10 dark:opacity-20 ${config.color}`}></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <span className="text-2xl filter drop-shadow-sm">{config.icon}</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-none">{config.label}</h3>
            {items.length > 0 && <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Top {items.length} 热搜</span>}
          </div>
        </div>
        
        {!readOnly && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-white dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm transition-all relative z-10 ${isLoading ? 'animate-spin text-primary-500' : ''}`}
            title="刷新此榜单"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 scroll-smooth custom-scrollbar">
        {isLoading && items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
            <div className="relative">
                 <div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-xs font-medium animate-pulse">正在获取数据...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <TrendingUp size={24} className="opacity-30" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">暂无数据</p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">请尝试刷新或更换关键词</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={item.id}>
                 <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 hover:backdrop-blur-sm transition-all duration-200 group/item border border-transparent hover:border-gray-100 dark:hover:border-slate-700 hover:shadow-sm"
                    title={item.title}
                 >
                    <div className={`mt-0.5 min-w-[24px] h-6 flex items-center justify-center text-xs font-bold rounded-lg border ${getRankStyle(item.rank)}`}>
                      {item.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-snug group-hover/item:text-primary-700 dark:group-hover/item:text-primary-400 transition-colors line-clamp-2">
                        {item.title}
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        {item.score > 0 && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1 bg-gray-50/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
                            🔥 {(item.score / 10000).toFixed(1)}w
                          </span>
                        )}
                      </div>
                    </div>
                 </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer info */}
      <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm px-4 py-2 border-t border-gray-100/50 dark:border-slate-700/50 text-[10px] text-gray-400 dark:text-gray-500 text-center flex justify-between items-center">
         <span>
             {isLoading ? '更新中...' : (readOnly && lastUpdated ? '历史快照' : '实时数据')}
         </span>
         <span className="font-mono opacity-70">
            {lastUpdated 
                ? new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }
         </span>
      </div>
    </div>
  );
};

export default PlatformCard;