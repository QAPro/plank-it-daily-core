
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Search, 
  Filter, 
  CreditCard, 
  MapPin, 
  Mail,
  Calendar,
  Receipt,
  AlertCircle,
  Check,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService, BillingTransaction } from '@/services/subscriptionService';
import { formatPrice } from '@/utils/price';

type PaymentMethod = {
  id: string;
  type: 'card' | 'bank';
  brand?: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
};

const BillingManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailPreferences, setEmailPreferences] = useState({
    receipts: true,
    invoices: true,
    renewals: true,
    failures: true
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["billing-transactions", user?.id],
    enabled: !!user?.id,
    queryFn: () => subscriptionService.getBillingHistory(user!.id),
    staleTime: 30_000,
  });

  // Mock payment methods - in real app would come from Stripe
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025,
      is_default: true
    }
  ];

  const filteredTransactions = transactions.filter((transaction: BillingTransaction) => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         formatPrice(transaction.amount_cents).includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateInvoicePDF = async (transaction: BillingTransaction) => {
    // Mock PDF generation - in real app would call backend service
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(
      `Invoice for ${transaction.description}\nAmount: ${formatPrice(transaction.amount_cents)}\nDate: ${new Date(transaction.created_at).toLocaleDateString()}`
    );
    element.download = `invoice-${transaction.id}.txt`;
    element.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing & Invoices</h2>
        <p className="text-gray-600">Manage your payment methods, billing history, and download invoices</p>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  {method.type === 'card' ? (
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  ) : (
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {method.brand?.toUpperCase()} ****{method.last4}
                  </p>
                  {method.exp_month && method.exp_year && (
                    <p className="text-sm text-gray-500">
                      Expires {method.exp_month}/{method.exp_year}
                    </p>
                  )}
                </div>
                {method.is_default && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-600">Remove</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="NY" />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" placeholder="10001" />
            </div>
          </div>
          <Button className="mt-4">Update Address</Button>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Preferences
          </CardTitle>
          <CardDescription>
            Choose which billing emails you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(emailPreferences).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="capitalize">{key.replace('_', ' ')}</Label>
                <p className="text-sm text-gray-500">
                  {key === 'receipts' && 'Get receipts for successful payments'}
                  {key === 'invoices' && 'Receive monthly invoices'}
                  {key === 'renewals' && 'Renewal reminders before billing'}
                  {key === 'failures' && 'Notifications for failed payments'}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setEmailPreferences(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View and download your payment history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction: BillingTransaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {transaction.status === 'succeeded' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : transaction.status === 'pending' ? (
                        <Calendar className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || 'Payment'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.processed_at || transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(transaction.amount_cents)}</p>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    
                    {transaction.status === 'succeeded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateInvoicePDF(transaction)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManagement;
