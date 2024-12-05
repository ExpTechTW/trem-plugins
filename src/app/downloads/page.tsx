import DownloadsPageClient from '@/app/downloads/client';

import type { NextPage } from 'next';

interface DownloadsPageProps {
  params?: { version?: string };
}

const DownloadsPage: NextPage<DownloadsPageProps> = ({ params }) => {
  const { version } = params || {};
  return <DownloadsPageClient initialVersion={version || ''} />;
};

export default DownloadsPage;

export function generateStaticParams(): DownloadsPageProps[] {
  return [{ params: { version: undefined } }];
}
