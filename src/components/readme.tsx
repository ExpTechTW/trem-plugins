'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';
import type { Plugin } from '@/modal/plugin';

interface ReadmeProps {
  plugin: Plugin;
}

export default function ReadmeTab({ plugin }: ReadmeProps) {
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReadme() {
      try {
        const [owner, repo] = plugin.repository.full_name.split('/');
        const response = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
        );

        if (!response.ok) {
          throw new Error('無法載入 README');
        }

        const text = await response.text();
        setReadme(text);
        setError(null);
      }
      catch (err) {
        setError('無法載入 README 內容');
        console.error('Error fetching README:', err);
      }
      finally {
        setLoading(false);
      }
    }

    void fetchReadme();
  }, [plugin.repository.full_name]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 prose dark:prose-invert max-w-none">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img {...props} alt={props.alt || ''} className="inline-block" />
            ),
          }}
        >
          {readme || ''}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
