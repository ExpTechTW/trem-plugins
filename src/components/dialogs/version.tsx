import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VersionBadgeProps {
  version: string;
}

const getVersionInfo = (version: string) => {
  if (version.includes('v0.')) {
    return {
      type: 'dev',
      label: 'DEV',
      color: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
      iconColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-500 dark:text-gray-400',
      description: '開發版本，可能不穩定且包含錯誤。',
    };
  }

  if (version.includes('-pre')) {
    return {
      type: 'pre',
      label: 'Pre-Release',
      color: 'text-red-500 bg-red-100 dark:bg-red-900/20',
      iconColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-500 dark:text-red-400',
      description: '預覽版本，功能尚未完整測試。',
    };
  }

  if (version.includes('-rc')) {
    return {
      type: 'rc',
      label: 'Release Candidate',
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-500 dark:text-orange-400',
      description: '候選發布版本，即將正式發布。',
    };
  }

  return {
    type: 'stable',
    label: 'Release',
    color: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    iconColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-500 dark:text-green-400',
    description: '穩定版本，建議一般用戶使用。',
  };
};

const VersionBadge: React.FC<VersionBadgeProps> = ({ version }) => {
  const info = getVersionInfo(version);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`
            inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
            ${info.color}
            transition-opacity
            hover:opacity-80
          `}
        >
          {info.label}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <DialogTitle className={`
              text-xl
              ${info.textColor}
            `}
            >
              {info.label}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm">{info.description}</div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default VersionBadge;
