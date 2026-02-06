import React, { useState, useEffect } from 'react';
import { Platform, ViewMode } from '../types';
import { PLATFORM_CONFIG, PLATFORM_CATEGORIES } from '../constants';
import { Search, X, Plus, Filter, RefreshCw, CheckSquare, Square, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  keywords: string[];
  selectedPlatforms: Platform[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onTogglePlatform: (platform: Platform) => void;
  onToggleAllPlatforms: (selectAll: boolean) => void;
  onToggleCategory: (platforms: Platform[], select: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  viewMode?: ViewMode; // Add viewMode prop to handle display logic
}

const FilterBar: React.FC<FilterBarProps> = ({
  keywords,
  selectedPlatforms,
  onAddKeyword,
  onRemoveKeyword,
  onTogglePlatform,
  onToggleAllPlatforms,
  onToggleCategory,
  onRefresh,
  isRefreshing,
  autoRefresh,
  onToggleAutoRefresh,
  viewMode = 'dashboard'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // 核心修复：宽死区（Hysteresis）防抖动逻辑
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          const COLLAPSE_THRESHOLD = 100; 
          const EXPAND_THRESHOLD = 20;

          if (!isScrolled && currentScrollY > COLLAPSE_THRESHOLD) {
            setIsScrolled(true);
            setIsFilterExpanded(false);
          } else if (isScrolled && currentScrollY < EXPAND_THRESHOLD) {
            setIsScrolled(false);
            setIsFilterExpanded(true);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAddKeyword(inputValue.trim());
      setInputValue('');
    }
  };

  const allPlatforms = Object.values(Platform);
  const isAllSelected = selectedPlatforms.length === allPlatforms.length;
  const isSnapshotMode = viewMode === 'snapshot';

  return (
    // Sticky Header with Glassmorphism & Dynamic Padding
    <div className={`sticky top-0 z-20 mb-6 transition-all duration-300 ease-in-out ${isScrolled ? 'pt-2' : 'pt-2 md:pt-4'}`}>
      <div 
        className={`glass rounded-2xl shadow-lg transition-all duration-300 border-white/40 dark:border-slate-700/50
          ${isScrolled 
            ? 'p-3 md:p-3 shadow-gray-200/80 dark:shadow-slate-900/50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl' // 紧凑模式
            : 'p-4 md:p-5 shadow-gray-200/50 dark:shadow-slate-900/30 space-y-4 dark:bg-slate-900/60' // 正常模式
          }`}
      >
        
        {/* Platform Selection Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <button 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-sm group focus:outline-none"
              >
                  <div className={`p-1.5 rounded-lg transition-colors ${isScrolled ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'}`}>
                    <Filter size={16} /> 
                  </div>
                  <span className="truncate">平台筛选</span>
                  {/* 收起状态下显示已选数量 */}
                  {!isFilterExpanded && (
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                       {selectedPlatforms.length} 已选
                    </span>
                  )}
              </button>
              
              {(isFilterExpanded || !isScrolled) && (
                <button 
                    onClick={() => onToggleAllPlatforms(!isAllSelected)}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                >
                    {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    {isAllSelected ? '取消全选' : '全选'}
                </button>
              )}
          </div>
          
          <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors transform duration-300 ${isFilterExpanded ? 'rotate-180' : 'rotate-0'}`}
          >
              <ChevronDown size={20} />
          </button>
        </div>

        {/* Grouped Platform List - Collapsible with Max Height */}
        <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out`}
            style={{ 
                maxHeight: isFilterExpanded ? (isScrolled ? '85vh' : '2000px') : '0px',
                opacity: isFilterExpanded ? 1 : 0
            }}
        >
          {/* 内层容器：在吸顶模式下限制最大高度并允许滚动 */}
          <div className={`border-t border-gray-200/50 dark:border-slate-700/50 overflow-y-auto custom-scrollbar overscroll-contain
             ${isScrolled ? 'mt-2 pt-2 max-h-[60vh]' : 'mt-4 pt-4'}
          `}>
              {Object.entries(PLATFORM_CATEGORIES).map(([category, platforms]) => {
                  const isCategoryAllSelected = platforms.every(p => selectedPlatforms.includes(p));

                  return (
                    <div key={category} className="mb-3 last:mb-0">
                        <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white/0 dark:bg-slate-900/0 backdrop-blur-sm z-10 py-1">
                          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{category}</h4>
                          <button
                            onClick={() => onToggleCategory(platforms, !isCategoryAllSelected)}
                            className="text-[10px] text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          >
                            {isCategoryAllSelected ? '取消' : '全选'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {platforms.map((platform) => {
                                const isSelected = selectedPlatforms.includes(platform);
                                const config = PLATFORM_CONFIG[platform];
                                return (
                                    <button
                                    key={platform}
                                    onClick={() => onTogglePlatform(platform)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border backdrop-blur-sm
                                        ${isSelected 
                                        ? `${config.color.replace('bg-', 'border-').replace('text-', 'text-')} bg-opacity-10 dark:bg-opacity-20 border-opacity-40 dark:border-opacity-50 text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 shadow-sm` 
                                        : 'bg-white/40 dark:bg-slate-800/40 border-transparent text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                    style={isSelected ? { borderColor: 'currentColor' } : {}}
                                    >
                                    <span className={isSelected ? '' : 'grayscale opacity-60'}>{config.icon}</span>
                                    <span>{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                  );
              })}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent w-full transition-opacity ${isScrolled && !isFilterExpanded ? 'opacity-0 h-0 my-0' : 'opacity-100 my-0'}`} />

        {/* Keyword Filter & Actions */}
        <div className={`flex flex-col lg:flex-row justify-between gap-3 transition-all duration-300 ${isScrolled ? 'mt-2' : 'mt-0'}`}>
          
          {/* Keyword Input */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 transition-colors" size={16} />
              <input
                type="text"
                className={`w-full pl-9 pr-9 border border-gray-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100
                  ${isScrolled ? 'py-2 bg-white/80 dark:bg-slate-800/80' : 'py-2.5 bg-white/60 dark:bg-slate-800/60'}
                `}
                placeholder={isSnapshotMode ? "在快照中筛选关键词..." : "搜索关键词..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                onClick={() => {
                  if (inputValue.trim()) {
                    onAddKeyword(inputValue.trim());
                    setInputValue('');
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-slate-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Tags */}
            {keywords.length > 0 && (isFilterExpanded || !isScrolled || keywords.length < 3) && (
              <div className="flex flex-wrap gap-2 mt-1">
                {keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50 shadow-sm">
                    {kw}
                    <button onClick={() => onRemoveKeyword(kw)} className="ml-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-100 focus:outline-none hover:bg-yellow-100 dark:hover:bg-yellow-800/50 rounded-full">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {keywords.length > 0 && (
                    <button 
                    onClick={() => keywords.forEach(k => onRemoveKeyword(k))} 
                    className="text-[10px] text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 underline ml-1 self-center bg-transparent border-0 cursor-pointer"
                    >
                    清除
                    </button>
                )}
              </div>
            )}
          </div>

          {/* Refresh Controls - Hidden in Snapshot Mode */}
          {!isSnapshotMode && (
              <div className="grid grid-cols-2 lg:flex items-start gap-2 animate-in fade-in">
                <div className={`col-span-1 lg:w-auto ${isScrolled ? 'h-[36px]' : 'h-[44px]'} transition-all`}>
                  <button
                    onClick={onToggleAutoRefresh}
                    className={`w-full px-3 h-full rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 border whitespace-nowrap ${
                      autoRefresh 
                      ? 'bg-green-50/80 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 shadow-sm' 
                      : 'bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    {autoRefresh ? (isScrolled ? '自动' : '自动刷新: 开') : (isScrolled ? '自动' : '自动刷新: 关')}
                  </button>
                </div>

                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className={`col-span-1 lg:w-auto ${isScrolled ? 'h-[36px] px-4' : 'h-[44px] px-6'} flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all text-xs md:text-sm font-bold tracking-wide ${isRefreshing ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw size={isScrolled ? 14 : 16} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? '刷新' : (isScrolled ? '刷新' : '刷新数据')}
                </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;