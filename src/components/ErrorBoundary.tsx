import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Lottery App:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 text-stone-800 select-none">
          <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-stone-900">화면 복구 필요</h2>
            <p className="text-sm text-stone-600">
              일시적인 렌더링 오류가 발생했습니다. 아래 버튼을 눌러 화면을 새로고침하면 모든 데이터가 안전하게 복원됩니다.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>화면 다시 불러오기</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
