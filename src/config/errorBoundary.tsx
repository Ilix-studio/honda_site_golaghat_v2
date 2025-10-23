import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6'>
            <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='mt-4 text-center'>
              <h3 className='text-lg font-medium text-gray-900'>
                Something went wrong
              </h3>
              <p className='mt-2 text-sm text-gray-500'>
                We apologize for the inconvenience. Please refresh the page or
                try again later.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className='mt-4 text-left'>
                  <summary className='cursor-pointer text-sm font-medium text-gray-700'>
                    Error Details
                  </summary>
                  <pre className='mt-2 text-xs text-red-600 whitespace-pre-wrap'>
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
