import { readProperties, readSiteProfile } from '@/lib/mockDb';
import InteractiveShowcase from '@/components/InteractiveShowcase';

export const revalidate = 0; // Disable caching to fetch mockDb updates instantly

export default function LandingPage() {
  const allProperties = readProperties().filter((p) => p.deleted_at === null);
  const siteProfile = readSiteProfile();

  return (
    <div className="flex flex-col bg-[#0D0D0D] min-h-screen">
      {/* Interactive client-side portal for premium real estate search and sector showcase */}
      <InteractiveShowcase initialProperties={allProperties} siteProfile={siteProfile} />
    </div>
  );
}
