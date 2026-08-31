import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-8 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-stone-800 font-bold text-xl mb-2">Något gick fel</h2>
          <p className="text-stone-500 text-sm mb-6">Appen kunde inte laddas. Försök igen.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-rose-600 text-white rounded-2xl px-8 py-3 font-bold hover:bg-rose-700 transition-colors"
          >
            Ladda om
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
