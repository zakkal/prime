import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Pastikan API Key diakses dari environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Email tujuan pengiriman notifikasi (Superadmin Prime Property)
const SUPERADMIN_EMAIL = 'superadmin@primeproperty.com';

export async function POST(request: Request) {
  try {
    const { propertyName, propertyPrice, propertyKawasan, userEmail, userMessage } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Kirim notifikasi ke Superadmin (bukan balik ke user)
    // Gunakan onboarding@resend.dev karena domain ini sudah terverifikasi oleh Resend
    const { data, error } = await resend.emails.send({
      from: 'Prime Property <onboarding@resend.dev>',
      to: [SUPERADMIN_EMAIL], // ✅ Dikirim ke superadmin, bukan ke user
      reply_to: userEmail,   // ✅ Reply-to user agar bisa langsung balas
      subject: `📩 Pertanyaan Baru: ${propertyName} (dari ${userEmail})`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5;">
          <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: #C9A961; font-size: 22px; margin: 0; letter-spacing: 2px;">PRIME PROPERTY</h1>
            <p style="color: #888; font-size: 11px; margin: 6px 0 0; letter-spacing: 4px; text-transform: uppercase;">Notifikasi Pertanyaan Baru</p>
          </div>

          <p style="font-size: 14px; color: #333; margin-bottom: 20px;">
            Seorang calon klien telah mengirimkan pertanyaan mengenai properti berikut:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tr style="background: #f9f6ef;">
              <td style="padding: 12px 16px; font-weight: 700; color: #A8893E; width: 38%; border-bottom: 1px solid #eee;">Nama Properti</td>
              <td style="padding: 12px 16px; color: #1a1a1a; border-bottom: 1px solid #eee; font-weight: 600;">${propertyName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-weight: 700; color: #A8893E; border-bottom: 1px solid #eee;">Harga Penawaran</td>
              <td style="padding: 12px 16px; color: #1a1a1a; border-bottom: 1px solid #eee; font-weight: 600;">${propertyPrice}</td>
            </tr>
            <tr style="background: #f9f6ef;">
              <td style="padding: 12px 16px; font-weight: 700; color: #A8893E; border-bottom: 1px solid #eee;">Kawasan</td>
              <td style="padding: 12px 16px; color: #1a1a1a; border-bottom: 1px solid #eee;">${propertyKawasan}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-weight: 700; color: #A8893E;">Email Klien</td>
              <td style="padding: 12px 16px;">
                <a href="mailto:${userEmail}" style="color: #C9A961; font-weight: 600; text-decoration: none;">${userEmail}</a>
              </td>
            </tr>
          </table>

          <div style="background: #f5f5f5; border-left: 4px solid #C9A961; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 700; color: #A8893E; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Pesan dari Klien:</p>
            <p style="font-size: 13px; color: #444; margin: 0; line-height: 1.6;">${userMessage || '<em>Tidak ada pesan tambahan.</em>'}</p>
          </div>

          <a href="mailto:${userEmail}" style="display: inline-block; background: linear-gradient(135deg, #A8893E, #C9A961, #E2C785); color: #1a1a1a; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
            Balas Email Klien
          </a>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 11px; color: #aaa; text-align: center; margin: 0;">Email ini dikirim otomatis oleh sistem Prime Property Portal. Jangan balas email ini secara langsung.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
