import React, { useState } from 'react';
import RolesList from './RolesList';
import PermissionsList from './PermissionsList';
import { useParams } from 'react-router-dom';

const RolesAndPermissions: React.FC = () => {
  const { userId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // Call this after updating roles to trigger permissions refresh
  const handleRolesUpdated = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <RolesList userId={userId} onRolesUpdated={handleRolesUpdated} />
      <PermissionsList userId={userId} refreshKey={refreshKey} />
    </div>
  );
};

export default RolesAndPermissions;