import { NextResponse } from 'next/server';
import { logoutAgent } from '@/lib/auth';

export async function DELETE() {
  await logoutAgent();
  return NextResponse.json({ success: true });
}
