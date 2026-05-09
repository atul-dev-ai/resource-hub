import { Metadata } from 'next';
import UploadsClient from './UploadsClient';

export const metadata: Metadata = {
  title: 'All Uploads | Admin Portal',
  description: 'Search, monitor, and manage every resource in the system.',
};

export default function AllUploadsPage() {
  return <UploadsClient />;
}