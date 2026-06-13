import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const RATE_LIMIT_FILE = path.join(process.cwd(), 'data', 'contact_limits.json');

// Nodemailer Transporter configuration using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Alamat email Gmail Anda
    pass: process.env.GMAIL_APP_PASSWORD, // App Password Gmail Anda (16 digit kode)
  },
});

interface SubmitLog {
  ip: string;
  timestamp: number;
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
  const dir = path.dirname(RATE_LIMIT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let logs: SubmitLog[] = [];
  if (fs.existsSync(RATE_LIMIT_FILE)) {
    try {
      logs = JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf-8'));
    } catch (e) {
      logs = [];
    }
  }

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  // Filter out logs older than 1 hour
  logs = logs.filter(l => l.timestamp > oneHourAgo);

  // Count submissions from this IP
  const ipLogsCount = logs.filter(l => l.ip === ip).length;

  if (ipLogsCount >= 3) {
    return false; // Limit exceeded
  }

  // Record new log
  logs.push({ ip, timestamp: Date.now() });
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    const body = await req.json();
    const { nama, email, hp, pesan } = body;

    // 1. Validasi Input (AC-4.2)
    if (!nama || !email || !hp || !pesan) {
      return NextResponse.json(
        { error: 'Semua field formulir wajib diisi.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (hp.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Nomor HP tidak valid. Minimal terdiri dari 10 digit angka.' },
        { status: 400 }
      );
    }

    // 2. Anti-spam Rate Limit (AC-4.2)
    const allowed = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Batas pengiriman terlampaui. Anda hanya dapat mengirim pesan maksimal 3 kali per jam.' },
        { status: 429 }
      );
    }

    // Save message locally in JSON database
    const { writeContactMessage, readSiteProfile } = require('@/lib/mockDb');
    writeContactMessage({
      nama,
      email,
      hp,
      pesan,
    });

    const profile = readSiteProfile();

    // Mengirim email menggunakan Nodemailer (Gmail)
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await transporter.sendMail({
          from: `"${profile.nama_perusahaan}" <${process.env.GMAIL_USER}>`,
          to: email, // Kirim konfirmasi terima kasih ke email pengirim (user)
          cc: process.env.GMAIL_USER, // Kirim salinan pesan masuk ke email admin (Anda) agar Anda tahu ada pesan baru
          replyTo: email, // Jika Anda membalas email tersebut di Gmail, otomatis membalas ke email si pengirim
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
      } else {
        console.warn("Nodemailer bypass: GMAIL_USER atau GMAIL_APP_PASSWORD belum diatur di .env.local");
      }
    } catch (err) {
      console.error("Nodemailer error: Pengiriman email gagal:", err);
    }

    return NextResponse.json({ success: true, message: 'Pesan berhasil disimpan secara lokal dan email diproses.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
