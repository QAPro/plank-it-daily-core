
import React, { FC, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Wifi, Database, Clock } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  type?: 'network' | 'server' | 'timeout' | 'permission' | 'generic';
  onRetry?: () => void;
  retrying?: boolean;
  showDetails?: boolean;
  details?: string;
  className?: string;
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case 'network': return <Wifi className="h-12 w-12 text-red-400" />;
    case 'server': return <Database className="h-12 w-12 text-red-400" />;
    case 'timeout': return <Clock className="h-12 w-12 text-red-400" />;
    default: return <AlertTriangle className="h-12 w-12 text-red-400" />;
  }
};

const getErrorTitle = (type: string) => {
  switch (type) {
    case 'network': return 'Connection Error';
    case 'server': return 'Server Error';
    case 'timeout': return 'Request Timeout';
    case 'permission': return 'Access Denied';
    default: return 'Something went wrong';
  }
};

const getErrorSuggestion = (type: string) => {
  switch (type) {
    case 'network': return 'Check your internet connection and try again.';
    case 'server': return 'Our servers are experiencing issues. Please try again in a few moments.';
    case 'timeout': return 'The request took too long. Please try again.';
    case 'permission': return 'You don\'t have permission to access this data.';
    default: return 'Please try refreshing the page or contact support if the issue persists.';
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'generic',
  onRetry,
  retrying = false,
  showDetails = false,
  details,
  className = ''
}) => {
  const [showDetailView, setShowDetailView] = React.useState(false);

  return (
    <Card className={`border-red-200 bg-red-50/50 ${className}`}>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          {getErrorIcon(type)}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-800">
              {title || getErrorTitle(type)}
            </h3>
            <p className="text-red-700">{message}</p>
            <p className="text-sm text-red-600">{getErrorSuggestion(type)}</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={retrying}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {retrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
            )}

            {showDetails && details && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailView(!showDetailView)}
                  className="text-red-600 hover:text-red-700"
                >
                  {showDetailView ? 'Hide' : 'Show'} Details
                </Button>
                
                {showDetailView && (
                  <div className="w-full max-w-md p-3 bg-red-100 rounded-lg border border-red-200">
                    <code className="text-xs text-red-800 break-all">{details}</code>
                  </div>
                )}
              </>
            )}
          </div>

          <Badge variant="destructive" className="text-xs">
            Error Type: {type.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export const PartialErrorBanner: React.FC<{
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ message, onRetry, onDismiss }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            ×
          </Button>
        )}
      </div>
    </div>
  </div>
);
