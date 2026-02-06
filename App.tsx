import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import PlatformCard from './components/PlatformCard'; 
import EmailModal from './components/EmailModal';
import HistoryView from './components/HistoryView';
import AnalysisView from './components/AnalysisView';
import { HotSearchItem, Platform, ViewMode, EmailConfig, HistorySnapshot } from './types';
import { PLATFORM_CATEGORIES } from './constants';
import { fetchPlatformHotSearches } from './services/geminiService';
import { Save, Download, ArrowLeft, Clock, Menu, CheckCircle, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const [items, setItems] = useState<HotSearchItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference
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
  
  // Auto Refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // History
  const [history, setHistory] = useState<HistorySnapshot[]>(() => {
    const saved = localStorage.getItem('trendSentinel_history');
    return saved ? JSON.parse(saved) : [];
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

  // --- Effects ---

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initial Fetch
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Auto Refresh Interval
  useEffect(() => {
    let interval: number;
    if (autoRefresh && view === 'dashboard') { // Only auto-refresh on dashboard
      interval = window.setInterval(() => {
        console.log("Auto-refreshing data...");
        fetchAllData(true); 
      }, 60000); 
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, selectedPlatforms, view]);

  // Persist History
  useEffect(() => {
    localStorage.setItem('trendSentinel_history', JSON.stringify(history));
  }, [history]);

  // --- Logic ---

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const updateLoading = (platforms: Platform[], isLoading: boolean) => {
    setLoadingStates(prev => {
      const next = { ...prev };
      platforms.forEach(p => next[p] = isLoading);
      return next;
    });
  };

  const fetchSpecificPlatform = async (platform: Platform): Promise<HotSearchItem[]> => {
    updateLoading([platform], true);
    try {
      // Manual refresh: pass true for forceRefresh to bypass cache
      const newItems = await fetchPlatformHotSearches(platform, true);
      setItems(prevItems => {
        const otherItems = prevItems.filter(i => i.platform !== platform);
        return [...otherItems, ...newItems].sort((a, b) => b.score - a.score);
      });
      return newItems;
    } catch (error) {
      console.error(`Error fetching ${platform}:`, error);
      return [];
    } finally {
      updateLoading([platform], false);
    }
  };

  const fetchAllData = async (isAuto = false) => {
    if (selectedPlatforms.length === 0) {
        if (!isAuto) {
            showToast("请先在筛选栏选择至少一个平台", "info");
        }
        return;
    }

    const platformsToFetch = selectedPlatforms;
    updateLoading(platformsToFetch, true);
    
    try {
      const CHUNK_SIZE = 2;
      const allNewItems: HotSearchItem[] = [];

      for (let i = 0; i < platformsToFetch.length; i += CHUNK_SIZE) {
          const chunk = platformsToFetch.slice(i, i + CHUNK_SIZE);
          const promises = chunk.map(p => fetchPlatformHotSearches(p, !isAuto));
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

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      updateLoading(platformsToFetch, false);
    }
  };

  const handleSaveSnapshot = () => {
    // 修复：保存快照时，忽略关键词筛选，保存当前已选平台的所有数据
    // 确保只保存当前 selectedPlatforms 中的数据，避免保存了未勾选且可能陈旧的数据
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
  };

  const handleExport = (dataToExport: HotSearchItem[] = filteredItems) => {
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
    link.setAttribute('download', `trend-sentinel-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSnapshot = (snapshot: HistorySnapshot) => {
      handleExport(snapshot.items);
  }

  // Filtering Logic
  const filteredItems = items.filter(item => {
    if (!selectedPlatforms.includes(item.platform)) return false;
    if (keywords.length > 0) {
      const matchesKeyword = keywords.some(k => item.title.toLowerCase().includes(k.toLowerCase()));
      if (!matchesKeyword) return false;
    }
    return true;
  });

  const groupedItems = selectedPlatforms.reduce((acc, platform) => {
    acc[platform] = filteredItems.filter(i => i.platform === platform);
    return acc;
  }, {} as Record<Platform, HotSearchItem[]>);

  const isGlobalLoading = Object.values(loadingStates).some(Boolean);

  return (
    // Changed bg-gray-50 to transparent to show body background
    <div className="flex bg-transparent min-h-screen font-sans transition-colors duration-300">
      <Sidebar 
        currentView={view === 'snapshot' ? 'history' : view} 
        onChangeView={(newView) => {
            setView(newView);
            // Reset keywords when returning to dashboard
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
        
        {/* Top Header Area */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3">
             {/* Mobile Hamburger Button */}
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="p-2 -ml-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 md:hidden transition-colors"
             >
               <Menu size={24} />
             </button>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 tracking-tight">
                {view === 'snapshot' && (
                    <button 
                      onClick={() => {
                        setView('history');
                        setKeywords([]); // Clean up filters when leaving
                      }} 
                      className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                      title="返回"
                    >
                      <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                )}
                {view === 'dashboard' && '实时监控看板'}
                {view === 'history' && '历史数据回溯'}
                {view === 'email' && '订阅管理'}
                {view === 'analysis' && '趋势分析'}
                {view === 'snapshot' && activeSnapshot && (
                   <span className="flex items-center gap-2 text-sm md:text-xl">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" />
                      <span className="hidden md:inline">历史快照:</span>
                      {new Date(activeSnapshot.timestamp).toLocaleString('zh-CN')}
                   </span>
                )}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1 ml-1 font-medium">
                 {view === 'snapshot' 
                   ? `快照 ID: ${activeSnapshot?.id}`
                   : new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                 }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
             {view === 'dashboard' && (
                <>
                <button 
                  onClick={() => handleExport()}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm text-xs md:text-sm font-medium"
                >
                  <Download size={14} className="md:w-4 md:h-4" /> 导出
                </button>
                <button 
                  onClick={handleSaveSnapshot}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-xs md:text-sm font-medium shadow-sm"
                >
                  <Save size={14} className="md:w-4 md:h-4" /> 快照
                </button>
                </>
             )}
             {view === 'snapshot' && activeSnapshot && (
                <button 
                  onClick={() => handleExport(activeSnapshot.items)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  <Download size={16} /> 导出此快照
                </button>
             )}
             {view !== 'dashboard' && view !== 'email' && view !== 'snapshot' && (
                <button 
                  onClick={() => {
                      setView('dashboard');
                      setKeywords([]); // Clear keywords when returning to dashboard
                  }}
                  className="px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white dark:border-slate-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-sm"
                >
                  返回看板
                </button>
             )}
          </div>
        </header>

        {/* 
            Global FilterBar 
            Rendered in both Dashboard and Snapshot view to allow keyword filtering in history 
        */}
        {(view === 'dashboard' || view === 'snapshot') && (
            <FilterBar 
                keywords={keywords}
                selectedPlatforms={selectedPlatforms}
                onAddKeyword={(k) => setKeywords([...keywords, k])}
                onRemoveKeyword={(k) => setKeywords(keywords.filter(kw => kw !== k))}
                onTogglePlatform={(p) => {
                    setSelectedPlatforms(prev => 
                    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                    );
                }}
                onToggleAllPlatforms={(selectAll) => {
                    setSelectedPlatforms(selectAll ? Object.values(Platform) : []);
                }}
                onToggleCategory={(categoryPlatforms, select) => {
                    setSelectedPlatforms(prev => {
                        if (select) {
                            return Array.from(new Set([...prev, ...categoryPlatforms]));
                        } else {
                            return prev.filter(p => !categoryPlatforms.includes(p));
                        }
                    });
                }}
                onRefresh={() => fetchAllData()}
                isRefreshing={isGlobalLoading}
                autoRefresh={autoRefresh}
                onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
                viewMode={view} // Pass view mode to control UI elements
            />
        )}

        {/* Content Renderers */}
        {view === 'dashboard' && (
          <>
            <div className="mb-4 px-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    共找到 <span className="font-bold text-gray-900 dark:text-white">{filteredItems.length}</span> 条相关热搜
                </p>
            </div>

            {/* Dashboard Grid View grouped by Category */}
            <div className="space-y-10 pb-8">
            {Object.entries(PLATFORM_CATEGORIES).map(([category, platforms]) => {
                const activePlatforms = platforms.filter(p => selectedPlatforms.includes(p));
                if (activePlatforms.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5 pl-3 border-l-4 border-primary-500/50 flex items-center gap-2">
                            {category}
                        </h3>
                        {/* Grid adjusts to 1 col on mobile, 2 on tablet, 3 on large screens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activePlatforms.map(platform => (
                                <PlatformCard 
                                key={platform}
                                platform={platform}
                                items={groupedItems[platform] || []}
                                isLoading={loadingStates[platform] || false}
                                onRefresh={() => fetchSpecificPlatform(platform)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
            
            {selectedPlatforms.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 mx-1">
                    <p>请选择至少一个平台进行监控</p>
                </div>
            )}
            </div>
          </>
        )}

        {/* Snapshot View (Historical Data) */}
        {view === 'snapshot' && activeSnapshot && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300 pb-8">
             {/* Snapshot Info Banner */}
             <div className="bg-orange-50/90 dark:bg-orange-900/30 backdrop-blur-sm border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between text-orange-800 dark:text-orange-200 gap-2 shadow-sm">
                <p className="flex items-start md:items-center gap-2 text-sm md:text-base">
                   <Clock size={18} className="mt-0.5 md:mt-0" />
                   <span>您正在查看 <strong>{new Date(activeSnapshot.timestamp).toLocaleString('zh-CN')}</strong> 的历史数据。此处数据为静态快照，无法刷新。</span>
                </p>
             </div>
            
             <div className="mb-4 px-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    快照中包含 <span className="font-bold text-gray-900 dark:text-white">{activeSnapshot.items.length}</span> 条数据，
                    当前筛选显示 <span className="font-bold text-gray-900 dark:text-white">
                        {/* Calculate visible items count based on filters */}
                         {activeSnapshot.items.filter(item => {
                             if (!selectedPlatforms.includes(item.platform)) return false;
                             if (keywords.length > 0) {
                                 return keywords.some(k => item.title.toLowerCase().includes(k.toLowerCase()));
                             }
                             return true;
                         }).length}
                    </span> 条
                </p>
            </div>

             {Object.entries(PLATFORM_CATEGORIES).map(([category, platforms]) => {
                const platformsInSnapshot = Array.from(new Set(activeSnapshot.items.map(i => i.platform)));
                // Update: Support filtering via the global selectedPlatforms in snapshot view
                const activePlatforms = platforms.filter(p => platformsInSnapshot.includes(p) && selectedPlatforms.includes(p));
                
                if (activePlatforms.length === 0) return null;

                const snapshotGroupedItems = activeSnapshot.items.reduce((acc, item) => {
                     // Note: We use global keywords state for filtering snapshots too
                     if (keywords.length > 0) {
                         const matchesKeyword = keywords.some(k => item.title.toLowerCase().includes(k.toLowerCase()));
                         if (!matchesKeyword) return acc;
                     }
                    if (!acc[item.platform]) acc[item.platform] = [];
                    acc[item.platform].push(item);
                    return acc;
                }, {} as Record<Platform, HotSearchItem[]>);

                return (
                    <div key={category}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pl-2 border-l-4 border-gray-400">
                            {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activePlatforms.map(platform => {
                                const items = snapshotGroupedItems[platform] || [];
                                // If items are empty due to keyword filter, but platform is selected, 
                                // we can still show the empty card or hide it. Let's hide it for cleaner view if filtered.
                                if (items.length === 0 && keywords.length > 0) return null;

                                return (
                                  <PlatformCard 
                                    key={platform}
                                    platform={platform}
                                    items={items}
                                    isLoading={false}
                                    onRefresh={() => {}}
                                    readOnly={true}
                                    lastUpdated={activeSnapshot.timestamp}
                                  />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
          </div>
        )}

        {view === 'email' && (
          <EmailModal config={emailConfig} onSave={setEmailConfig} />
        )}

        {view === 'history' && (
          <HistoryView 
             history={history} 
             onLoadSnapshot={(s) => {
                 setActiveSnapshot(s);
                 // FIX: Automatically select all platforms present in the snapshot.
                 // This ensures the user sees the data immediately without having to manually select platforms.
                 // We keep the logic simple: if you view a snapshot, you want to see what's in it.
                 const snapshotPlatforms = Array.from(new Set(s.items.map(i => i.platform)));
                 setSelectedPlatforms(snapshotPlatforms); 
                 setKeywords([]); 
                 setView('snapshot');
             }}
             onDeleteSnapshot={(id) => setHistory(h => h.filter(x => x.id !== id))}
             onExport={handleExportSnapshot}
          />
        )}

        {view === 'analysis' && (
            <AnalysisView 
              items={items.length > 0 ? items : history[0]?.items || []} 
              onTermClick={(term) => {
                 setKeywords([term]); 
                 setView('dashboard');
              }}
              isDarkMode={isDarkMode}
            />
        )}
      
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-800 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
            {toast.type === 'success' ? <CheckCircle className="text-green-400 dark:text-green-600" size={20} /> : <AlertCircle className="text-blue-400 dark:text-blue-600" size={20} />}
            <span className="font-medium text-sm">{toast.message}</span>
        </div>
      </div>

      </main>
    </div>
  );
};

export default App;