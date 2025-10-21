import { useNavigate } from 'react-router-dom';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';

const SubscriptionPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  return <SubscriptionManagement onBack={handleBack} />;
};

export default SubscriptionPage;
