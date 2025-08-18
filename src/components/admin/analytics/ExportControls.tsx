
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AnalyticsExportService, { ExportFormat, ExportConfig } from "@/services/analyticsExportService";

interface ExportControlsProps {
  apiParams: Record<string, any>;
}

const ExportControls = ({ apiParams }: ExportControlsProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (section: string, format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      const config: ExportConfig = {
        format,
        sections: [section],
        dateRange: {
          daysBack: apiParams.days_back || 30
        },
        filters: apiParams
      };

      switch (section) {
        case 'registration_trends':
          await AnalyticsExportService.exportRegistrationTrends(config);
          break;
        case 'active_users':
          await AnalyticsExportService.exportActiveUsers(config);
          break;
        case 'feature_usage':
          await AnalyticsExportService.exportFeatureUsage(config);
          break;
        case 'workout_performance':
          await AnalyticsExportService.exportWorkoutPerformance(config);
          break;
        case 'user_engagement':
          await AnalyticsExportService.exportUserEngagement(config);
          break;
        case 'onboarding_funnel':
          await AnalyticsExportService.exportOnboardingFunnel(config);
          break;
        case 'device_platform':
          await AnalyticsExportService.exportDevicePlatform(config);
          break;
        case 'retention_cohorts':
          await AnalyticsExportService.exportRetentionCohorts(config);
          break;
        case 'all':
          await AnalyticsExportService.exportAllSections(config);
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }

      toast.success(`${section.replace(/_/g, " ")} exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const ExportMenuItem = ({ section, label }: { section: string; label: string }) => (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span className="capitalize">{label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => handleExport(section, 'csv')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(section, 'json')}>
          <FileText className="w-4 h-4 mr-2" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Complete Export */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="font-medium">Complete Analytics</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleExport('all', 'csv')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('all', 'json')}>
              <FileText className="w-4 h-4 mr-2" />
              JSON
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Individual Sections */}
        <ExportMenuItem section="registration_trends" label="Registration Trends" />
        <ExportMenuItem section="active_users" label="Active Users" />
        <ExportMenuItem section="feature_usage" label="Feature Usage" />
        <ExportMenuItem section="workout_performance" label="Workout Performance" />
        <ExportMenuItem section="user_engagement" label="User Engagement" />
        <ExportMenuItem section="onboarding_funnel" label="Onboarding Funnel" />
        <ExportMenuItem section="device_platform" label="Device & Platform" />
        <ExportMenuItem section="retention_cohorts" label="Retention Cohorts" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportControls;
