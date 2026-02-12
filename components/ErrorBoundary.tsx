import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个应用崩溃
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误到控制台
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error Info:', errorInfo);

    // 可以在这里发送错误到监控服务
    // logErrorToService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 3.418-3.604L12 15.414m-7.31 0-13.198-2.106-13.198-4.678V8.62c0-3.33 1.956-5.618 5.618-9.138 0-1.227.058-2.42.058-4.136 0-3.777 2.328-4.136 4.136-2.42V8.62c0 3.33-1.956 5.618-5.618 9.138 0 1.227-.058 2.42-.058 4.136 0 3.777-2.328 4.136-2.42zm6.173 3.527c-.948 0-1.718.574-1.718-1.574 0-.955.574-1.718 1.574-1.718 0-.955 1.718-1.574 1.718-2.42 0-.955 2.42-2.42 0-1.718-1.574-2.42-1.574 0-.955-2.42-1.574-1.718-2.42-1.574-2.42 0-1.718 1.718-1.574 2.42-1.574 2.42 0-1.718 1.574-2.42 0-.955 2.42-1.574-1.718-1.574-2.42 0-.955-2.42-2.42 0-1.718-1.574-2.42-1.574 0-.955-2.42-1.574-1.718-1.574-2.42 0-1.718 1.718-1.574 2.42-1.574 2.42 0-1.718 1.574-2.42 0-.955-2.42-1.574-1.718-1.574-2.42 0-1.718 1.718-1.574 2.42-1.574 2.42 0-1.718 1.574-2.42 0-.955-2.42-2.42 0-1.718 1.574-2.42-1.574 0-.955z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              出错了
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || '应用遇到意外错误，请刷新页面重试'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors duration-200"
              >
                刷新页面
              </button>

              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors duration-200"
              >
                返回首页
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-400">
                  错误详情
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs overflow-auto max-h-40">
                  <code>{this.state.error.stack}</code>
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
