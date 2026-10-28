import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Aegis Uncaught Component Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 text-center my-6 max-w-2xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle size={28} />
          </div>

          <h2 className="text-xl font-bold text-[#30264A] mb-2">
            {this.props.fallbackTitle || 'Something went wrong rendering this page'}
          </h2>

          <p className="text-sm text-[#777181] mb-6 leading-relaxed max-w-md mx-auto">
            An unexpected error occurred during rendering. The issue has been logged to the browser console.
          </p>

          {this.state.error && (
            <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left overflow-x-auto">
              <p className="text-xs font-mono text-rose-700 whitespace-pre-wrap break-all">
                {this.state.error.message || String(this.state.error)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B4886] hover:bg-[#4E3C75] text-white text-xs sm:text-sm font-semibold transition"
            >
              <RefreshCw size={15} />
              <span>Reload Application</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0EDFF] hover:bg-[#E4DCFB] text-[#5B4886] text-xs sm:text-sm font-semibold border border-[#D4C7F5] transition"
            >
              <Home size={15} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
