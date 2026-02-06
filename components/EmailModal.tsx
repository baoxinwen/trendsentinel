import React, { useState } from 'react';
import { EmailConfig } from '../types';
import { Mail, Clock, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailModalProps {
  config: EmailConfig;
  onSave: (config: EmailConfig) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<EmailConfig>(config);
  const [newEmail, setNewEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleAddEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      setLocalConfig(prev => ({
        ...prev,
        recipients: [...prev.recipients, newEmail]
      }));
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setLocalConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter(e => e !== email)
    }));
  };

  const handleSave = () => {
    setStatus('saving');
    // Simulate API call
    setTimeout(() => {
      onSave(localConfig);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Mail className="text-primary-600 dark:text-primary-400" /> 邮件订阅设置
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">定制化热搜报告，定时发送至您的邮箱</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-sm ${localConfig.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {localConfig.enabled ? '已启用' : '已禁用'}
            </span>
            <button 
                onClick={() => setLocalConfig(prev => ({...prev, enabled: !prev.enabled}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${localConfig.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${localConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Recipients Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">收件人列表</label>
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              placeholder="输入邮箱地址..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <button 
              onClick={handleAddEmail}
              className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-lg hover:bg-black dark:hover:bg-slate-600 transition-colors flex items-center"
            >
              <Plus size={18} className="mr-1"/> 添加
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {localConfig.recipients.length === 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic py-2">暂无收件人</span>
            )}
            {localConfig.recipients.map(email => (
              <div key={email} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-100 dark:border-blue-800">
                <span>{email}</span>
                <button onClick={() => handleRemoveEmail(email)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-slate-800" />

        {/* Schedule Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">发送频率</label>
            <div className="grid grid-cols-3 gap-2">
              {['hourly', 'daily', 'weekly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setLocalConfig(prev => ({...prev, frequency: freq as any}))}
                  className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all
                    ${localConfig.frequency === freq 
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300' 
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {freq === 'hourly' ? '每小时' : freq === 'daily' ? '每天' : '每周'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Clock size={16} /> 发送时间 (每日)
            </label>
            <input
              type="time"
              value={localConfig.sendTime}
              onChange={(e) => setLocalConfig(prev => ({...prev, sendTime: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Warning / Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" size={18} />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">注意</p>
            <p>由于当前运行在浏览器端，真实的邮件发送功能需要后端服务支持。此界面仅为功能演示，保存后将在控制台模拟发送日志。</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className={`px-8 py-3 rounded-xl font-medium text-white shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2
              ${status === 'saved' ? 'bg-green-600' : 'bg-primary-600 hover:bg-primary-700 active:transform active:scale-95'}
            `}
          >
            {status === 'saving' ? '保存中...' : status === 'saved' ? '已保存设置' : '保存配置'}
            {status === 'saved' && <CheckCircle size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;