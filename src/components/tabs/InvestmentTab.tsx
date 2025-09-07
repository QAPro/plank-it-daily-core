import React from 'react';
import { motion } from 'framer-motion';
import InvestmentDashboard from '@/components/investment/InvestmentDashboard';

const InvestmentTab: React.FC = () => {
  return (
    <motion.div
      key="investment"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-6"
    >
      <InvestmentDashboard />
    </motion.div>
  );
};

export default InvestmentTab;