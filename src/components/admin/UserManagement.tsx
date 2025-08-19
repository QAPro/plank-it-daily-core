
import React, { useState } from "react";
import UserSearch from "./users/UserSearch";
import UserDetailsCard from "./users/UserDetailsCard";
import FeatureOverridesManager from "./users/FeatureOverridesManager";
import { AdminUserSummary } from "@/services/adminUserService";
import AdminSubscriptionOverview from "./users/AdminSubscriptionOverview";
import BulkSubscriptionManager from "./users/BulkSubscriptionManager";
import CustomerSupportTools from "./users/CustomerSupportTools";
import UserSegmentManager from "./users/UserSegmentManager";

const UserManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-muted-foreground">Search for users, manage roles, and apply feature overrides.</p>
      </div>

      {/* Subscription status overview */}
      <AdminSubscriptionOverview />

      {/* Bulk operations */}
      <BulkSubscriptionManager />

      {/* Segmentation */}
      <UserSegmentManager />

      {/* Search and per-user tools */}
      <UserSearch onSelect={setSelectedUser} />

      {selectedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UserDetailsCard user={selectedUser} />
          <FeatureOverridesManager userId={selectedUser.id} />
          <CustomerSupportTools userId={selectedUser.id} />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
