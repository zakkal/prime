import fs from 'fs';
import path from 'path';

export interface Property {
  id: string;
  nama_property: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string[];
  tipe: 'Ruko' | 'Villa';
  tingkat: number;
  price: number;
  carport: boolean;
  status: 'in_stock' | 'sold_out';
  siap: 'siap_huni' | 'siap_kosong' | 'siap_huni_renovasi';
  maps_link: string | null;
  kawasan: string[];
  unit: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string | null;
}

export interface AuditLog {
  id: string;
  property_id: string;
  property_name: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  changed_by: string;
  changed_fields: string;
  created_at: string;
}

export interface LockoutState {
  failedAttempts: number;
  lockedUntil: string | null;
}

export interface SiteProfile {
  nama_perusahaan: string;
  tagline_baris1: string;
  tagline_baris2: string;
  deskripsi_hero: string;
  alamat: string;
  telepon: string;
  telepon_display: string;
  whatsapp: string;
  whatsapp_display: string;
  email: string;
  jam_operasional: string;
  hari_operasional: string;
  akurasi_dimensi: number;
  maps_embed_url: string;
  updated_at: string;
  updated_by: string;
}

export interface ContactMessage {
  id: string;
  nama: string;
  email: string;
  hp: string;
  pesan: string;
  created_at: string;
  is_read: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');
const LOCKOUT_FILE = path.join(DATA_DIR, 'lockout.json');
const SITE_PROFILE_FILE = path.join(DATA_DIR, 'site_profile.json');
const CONTACT_MESSAGES_FILE = path.join(DATA_DIR, 'contact_messages.json');

const DEFAULT_SITE_PROFILE: SiteProfile = {
  nama_perusahaan: 'Prime Property',
  tagline_baris1: 'Hunian Mewah',
  tagline_baris2: 'Tanpa Batasan',
  deskripsi_hero: 'Menghadirkan kurasi Villa & Ruko premium di lokasi paling bergengsi di Medan. Kami menawarkan transparansi penuh, akurasi dimensi bersertifikat, dan layanan VIP personal untuk investasi properti Anda.',
  alamat: 'Jl. Cemara Asri Boulevard No. 88, Medan, Sumatera Utara, Indonesia 20371',
  telepon: '+6261​88997766',
  telepon_display: '+62 61 8899 7766',
  whatsapp: '6281160008899',
  whatsapp_display: '+62 811 6000 8899',
  email: 'info@primeproperty.com',
  jam_operasional: '08.00 – 17.00 WIB',
  hari_operasional: 'Senin – Sabtu',
  akurasi_dimensi: 99,
  maps_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9790695029053!2d98.69469507604558!3d3.6377626963363363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30313220fbf7774d%3s0x303131804a9d701b!2sKawasan%20Cemara%20Asri!5e0!3m2!1sid!2sid!4v1717326880000!5m2!1sid!2sid',
  updated_at: new Date().toISOString(),
  updated_by: 'system',
};

const INITIAL_KAWASAN = ['Krakatau', 'Pancing', 'Cemara Asri', 'Tembung', 'Helvetia', 'Kuala'];

// Generates 50 mock properties
const generateInitialProperties = (): Property[] => {
  const list: Property[] = [];
  const clusterNames = ['Residence', 'Villas', 'Heights', 'Mansion', 'Townhouse', 'Executive', 'Garden', 'Square'];
  const groups = ['Mentari', 'Permai 123', 'Project Ville', 'Nirwana', 'Citra Core', null];
  const directions = [['Utara'], ['Selatan'], ['Timur'], ['Barat'], ['Utara', 'Timur'], ['Selatan', 'Barat']];
  
  for (let i = 1; i <= 55; i++) {
    const kawasan = INITIAL_KAWASAN[i % INITIAL_KAWASAN.length];
    const cluster = clusterNames[i % clusterNames.length];
    const name = `${kawasan} ${cluster} Blok ${String.fromCharCode(65 + (i % 6))}-${i * 2}`;
    const group = groups[i % groups.length];
    const width = 4 + (i % 5) * 0.5 + (i % 2) * 0.25;
    const length = 10 + (i % 8) * 2;
    const hadap = directions[i % directions.length];
    const tipe = i % 3 === 0 ? 'Ruko' : 'Villa';
    const tingkat = 1 + (i % 3) + (i % 2 === 0 ? 0.5 : 0);
    // Price range: Rp 600,000,000 to Rp 4,500,000,000
    const price = 600000000 + (i * 70000000) + (i % 3) * 150000000;
    const carport = i % 2 === 0;
    const status = i % 8 === 0 ? 'sold_out' : 'in_stock';
    const siap = i % 3 === 0 ? 'siap_huni' : i % 3 === 1 ? 'siap_kosong' : 'siap_huni_renovasi';
    const maps_link = `https://google.com/maps?q=${3.6 + (i * 0.01)},${98.6 + (i * 0.01)}`;
    const unit = i % 5 === 0 ? 'Ready Siap huni' : i % 5 === 1 ? 'Gate siap' : i % 5 === 2 ? 'Rucon' : null;

    list.push({
      id: `prop-${i}`,
      nama_property: name,
      group,
      lebar: width,
      panjang: length,
      hadap,
      tipe,
      tingkat,
      price,
      carport,
      status,
      siap,
      maps_link,
      kawasan: [kawasan],
      unit,
      created_at: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'superadmin-id',
      deleted_at: null
    });
  }
  return list;
};

// Ensure data files exist
export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROPERTIES_FILE)) {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(generateInitialProperties(), null, 2), 'utf-8');
  } else {
    // Migration: ensure foto_url field is removed from all properties
    try {
      const data = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
      const properties = JSON.parse(data) as any[];
      let updated = false;

      properties.forEach((p) => {
        if ('foto_url' in p) {
          delete p.foto_url;
          updated = true;
        }
      });
      if (updated) {
        fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(LOCKOUT_FILE)) {
    fs.writeFileSync(LOCKOUT_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
  if (!fs.existsSync(SITE_PROFILE_FILE)) {
    fs.writeFileSync(SITE_PROFILE_FILE, JSON.stringify(DEFAULT_SITE_PROFILE, null, 2), 'utf-8');
  }
  if (!fs.existsSync(CONTACT_MESSAGES_FILE)) {
    fs.writeFileSync(CONTACT_MESSAGES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

let cachedProfile: SiteProfile | null = null;

// Site Profile
export function readSiteProfile(): SiteProfile {
  if (cachedProfile) {
    return cachedProfile;
  }
  initDb();
  try {
    const data = fs.readFileSync(SITE_PROFILE_FILE, 'utf-8');
    cachedProfile = { ...DEFAULT_SITE_PROFILE, ...JSON.parse(data) };
    return cachedProfile;
  } catch (e) {
    return DEFAULT_SITE_PROFILE;
  }
}

export function writeSiteProfile(profile: SiteProfile) {
  initDb();
  fs.writeFileSync(SITE_PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  cachedProfile = profile;
}

// Contact Messages
export function readContactMessages(): ContactMessage[] {
  initDb();
  try {
    const data = fs.readFileSync(CONTACT_MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function writeContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>) {
  initDb();
  const messages = readContactMessages();
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...msg,
    created_at: new Date().toISOString(),
    is_read: false,
  };
  messages.unshift(newMsg);
  fs.writeFileSync(CONTACT_MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  return newMsg;
}

let cachedProperties: Property[] | null = null;

// Reader
export function readProperties(): Property[] {
  if (cachedProperties) {
    return cachedProperties;
  }
  initDb();
  try {
    const data = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
    cachedProperties = JSON.parse(data);
    return cachedProperties || [];
  } catch (e) {
    return [];
  }
}

// Writer
export function writeProperties(properties: Property[]) {
  initDb();
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  cachedProperties = properties;
}

// Audit logger
export function readAuditLogs(): AuditLog[] {
  initDb();
  try {
    const data = fs.readFileSync(AUDIT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function writeAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
  initDb();
  const logs = readAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...log,
    created_at: new Date().toISOString()
  };
  logs.unshift(newLog);
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

// Lockout Handler
export function readLockouts(): Record<string, LockoutState> {
  initDb();
  try {
    const data = fs.readFileSync(LOCKOUT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

export function writeLockouts(lockouts: Record<string, LockoutState>) {
  initDb();
  fs.writeFileSync(LOCKOUT_FILE, JSON.stringify(lockouts, null, 2), 'utf-8');
}
