// src/app/signup/page.tsx
import { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Create Account | Student Portal',
  description: 'Join the university portal to access resources, submit assignments, and stay updated with your academic batch.',
  keywords: 'university signup, student portal, academic resources',
};

export default function SignupPage() {
  return <SignupClient />;
}