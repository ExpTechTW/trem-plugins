import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { SiGithub } from '@icons-pack/react-simple-icons';
import GithubPeople from './github_people';
import { Download, Tag, Clock } from 'lucide-react';
import { formatNumber, formatTimeString } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import type { Plugin } from '@/modal/plugin';

interface Props {
  plugin: Plugin;
}

export default function PluginCard({ plugin }: Props) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/plugins/${plugin.name}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="transition-colors hover:bg-accent/50 cursor-pointer"
    >
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl font-bold">{plugin.name}</CardTitle>
            <CardDescription>
              <div className="flex flex-col gap-2">
                <GithubPeople people={plugin.author} />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} className="shrink-0" />
                  <span>
                    {plugin.repository.releases.releases[0]?.published_at
                      ? `最後更新 ${formatTimeString(plugin.repository.releases.releases[0].published_at)}`
                      : '尚未發布'}
                  </span>
                </div>
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-col justify-start">
            <a
              href={plugin.link}
              className="p-1 text-muted-foreground hover:text-foreground transition-[color]"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiGithub size={28} />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p>{plugin.description.zh_tw}</p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center text-muted-foreground">
              <Tag size={16} />
              <span>{plugin.repository.releases.releases[0]?.tag_name ?? '無'}</span>
            </div>
            <div className="flex gap-2 items-center text-muted-foreground">
              <Download size={16} />
              <span>{formatNumber(plugin.repository.releases.total_downloads)}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
