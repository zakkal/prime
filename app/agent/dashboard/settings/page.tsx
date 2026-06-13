import React from 'react';
import { getAuthenticatedAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readSiteProfile } from '@/lib/mockDb';
import SettingsClient from './SettingsClient';

export const revalidate = 0;

export default async function SettingsPage() {
  const agent = await getAuthenticatedAgent();
  if (!agent) {
    redirect('/agent/login');
  }

  if (agent.role !== 'superadmin') {
    redirect('/agent/dashboard');
  }

  const profile = await readSiteProfile();

  return <SettingsClient initialProfile={profile} />;
}
