import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import PlatformCard from './components/PlatformCard';
import EmailModal from './components/EmailModal';
import HistoryView from './components/HistoryView';
import AnalysisView from './components/AnalysisView';
import { HotSearchItem, Platform, ViewMode, EmailConfig, HistorySnapshot } from './types';
import { PLATFORM_CATEGORIES } from './constants';
import { fetchPlatformHotSearches as fetchDirectHotSearches } from './services/geminiService';
import { buildUrl, getApiHeaders, API_ENDPOINTS } from './src/api/config';
import { Save, Download, ArrowLeft, Clock, Menu, CheckCircle, AlertCircle } from 'lucide-react';
import { buildUrl, getApiHeaders, API_ENDPOINTS } from './src/api/config';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [items, setItems] = useState<HotSearchItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') return true;
    if (localStorage.getItem('theme') === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Snapshot State
  const [activeSnapshot, setActiveSnapshot] = useState<HistorySnapshot | null>(null);

  // Loading state per platform
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Filters
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    Platform.Weibo, Platform.Baidu, Platform.Zhihu, Platform.Bilibili, Platform.Douyin
  ]);

  // Ref to track latest selectedPlatforms for auto-refresh
  const selectedPlatformsRef = useRef(selectedPlatforms);

  // Auto Refresh
  const [autoRefresh, setAutoRefresh] = useState(false);

  // History
  const [history, setHistory] = useState<HistorySnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('trendmonitor_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to parse history from localStorage:', error);
      return [];
    }
  });

  // Email Config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    recipients: [],
    frequency: 'daily',
    sendTime: '09:00',
    enabled: false
  });

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // --- Helper Functions ---

  const updateLoading = (platforms: Platform[], isLoading: boolean) => {
    setLoadingStates(prev => {
      const next = { ...prev };
      platforms.forEach(p => next[p] = isLoading);
      return next;
    });
  };

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  const fetchEmailConfig = useCallback(async () => {
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.config.email), {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const config = await response.json();
        setEmailConfig(config);
      } else {
        console.warn('Failed to fetch email config:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch email config:', error);
    }
  }, []);

  const fetchSpecificPlatform = useCallback(async (platform: Platform): Promise<HotSearchItem[]> => {
    updateLoading([platform], true);
    try {
      // 检查是否应该使用后端 API（Docker 环境）
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const useBackendAPI = apiBase.startsWith('/api');

      if (useBackendAPI) {
        // 使用后端 API
        const response = await fetch(buildUrl(`/hotsearch?platform=${platform}`), {
          headers: getApiHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setItems(prevItems => {
            const otherItems = prevItems.filter(i => i.platform !== platform);
            return [...otherItems, ...data].sort((a, b) => b.score - a.score);
          });
          return data;
        }
        return [];
      } else {
        // 开发环境 - 直接调用外部 API
        const newItems = await fetchDirectHotSearches(platform, true);
        setItems(prevItems => {
          const otherItems = prevItems.filter(i => i.platform !== platform);
          return [...otherItems, ...newItems].sort((a, b) => b.score - a.score);
        });
        return newItems;
      }
    } catch (error) {
      console.error(`获取 ${platform} 数据失败:`, error);
      return [];
    } finally {
      updateLoading([platform], false);
    }
  }, []);

  const fetchAllData = useCallback(async (isAuto = false) => {
    const platformsToFetch = selectedPlatformsRef.current;

    if (platformsToFetch.length === 0) {
      if (!isAuto) {
        showToast("请先在筛选栏选择至少一个平台", "info");
      }
      return;
    }

    updateLoading(platformsToFetch, true);

    try {
      // 检查是否应该使用后端 API（Docker 环境）
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const useBackendAPI = apiBase.startsWith('/api');

      if (useBackendAPI) {
        // 使用后端 API - 批量获取所有平台数据
        const platformParam = platformsToFetch.join(',');
        const response = await fetch(buildUrl(`/hotsearch?platform=${platformParam}`), {
          headers: getApiHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setItems(prevItems => {
            const keptItems = prevItems.filter(i => !platformsToFetch.includes(i.platform));
            return [...keptItems, ...data].sort((a, b) => b.score - a.score);
          });
        } else {
          throw new Error(`API 错误：${response.status}`);
        }
      } else {
        // 开发环境 - 直接调用外部 API
        const CHUNK_SIZE = 2;
        const allNewItems: HotSearchItem[] = [];

        for (let i = 0; i < platformsToFetch.length; i += CHUNK_SIZE) {
          const chunk = platformsToFetch.slice(i, i + CHUNK_SIZE);
          const promises = chunk.map(p => fetchDirectHotSearches(p, !isAuto));
          const results = await Promise.all(promises);
          results.forEach(res => allNewItems.push(...res));

          if (i + CHUNK_SIZE < platformsToFetch.length) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }

        setItems(prevItems => {
          const keptItems = prevItems.filter(i => !platformsToFetch.includes(i.platform));
          return [...keptItems, ...allNewItems].sort((a, b) => b.score - a.score);
        });
      }

    } catch (err) {
      console.error("获取数据失败:", err);
      if (!isAuto) {
        showToast("获取数据失败，请稍后重试", "info");
      }
    } finally {
      updateLoading(platformsToFetch, false);
    }
  }, [showToast]);

  // --- Computed Values ---

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (!selectedPlatforms.includes(item.platform)) return false;
      if (keywords.length > 0) {
        const matchesKeyword = keywords.some(k => item.title.toLowerCase().includes(k.toLowerCase()));
        if (!matchesKeyword) return false;
      }
      return true;
    });
  }, [items, selectedPlatforms, keywords]);

  const groupedItems = useMemo(() => {
    return selectedPlatforms.reduce((acc, platform) => {
      acc[platform] = filteredItems.filter(i => i.platform === platform);
      return acc;
    }, {} as Record<Platform, HotSearchItem[]>);
  }, [selectedPlatforms, filteredItems]);

  // --- Effects ---

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    selectedPlatformsRef.current = selectedPlatforms;
  }, [selectedPlatforms]);

  useEffect(() => {
    fetchAllData();
    fetchEmailConfig();
  }, [fetchAllData, fetchEmailConfig]);

  useEffect(() => {
    let interval: number | undefined;
    if (autoRefresh && view === 'dashboard') {
      interval = window.setInterval(() => {
        console.log("Auto-refreshing data...");
        fetchAllData(true);
      }, 60000);
    }
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, view, fetchAllData]);

  useEffect(() => {
    localStorage.setItem('trendmonitor_history', JSON.stringify(history));
  }, [history]);

  // --- Event Handlers ---

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSaveSnapshot = useCallback(() => {
    const itemsToSave = items.filter(item => selectedPlatforms.includes(item.platform));

    if (itemsToSave.length === 0) {
      showToast("当前没有可保存的数据", "info");
      return;
    }

    const snapshot: HistorySnapshot = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      items: itemsToSave,
    };
    setHistory(prev => [snapshot, ...prev]);
    showToast(`成功保存快照！包含 ${itemsToSave.length} 条热搜数据`);
  }, [items, selectedPlatforms, showToast]);

  const handleExport = useCallback((dataToExport: HotSearchItem[] = filteredItems) => {
    const headers = ['Platform', 'Rank', 'Title', 'Score', 'URL', 'Time'];
    const rows = dataToExport.map(item => [
      item.platform,
      item.rank,
      `"${item.title.replace(/"/g, '""')}"`,
      item.score,
      item.url,
      new Date(item.timestamp).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trendmonitor-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredItems]);

  const handleExportSnapshot = useCallback((snapshot: HistorySnapshot) => {
    handleExport(snapshot.items);
  }, [handleExport]);

  const isGlobalLoading = Object.values(loadingStates).some(Boolean);

  return (
    <div className="flex bg-transparent min-h-screen font-sans transition-colors duration-300">
      <Sidebar
        currentView={view === 'snapshot' ? 'history' : view}
        onChangeView={(newView) => {
          setView(newView);
          if (newView === 'dashboard') {
            setKeywords([]);
          }
        }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 w-full md:ml-64 p-4 md:p-8 transition-all relative z-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {view === 'snapshot' && (
              <button
                onClick={() => {
                  setView('history');
                  setKeywords([]);
                }}
                className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
            )}
            {view === 'dashboard' && '实时监控看板'}
            {view === 'history' && '历史数据回溯'}
            {view === 'email' && '订阅管理'}
            {view === 'analysis' && '趋势分析'}
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            {view === 'dashboard' && (
              <>
                <button
                  onClick={() => handleExport()}
                  disabled={filteredItems.length === 0}
                  className="px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <Download size={16} />
                  导出
                </button>
                <button
                  onClick={() => handleSaveSnapshot()}
                  disabled={isGlobalLoading || filteredItems.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isGlobalLoading ? '保存中...' : '保存快照'}
                </button>
              </>
            )}
            {view !== 'dashboard' && view !== 'email' && view !== 'snapshot' && (
              <button
                onClick={() => {
                  setView('dashboard');
                  setKeywords([]);
                }}
                className="px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-sm font-medium transition-all"
              >
                返回看板
              </button>
            )}
          </div>
        </div>

        {/* FilterBar - Only show in dashboard and snapshot views */}
        {(view === 'dashboard' || view === 'snapshot') && (
          <FilterBar
            keywords={keywords}
            selectedPlatforms={selectedPlatforms}
            onAddKeyword={(kw) => setKeywords([...keywords, kw])}
            onRemoveKeyword={(kw) => setKeywords(keywords.filter(k => k !== kw))}
            onTogglePlatform={(p) => {
              setSelectedPlatforms(prev =>
                prev.includes(p)
                  ? prev.filter(platform => platform !== p)
                  : [...prev, p]
              );
            }}
            onToggleAllPlatforms={(select) => {
              setSelectedPlatforms(select ? Object.values(Platform) : []);
            }}
            onToggleCategory={(platforms, select) => {
              setSelectedPlatforms(prev => {
                const otherPlatforms = prev.filter(p => !platforms.includes(p));
                if (select) {
                  return [...otherPlatforms, ...platforms];
                } else {
                  return otherPlatforms;
                }
              });
            }}
            onRefresh={fetchAllData}
            isRefreshing={isGlobalLoading}
            autoRefresh={autoRefresh}
            onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
            viewMode={view}
          />
        )}

        {/* Content Renderers */}
        {view === 'dashboard' && (
          <>
            <div className="mb-4 px-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                共找到 <span className="font-bold text-gray-900 dark:text-white">{filteredItems.length}</span> 条相关热搜
                {keywords.length > 0 && (
                  <span className="ml-2">
                    （关键词: <span className="text-primary-600 dark:text-primary-400">{keywords.join(', ')}</span>）
                  </span>
                )}
              </p>
            </div>

            {Object.entries(PLATFORM_CATEGORIES).map(([category, platforms]) => {
              const activePlatforms = platforms.filter(p => selectedPlatforms.includes(p));
              if (activePlatforms.length === 0) return null;

              return (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                    {category}
                    <span className="text-xs font-normal text-gray-400">({activePlatforms.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activePlatforms.map(platform => (
                      <PlatformCard
                        key={platform}
                        platform={platform}
                        items={groupedItems[platform] || []}
                        isLoading={loadingStates[platform] || false}
                        onRefresh={() => fetchSpecificPlatform(platform)}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {view === 'history' && (
          <HistoryView
            history={history}
            onLoadSnapshot={(snapshot) => {
              setActiveSnapshot(snapshot);
              const snapshotPlatforms = Array.from(new Set(snapshot.items.map(i => i.platform)));
              setSelectedPlatforms(snapshotPlatforms);
              setKeywords([]);
              setView('snapshot');
            }}
            onDeleteSnapshot={(id) => setHistory(h => h.filter(x => x.id !== id))}
            onExport={handleExportSnapshot}
            isDarkMode={isDarkMode}
          />
        )}

        {view === 'email' && (
          <EmailModal
            config={emailConfig}
            onSave={setEmailConfig}
          />
        )}

        {view === 'analysis' && (
          <AnalysisView
            items={filteredItems}
            onTermClick={(term) => {
              setKeywords([term]);
              setView('dashboard');
            }}
            isDarkMode={isDarkMode}
          />
        )}

        {view === 'snapshot' && activeSnapshot && (
          <div>
            <div className="mb-6 px-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                快照时间: {new Date(activeSnapshot.timestamp).toLocaleString()}
              </p>
            </div>

            {Object.entries(PLATFORM_CATEGORIES).map(([category, platforms]) => {
              const activePlatforms = platforms.filter(p => selectedPlatforms.includes(p));
              if (activePlatforms.length === 0) return null;

              return (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activePlatforms.map(platform => (
                      <PlatformCard
                        key={platform}
                        platform={platform}
                        items={groupedItems[platform] || []}
                        isLoading={false}
                        onRefresh={() => {}}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-95"
      >
        <Menu size={24} />
      </button>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300 ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
