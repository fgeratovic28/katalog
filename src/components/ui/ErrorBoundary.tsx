import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Došlo je do greške</h3>
            <p className="text-muted-foreground text-sm">
              Nismo uspeli da učitamo detalje proizvoda. Molimo pokušajte ponovo.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Pokušaj ponovo
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
