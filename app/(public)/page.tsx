import { readProperties, readSiteProfile } from '@/lib/mockDb';
import InteractiveShowcase from '@/components/InteractiveShowcase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LandingPage() {
  const allProperties = await readProperties();
  const activeProperties = allProperties.filter((p) => !p.deleted_at);
  const siteProfile = await readSiteProfile();

  return (
    <div className="flex flex-col bg-[#0D0D0D] min-h-screen">
      <InteractiveShowcase initialProperties={activeProperties} siteProfile={siteProfile} />
    </div>
  );
}
