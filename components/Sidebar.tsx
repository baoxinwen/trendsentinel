import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, History, Mail, BarChart2, Activity, X, Moon, Sun } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen = false, onClose, isDarkMode, toggleTheme }) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '实时监控', icon: <LayoutDashboard size={20} /> },
    { id: 'analysis', label: '热度分析', icon: <BarChart2 size={20} /> },
    { id: 'history', label: '历史回溯', icon: <History size={20} /> },
    { id: 'email', label: '邮件订阅', icon: <Mail size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Glassmorphism */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-high-contrast flex flex-col
        transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 border-r border-white/40 dark:border-slate-700/50 shadow-xl md:shadow-none
        dark:bg-slate-900/90 dark:text-gray-100
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/30 flex items-center justify-center text-white">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white text-lg leading-tight tracking-tight">TrendSentinel</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">实时舆情监控</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                if (onClose) onClose();
              }}
              className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm relative overflow-hidden
                ${currentView === item.id 
                  ? 'text-white shadow-lg shadow-primary-500/25' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              {/* Active Background Gradient */}
              {currentView === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-indigo-600" />
              )}
              
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
              
              {/* Hover effect for non-active */}
              {currentView !== item.id && (
                 <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 dark:group-hover:bg-slate-800/60 transition-colors duration-200" />
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle & Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 space-y-4">
          
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-gray-200/50 dark:border-slate-700/50 group"
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
               {isDarkMode ? '深色模式' : '浅色模式'}
            </span>
            <div className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/10 text-orange-500'}`}>
               {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
            </div>
          </button>

          <div className="rounded-xl p-4 text-center bg-white/40 dark:bg-slate-800/30 border border-white/60 dark:border-slate-700/30">
               <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">TrendSentinel v2.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;