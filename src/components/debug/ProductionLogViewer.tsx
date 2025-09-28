import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Download, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { logger, LogLevel, LogEntry } from '@/utils/productionLogger';

export const ProductionLogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [criticalErrors, setCriticalErrors] = useState<any[]>([]);

  useEffect(() => {
    refreshLogs();
    loadCriticalErrors();
    
    // Refresh logs every 5 seconds
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [filterLevel]);

  const refreshLogs = () => {
    const allLogs = logger.getLogs();
    const filtered = filterLevel === 'all' ? allLogs : logger.getLogs(filterLevel);
    setLogs(filtered);
  };

  const loadCriticalErrors = () => {
    try {
      const errors = JSON.parse(localStorage.getItem('critical-errors') || '[]');
      setCriticalErrors(errors.slice(0, 10)); // Show last 10 critical errors
    } catch {
      setCriticalErrors([]);
    }
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const clearCriticalErrors = () => {
    localStorage.removeItem('critical-errors');
    setCriticalErrors([]);
  };

  const exportLogs = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: logs.slice(0, 100), // Export last 100 logs
      criticalErrors: criticalErrors,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'info': return 'default';
      case 'debug': return 'outline';
      default: return 'outline';
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      case 'warn': return <AlertTriangle className="h-3 w-3" />;
      case 'info': return <Info className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Critical Errors Alert */}
      {criticalErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{criticalErrors.length} Critical Error{criticalErrors.length !== 1 ? 's' : ''}</strong>
                <p className="text-sm">Production errors detected that may be causing issues</p>
              </div>
              <Button
                onClick={clearCriticalErrors}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Production Logs</span>
            <div className="flex items-center gap-2">
              <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as LogLevel | 'all')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Logs</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                  <SelectItem value="warn">Warnings</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={refreshLogs} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={exportLogs} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button onClick={clearLogs} size="sm" variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>

          {/* Critical Errors Section */}
          {criticalErrors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-red-600">Critical Errors</h4>
              <ScrollArea className="h-32 border rounded p-2">
                <div className="space-y-2">
                  {criticalErrors.map((error, index) => (
                    <div key={index} className="text-xs bg-red-50 p-2 rounded border border-red-200">
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="text-xs">
                          {error.level?.toUpperCase() || 'ERROR'}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 font-mono">{error.message}</div>
                      {error.context && (
                        <div className="mt-1 text-muted-foreground">
                          Context: {JSON.stringify(error.context).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Regular Logs */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No logs found. Logs will appear here as the app generates them.
                </div>
              ) : (
                logs.slice(0, 50).map((log, index) => (
                  <div key={index} className="text-xs border rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getLevelColor(log.level)} className="text-xs">
                          {getLevelIcon(log.level)}
                          {log.level.toUpperCase()}
                        </Badge>
                        {log.userId && (
                          <Badge variant="outline" className="text-xs">
                            User: {log.userId.slice(-8)}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 font-mono">{log.message}</div>
                    {log.context && (
                      <div className="mt-1 text-muted-foreground">
                        {JSON.stringify(log.context).slice(0, 200)}
                        {JSON.stringify(log.context).length > 200 && '...'}
                      </div>
                    )}
                    {log.error && (
                      <div className="mt-1 text-red-600 font-mono text-xs">
                        {log.error.message}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};