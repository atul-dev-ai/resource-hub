import { Metadata } from 'next';
import UsersClient from './UsersClient';

export const metadata: Metadata = {
  title: 'User Management | Admin Portal',
  description: 'Monitor, filter, and manage platform members.',
};

export default function UsersPage() {
  return <UsersClient />;
}