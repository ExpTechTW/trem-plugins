'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import DownloadsPageClient from '@/app/downloads/client';

const DownloadsPageContent = () => {
  const searchParams = useSearchParams();
  const version = searchParams.get('version') || '';

  return <DownloadsPageClient initialVersion={version} />;
};

const DownloadsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadsPageContent />
    </Suspense>
  );
};

export default DownloadsPage;
