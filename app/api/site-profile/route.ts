import { NextRequest, NextResponse } from 'next/server';
import { readSiteProfile, writeSiteProfile, SiteProfile } from '@/lib/mockDb';
import { getAuthenticatedAgent } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const profile = await readSiteProfile();
    return NextResponse.json(profile);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const agent = await getAuthenticatedAgent();
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (agent.role !== 'superadmin') {
      return NextResponse.json({ error: 'Hanya superadmin yang dapat mengubah profil.' }, { status: 403 });
    }

    const body = await req.json();

    const required = ['nama_perusahaan', 'alamat', 'telepon_display', 'whatsapp', 'whatsapp_display', 'email'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json({ error: `Field '${field}' wajib diisi.` }, { status: 400 });
      }
    }

    const current = await readSiteProfile();
    const updated: SiteProfile = {
      ...current,
      ...body,
      akurasi_dimensi: Number(body.akurasi_dimensi) || current.akurasi_dimensi,
      updated_at: new Date().toISOString(),
      updated_by: agent.nama,
    };

    await writeSiteProfile(updated);

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/about');

    return NextResponse.json({ success: true, profile: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
