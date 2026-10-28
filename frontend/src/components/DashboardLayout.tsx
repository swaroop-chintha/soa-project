import React from 'react';
import { CustomerLayout } from './CustomerLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout delegates to CustomerLayout for unified customer experience.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return <CustomerLayout>{children}</CustomerLayout>;
};

export default DashboardLayout;
