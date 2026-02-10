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

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col
        transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 border-r border-gray-200/50 dark:border-slate-700/50
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      `}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl shadow-lg shadow-primary-500/25 flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white text-lg leading-tight tracking-tight">TrendMonitor</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">热搜监控平台</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                if (onClose) onClose();
              }}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative overflow-hidden
                ${currentView === item.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>

              {/* Active indicator */}
              {currentView === item.id && (
                <div className="absolute right-3 w-2 h-2 rounded-full bg-white/50" />
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle & Footer */}
        <div className="p-4 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700 group"
          >
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
               {isDarkMode ? '深色模式' : '浅色模式'}
            </span>
            <div className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-primary-500/20 text-primary-400' : 'bg-amber-500/10 text-amber-500'}`}>
               {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
            </div>
          </button>

          <div className="rounded-xl p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-gray-200 dark:border-slate-700/50">
               <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">TrendMonitor v2.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
