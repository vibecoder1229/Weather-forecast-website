import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch React component errors
 * and display a user-friendly error message instead of crashing the entire app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive">
              <AlertTitle className="text-xl font-bold mb-2">
                Đã xảy ra lỗi
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <p>
                  Ứng dụng đã gặp lỗi không mong muốn. Vui lòng thử tải lại trang.
                </p>
                
                {this.state.error && (
                  <details className="mt-4 p-4 bg-muted rounded-md text-sm">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Chi tiết kỹ thuật (dành cho nhà phát triển)
                    </summary>
                    <div className="space-y-2 mt-2">
                      <div>
                        <strong>Lỗi:</strong>
                        <pre className="mt-1 p-2 bg-background rounded overflow-x-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Stack trace:</strong>
                          <pre className="mt-1 p-2 bg-background rounded overflow-x-auto text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-2 mt-4">
                  <Button onClick={this.handleReset} variant="default">
                    Thử lại
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Tải lại trang
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
