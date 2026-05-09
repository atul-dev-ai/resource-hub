import { Metadata } from 'next';
import ManagementClient from './ManagementClient';

export const metadata: Metadata = {
  title: 'Admin Management | Control Center',
  description: 'Manage platform administrators and their access levels.',
};

export default function AdminManagementPage() {
  return <ManagementClient />;
}