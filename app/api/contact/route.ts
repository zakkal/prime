import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { checkContactRateLimit, writeContactMessage, readSiteProfile } from '@/lib/mockDb';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    const body = await req.json();
    const { nama, email, hp, pesan } = body;

    if (!nama || !email || !hp || !pesan) {
      return NextResponse.json({ error: 'Semua field formulir wajib diisi.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid.' }, { status: 400 });
    }

    if (hp.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Nomor HP tidak valid. Minimal terdiri dari 10 digit angka.' },
        { status: 400 }
      );
    }

    // Rate limit check (Supabase-backed)
    const allowed = await checkContactRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Batas pengiriman terlampaui. Anda hanya dapat mengirim pesan maksimal 3 kali per jam.' },
        { status: 429 }
      );
    }

    // Save message to Supabase
    await writeContactMessage({ nama, email, hp, pesan });

    const profile = await readSiteProfile();

    // Send email via Nodemailer
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await transporter.sendMail({
          from: `"${profile.nama_perusahaan}" <${process.env.GMAIL_USER}>`,
          to: email,
          cc: process.env.GMAIL_USER,
          replyTo: email,
          subject: `Pesan Baru dari Website: ${nama}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #C9A961; border-bottom: 2px solid #C9A961; padding-bottom: 10px; margin-top: 0;">Terima Kasih, ${nama}!</h2>
              <p>Halo, pesan Anda telah kami terima di sistem <strong>${profile.nama_perusahaan}</strong>. Berikut adalah rincian pesan yang dikirimkan:</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Nama Pengirim:</strong> ${nama}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Nomor HP/WA:</strong> ${hp}</p>
                <p style="margin: 10px 0 5px 0;"><strong>Pesan:</strong></p>
                <blockquote style="background: #ffffff; padding: 10px 15px; border-left: 4px solid #C9A961; margin: 0; font-style: italic; border: 1px solid #ddd; border-left: 4px solid #C9A961;">
                  ${pesan}
                </blockquote>
              </div>
              <p>Tim konsultan kami akan segera menghubungi Anda kembali melalui WhatsApp ke nomor <strong>${hp}</strong> atau membalas melalui email ini.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 11px; color: #888; text-align: center;">
                <strong>${profile.nama_perusahaan}</strong><br />
                ${profile.alamat}<br />
                Telp: ${profile.telepon_display} | WA: ${profile.whatsapp_display}
              </p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error('Nodemailer error:', err);
    }

    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
