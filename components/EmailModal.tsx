import React, { useState, useEffect } from 'react';
import { EmailConfig } from '../types';
import { Mail, Clock, Plus, Trash2, CheckCircle, Send } from 'lucide-react';
import { buildUrl, getApiHeaders, API_ENDPOINTS } from '../src/api/config';

interface EmailModalProps {
  config: EmailConfig;
  onSave: (config: EmailConfig) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<EmailConfig>(config);
  const [newEmail, setNewEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Fetch email config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(buildUrl(API_ENDPOINTS.config.email), {
          headers: getApiHeaders(),
        });

        if (response.ok) {
          const config = await response.json();
          setLocalConfig(config);
        }
      } catch (error) {
        console.error('Failed to fetch email config:', error);
        setMessage('加载配置失败，请检查后端服务');
      }
    };

    fetchConfig();
  }, []);

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

  const handleSave = async () => {
    setStatus('saving');
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.config.email), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(localConfig),
      });

      if (response.ok) {
        const savedConfig = await response.json();
        onSave(savedConfig);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        throw new Error(`保存失败: ${response.status}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage('保存配置失败，请检查后端服务');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  const handleTestEmail = async () => {
    if (localConfig.recipients.length === 0) {
      setMessage('请先添加收件人邮箱');
      setTestStatus('error');
      setTimeout(() => {
        setTestStatus('idle');
        setMessage('');
      }, 3000);
      return;
    }

    setTestStatus('sending');
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.email.send), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          recipients: localConfig.recipients,
          subject: 'TrendMonitor 邮件订阅测试',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestStatus('success');
        setMessage('测试邮件已发送！');
        setTimeout(() => {
          setTestStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        throw new Error(`发送失败: ${response.status}`);
      }
    } catch (error) {
      setTestStatus('error');
      setMessage('发送测试邮件失败，请检查后端服务');
      setTimeout(() => {
        setTestStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-800/30">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-lg shadow-primary-500/25">
              <Mail className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">邮件订阅设置</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">定制化热搜报告，定时发送至您的邮箱</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${localConfig.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {localConfig.enabled ? '已启用' : '已禁用'}
              </span>
              <button
                  onClick={() => setLocalConfig(prev => ({...prev, enabled: !prev.enabled}))}
                  className={`relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors ${localConfig.enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-600'}`}
              >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${localConfig.enabled ? 'translate-x-[28px]' : 'translate-x-1'}`} />
              </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Recipients Section */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            收件人列表
            <span className="text-xs font-normal text-gray-400">({localConfig.recipients.length})</span>
          </label>
          <div className="flex gap-3 mb-4">
            <input
              type="email"
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all"
              placeholder="输入邮箱地址..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <button
              onClick={handleAddEmail}
              className="px-5 py-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center font-semibold"
            >
              <Plus size={18} className="mr-1"/> 添加
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[48px] p-4 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50">
            {localConfig.recipients.length === 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">暂无收件人</span>
            )}
            {localConfig.recipients.map(email => (
              <span key={email} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800/50 shadow-sm">
                <span>{email}</span>
                <button onClick={() => handleRemoveEmail(email)} className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800/50 rounded-full p-0.5 transition-all">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />

        {/* Schedule Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">发送频率</label>
            <div className="grid grid-cols-3 gap-2">
              {(['hourly', 'daily', 'weekly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setLocalConfig(prev => ({...prev, frequency: freq}))}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all
                    ${localConfig.frequency === freq
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/25'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {freq === 'hourly' ? '每小时' : freq === 'daily' ? '每天' : '每周'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-primary-500" /> 发送时间
            </label>
            <input
              type="time"
              value={localConfig.sendTime}
              onChange={(e) => setLocalConfig(prev => ({...prev, sendTime: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 transition-all"
            />
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-xl p-4 flex items-center gap-3 text-sm font-medium
            ${testStatus === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            }`}
          >
            {testStatus === 'success' ? <CheckCircle size={18} /> : null}
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 gap-4">
          <button
            onClick={handleTestEmail}
            disabled={testStatus === 'sending' || status === 'saving'}
            className={`px-6 py-3 rounded-xl font-semibold border transition-all flex items-center gap-2
              ${testStatus === 'sending'
                ? 'border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : testStatus === 'success'
                ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : testStatus === 'error'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
          >
            {testStatus === 'sending' ? '发送中...' : testStatus === 'success' ? '已发送 ✓' : testStatus === 'error' ? '发送失败' : '测试邮件'}
            <Send size={16} />
          </button>

          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
              ${status === 'error' ? 'bg-red-500 hover:bg-red-600' : status === 'saved' ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg hover:shadow-primary-500/30 active:scale-95'}
            }`}
          >
            {status === 'saving' ? '保存中...' : status === 'saved' ? '已保存设置 ✓' : '保存配置'}
            {status === 'saved' ? <CheckCircle size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
