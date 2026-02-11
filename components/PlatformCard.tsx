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
  isDarkMode?: boolean;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  items,
  isLoading,
  onRefresh,
  readOnly = false,
  lastUpdated,
  isDarkMode = false
}) => {
  const config = PLATFORM_CONFIG[platform];

  return (
    <div className="card platform-card flex flex-col h-[540px] overflow-hidden group">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.color} bg-opacity-10`}>
            <span className="text-xl">{config.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">{config.label}</h3>
            {items.length > 0 && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Top {items.length} 热搜
              </span>
            )}
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2.5 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all ${
              isLoading ? 'animate-spin text-primary-500' : ''
            }`}
            title="刷新此榜单"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium">正在获取数据...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={28} className="opacity-30" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">暂无数据</p>
            <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">请尝试刷新或更换关键词</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 group/item border border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-lg"
                  title={item.title}
                >
                  <div className={`rank-badge rank-${item.rank <= 3 ? item.rank : 'other'}`}>
                    {item.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-snug group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors line-clamp-2">
                      {item.title}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      {item.score > 0 && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          {item.score >= 10000 ? (item.score / 10000).toFixed(1) + 'w' : item.score.toLocaleString()}
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
      <div className="px-4 py-3 border-t border-gray-200/50 dark:border-slate-700/50 text-[10px] text-gray-400 dark:text-gray-500 text-center flex justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
        <span className="font-medium">
          {isLoading ? '更新中...' : (readOnly && lastUpdated ? '历史快照' : '实时数据')}
        </span>
        <span className="font-mono opacity-70">
          {lastUpdated
            ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        </span>
      </div>
    </div>
  );
};

export default PlatformCard;
