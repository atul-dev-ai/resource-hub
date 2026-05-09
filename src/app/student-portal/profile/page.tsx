import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile | Student Portal',
  description: 'Manage your academic profile, update personal details, and view your current status.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}