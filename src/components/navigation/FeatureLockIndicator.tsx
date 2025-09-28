
import { TabsTrigger } from "@/components/ui/tabs";
import { Lock, AlertCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type LockInfo = {
  reason: string;
  type: 'admin' | 'level' | 'unknown';
};

type FeatureLockIndicatorProps = {
  featureName: string;
  levelRequirement: number;
  lockInfo: LockInfo;
  icon: LucideIcon;
  label: string;
  tabValue: string;
};

const FeatureLockIndicator = ({ 
  lockInfo, 
  icon: Icon, 
  label, 
  tabValue 
}: FeatureLockIndicatorProps) => {
  const getLockIcon = () => {
    if (lockInfo.type === 'admin') {
      return <AlertCircle className="w-2 h-2 absolute -top-1 -right-1 text-red-500" />;
    }
    return <Lock className="w-2 h-2 absolute -top-1 -right-1 text-gray-400" />;
  };

  const getLockTextColor = () => {
    if (lockInfo.type === 'admin') {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <TabsTrigger 
      value={tabValue} 
      disabled 
      className="flex flex-col items-center justify-center h-full opacity-50 cursor-not-allowed"
    >
      <div className="relative">
        <Icon className="w-4 h-4 mb-1" />
        {getLockIcon()}
      </div>
      <span className={`text-xs ${getLockTextColor()}`}>
        {lockInfo.reason}
      </span>
    </TabsTrigger>
  );
};

export default FeatureLockIndicator;
