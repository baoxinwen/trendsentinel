import React from 'react';
import { HistorySnapshot, Platform } from '../types';
import { Clock, Download, ChevronRight, Calendar } from 'lucide-react';
import { PLATFORM_CONFIG } from '../constants';

interface HistoryViewProps {
  history: HistorySnapshot[];
  onLoadSnapshot: (snapshot: HistorySnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onExport: (snapshot: HistorySnapshot) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoadSnapshot, onDeleteSnapshot, onExport }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
        <Clock size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">暂无历史记录</p>
        <p className="text-sm">当您手动保存或自动刷新时，系统会生成历史快照</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <HistorySnapshotIcon /> 历史热搜快照
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((snapshot) => (
          <div key={snapshot.id} className="bg-white dark:bg-slate-900/60 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700/50 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Calendar size={14} />
                {new Date(snapshot.timestamp).toLocaleString('zh-CN')}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteSnapshot(snapshot.id); }}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2"
                title="删除记录"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-1 mb-3">
                {Array.from(new Set(snapshot.items.map(i => i.platform))).slice(0, 4).map((p) => (
                  <span key={p} className={`w-2 h-2 rounded-full ${PLATFORM_CONFIG[p as Platform]?.color}`} title={PLATFORM_CONFIG[p as Platform]?.label}></span>
                ))}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
                {snapshot.items[0]?.title || '无数据'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                包含 {snapshot.items.length} 条热搜数据
              </p>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-slate-800">
              <button 
                onClick={() => onLoadSnapshot(snapshot)}
                className="flex-1 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-1"
              >
                查看详情 <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => onExport(snapshot)}
                className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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

const HistorySnapshotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
)

export default HistoryView;