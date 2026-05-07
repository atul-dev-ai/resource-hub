import { Metadata } from 'next';
import UploadsClient from './UploadsClient';

export const metadata: Metadata = {
  title: 'Upload Resources | Student Portal',
  description: 'Share your academic resources, notes, and materials with your batchmates.',
};

export default function UploadsPage() {
  return <UploadsClient />;
}