import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = "Unable to load intelligence data",
  message = "A communication error occurred while querying the backend intelligence service. Please check connectivity and retry.",
  onRetry = null
}) => {
  return (
    <div className="bg-red-50/70 border border-red-200 rounded-xl p-8 max-w-lg mx-auto text-center my-8 space-y-3">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-red-950">{title}</h3>
      <p className="text-xs text-red-800 leading-relaxed max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
