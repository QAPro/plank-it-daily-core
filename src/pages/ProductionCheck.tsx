
import { FC } from 'react';
import { ProductionReadinessCheck } from '@/components/ProductionReadinessCheck';

const ProductionCheck: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Production Deployment</h1>
          <p className="text-muted-foreground">
            Ensure your app is ready for production deployment
          </p>
        </div>
        <ProductionReadinessCheck />
      </div>
    </div>
  );
};

export default ProductionCheck;
