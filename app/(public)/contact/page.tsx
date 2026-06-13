import React from 'react';
import { readSiteProfile } from '@/lib/mockDb';
import ContactClient from './ContactClient';

export const revalidate = 0;

export default async function ContactPage() {
  const profile = await readSiteProfile();
  return <ContactClient profile={profile} />;
}
