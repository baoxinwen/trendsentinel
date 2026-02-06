import React from 'react';
import { HotSearchItem, Platform } from '../types';
import { PLATFORM_CONFIG } from '../constants';
import { ExternalLink, TrendingUp } from 'lucide-react';

interface HotSearchTableProps {
  items: HotSearchItem[];
  loading: boolean;
}

const HotSearchTable: React.FC<HotSearchTableProps> = ({ items, loading }) => {
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4"></div>
        <p>正在从各大平台获取热搜数据...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
        <TrendingUp size={48} className="mb-2 text-gray-300" />
        <p>暂无符合条件的热搜数据</p>
        <p className="text-sm">尝试调整筛选关键词或刷新数据</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
              <th className="p-4 w-16 text-center">排名</th>
              <th className="p-4">热搜话题</th>
              <th className="p-4 w-32">平台</th>
              <th className="p-4 w-32 text-right">热度值</th>
              <th className="p-4 w-24 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-primary-50 transition-colors group">
                <td className="p-4 text-center font-bold text-gray-400">
                  <span className={`inline-block w-6 h-6 leading-6 rounded-full text-xs
                    ${item.rank <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>
                    {item.rank}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 group-hover:text-primary-700 transition-colors">
                      {item.title}
                    </span>
                    {item.category && (
                      <span className="text-xs text-gray-400 mt-1">{item.category}</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white ${PLATFORM_CONFIG[item.platform].color}`}>
                    <span className="mr-1">{PLATFORM_CONFIG[item.platform].icon}</span>
                    {PLATFORM_CONFIG[item.platform].label}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-sm text-gray-600">
                  {item.score.toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-full transition-all"
                    title="查看详情"
                  >
                    <ExternalLink size={16} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotSearchTable;
