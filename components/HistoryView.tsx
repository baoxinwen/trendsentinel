import React from 'react';
import { HistorySnapshot, Platform } from '../types';
import { Clock, Download, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import { PLATFORM_CONFIG } from '../constants';

interface HistoryViewProps {
  history: HistorySnapshot[];
  onLoadSnapshot: (snapshot: HistorySnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onExport: (snapshot: HistorySnapshot) => void;
  isDarkMode?: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoadSnapshot, onDeleteSnapshot, onExport, isDarkMode = false }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 dark:text-gray-500 card">
        <Clock size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">暂无历史记录</p>
        <p className="text-sm mt-1">当您手动保存或自动刷新时，系统会生成历史快照</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-lg shadow-primary-500/25">
          <Clock size={20} className="text-white" />
        </div>
        历史热搜快照
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((snapshot) => (
          <div key={snapshot.id} className="card p-5 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Calendar size={14} />
                {new Date(snapshot.timestamp).toLocaleString('zh-CN')}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSnapshot(snapshot.id); }}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="删除记录"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from(new Set(snapshot.items.map(i => i.platform))).slice(0, 6).map((p) => {
                  const config = PLATFORM_CONFIG[p as Platform];
                  return (
                    <span
                      key={p}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${config?.color || 'bg-gray-500'}`}
                      title={config?.label || p}
                    >
                      {config?.icon || '?'}
                    </span>
                  );
                })}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2">
                {snapshot.items[0]?.title || '无数据'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                包含 <span className="font-semibold text-primary-600 dark:text-primary-400">{snapshot.items.length}</span> 条热搜数据
              </p>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
              <button
                onClick={() => onLoadSnapshot(snapshot)}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                查看详情 <ChevronRight size={16} />
              </button>
              <button
                onClick={() => onExport(snapshot)}
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="导出 CSV"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
