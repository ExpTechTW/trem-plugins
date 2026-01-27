'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VersionBadge from '@/components/dialogs/version';

interface GithubRelease {
  tag_name: string;
  published_at: string;
}

interface ReleaseNotesProps {
  releases: GithubRelease[];
  releaseContent: string;
  initialVersion: string;
}

const ReleaseNotes = ({ releases, releaseContent, initialVersion }: ReleaseNotesProps) => {
  const currentRelease = releases.find((r) => r.tag_name === initialVersion);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`
                text-2xl font-semibold
                sm:text-4xl
              `}
              >
                {initialVersion}
              </div>
              <VersionBadge version={initialVersion} />
            </div>
            <CardTitle className={`
              text-lg font-bold
              sm:text-xl
            `}
            >
              更新日誌
            </CardTitle>
          </div>
          {currentRelease && (
            <div className="text-sm text-muted-foreground">
              發布時間：
              {formatDate(currentRelease.published_at)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`
          prose max-w-none
          [&_img]:my-0 [&_img]:inline
          [&_p]:whitespace-pre-line
          dark:prose-invert
          prose-code:before:content-none prose-code:after:content-none
        `}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              code: ({ children, className, ...props }) => {
                let rawText = '';
                if (Array.isArray(children)) {
                  rawText = children.map((child) => (typeof child === 'string' ? child : '')).join('');
                }
                else if (typeof children === 'string') {
                  rawText = children;
                }
                const isProbablyBlock = rawText.includes('\n');

                if (!isProbablyBlock) {
                  return (
                    <code
                      {...props}
                      className={`
                        rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]
                        text-foreground
                        before:content-none after:content-none
                      `}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
              img: ({ ...props }) => (
                <img
                  {...props}
                  className="inline-block h-5 w-5 align-middle mx-0.5"
                />
              ),
            }}
          >
            {releaseContent}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReleaseNotes;
