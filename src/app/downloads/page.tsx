import DownloadsPageClient from '@/app/downloads/client';

import type { NextPage } from 'next';

interface DownloadsPageProps {
  searchParams?: { version?: string };
}

const DownloadsPage: NextPage<DownloadsPageProps> = ({ searchParams }) => {
  const { version } = searchParams || {};
  return <DownloadsPageClient initialVersion={version || ''} />;
};

export default DownloadsPage;
