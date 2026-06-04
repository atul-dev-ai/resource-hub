import { Metadata } from 'next';
import UploadClient from './UploadClient';

export const metadata: Metadata = {
  title: 'Upload Academic Resource | Student Portal',
  description: 'Share your academic materials, notes, and previous questions to help your batchmates.',
};

export default function UploadPage() {
  return <UploadClient />;
}