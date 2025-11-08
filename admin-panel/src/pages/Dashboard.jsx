import React from 'react';
import UserManagement from '../components/UserManagement';
import GrantAccess from '../components/GrantAccess';
import UploadContent from '../components/UploadContent';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagement />
        <GrantAccess />
      </div>
      <UploadContent />
    </div>
  );
};

export default Dashboard;
