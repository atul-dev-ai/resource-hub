import { Metadata } from 'next';
import RolesClient from './RolesClient';

export const metadata: Metadata = {
  title: 'Roles Assignment | Control Center',
  description: 'Assign or modify system roles for users.',
};

export default function RolesPage() {
  return <RolesClient />;
} 