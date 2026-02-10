import React, { useState, useEffect, useRef } from 'react';
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
  viewMode?: ViewMode;
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
  const scrollStateRef = useRef({ isScrolled: false, isAnimating: false });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && !scrollStateRef.current.isAnimating) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const COLLAPSE_THRESHOLD = 100;
          const EXPAND_THRESHOLD = 20;

          if (!scrollStateRef.current.isScrolled && currentScrollY > COLLAPSE_THRESHOLD) {
            scrollStateRef.current.isScrolled = true;
            scrollStateRef.current.isAnimating = true;
            setIsScrolled(true);
            setIsFilterExpanded(false);
            setTimeout(() => {
              scrollStateRef.current.isAnimating = false;
            }, 350);
          } else if (scrollStateRef.current.isScrolled && currentScrollY < EXPAND_THRESHOLD) {
            scrollStateRef.current.isScrolled = false;
            scrollStateRef.current.isAnimating = true;
            setIsScrolled(false);
            setIsFilterExpanded(true);
            setTimeout(() => {
              scrollStateRef.current.isAnimating = false;
            }, 350);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className={`sticky top-0 z-20 mb-6 transition-all duration-300 ${isScrolled ? 'pt-2' : 'pt-2 md:pt-4'}`}>
      <div className="card">
        {/* Platform Selection Header */}
        <div className="flex justify-between items-center py-3 px-4 md:px-5">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-sm"
              >
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-white">
                    <Filter size={14} />
                  </div>
                  <span className="truncate">平台筛选</span>
                  {!isFilterExpanded && (
                    <span className="badge badge-primary">
                       {selectedPlatforms.length} 已选
                    </span>
                  )}
              </button>

              {(isFilterExpanded || !isScrolled) && (
                <button
                    onClick={() => onToggleAllPlatforms(!isAllSelected)}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                    {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    {isAllSelected ? '取消全选' : '全选'}
                </button>
              )}
          </div>

          <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-xl transition-colors transform duration-300 ${isFilterExpanded ? 'rotate-180' : 'rotate-0'}`}
          >
              <ChevronDown size={18} />
          </button>
        </div>

        {/* Grouped Platform List */}
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out`}
            style={{
                maxHeight: isFilterExpanded ? (isScrolled ? '50vh' : '2000px') : '0px',
                opacity: isFilterExpanded ? 1 : 0
            }}
        >
          <div className={`border-t border-gray-200/50 dark:border-slate-700/50 overflow-y-auto px-4 md:px-5
             ${isScrolled ? 'py-3' : 'py-4'}
          `}>
              {Object.entries(PLATFORM_CATEGORIES).map(([category, platforms]) => {
                  const isCategoryAllSelected = platforms.every(p => selectedPlatforms.includes(p));

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{category}</h4>
                          <button
                            onClick={() => onToggleCategory(platforms, !isCategoryAllSelected)}
                            className="text-[10px] text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
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
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border
                                        ${isSelected
                                        ? `${config.color} text-white shadow-md`
                                        : 'bg-gray-100 dark:bg-slate-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                    <span>{config.icon}</span>
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

        {/* Divider - only show when filter is expanded */}
        {isFilterExpanded && (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent my-3 mx-4 md:mx-5" />
        )}

        {/* Keyword Filter & Actions */}
        <div className="px-4 md:px-5 pb-4">
          <div className="flex flex-col lg:flex-row justify-between gap-3">

            {/* Keyword Input */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="relative group h-10">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 transition-colors" size={16} />
                <input
                  type="text"
                  className="w-full h-full pl-10 pr-12 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800"
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
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Tags */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span key={kw} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                      {kw}
                      <button onClick={() => onRemoveKeyword(kw)} className="ml-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-full p-0.5 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                      onClick={() => keywords.forEach(k => onRemoveKeyword(k))}
                      className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 underline"
                  >
                      清除全部
                  </button>
                </div>
              )}
            </div>

            {/* Refresh Controls */}
            {!isSnapshotMode && (
                <div className="flex items-center gap-2 lg:w-auto">
                  <button
                      onClick={onToggleAutoRefresh}
                      className={`px-4 h-10 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border whitespace-nowrap ${
                        autoRefresh
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      {autoRefresh ? '自动刷新' : '自动刷新'}
                  </button>

                  <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="px-5 h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all text-xs font-bold"
                  >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? '刷新中' : '刷新数据'}
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
