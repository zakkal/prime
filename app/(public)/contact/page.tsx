import React from 'react';
import { readSiteProfile } from '@/lib/mockDb';
import ContactClient from './ContactClient';

export const revalidate = 0;

export default function ContactPage() {
  const profile = readSiteProfile();

  return <ContactClient profile={profile} />;
}
