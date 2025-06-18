import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
    </div>
  );
}

// app/components/ui/ErrorDisplay.tsx
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-200">{message}</p>
      <button 
        className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 transition-colors rounded-md text-white"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}