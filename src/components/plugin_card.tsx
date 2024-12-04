import { SiGithub } from '@icons-pack/react-simple-icons';
import { ChevronDown, Download, Tag, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { formatNumber, getRelativeTime, formatTimeString } from '@/lib/utils';

import GithubPeople from './github_people';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

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
      className={`
        cursor-pointer transition-colors
        hover:bg-accent/50
      `}
    >
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl font-bold">{plugin.name}</CardTitle>
            <CardDescription>
              <div>
                <GithubPeople people={plugin.author} />
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-col justify-start">
            <a
              href={plugin.link}
              className={`
                p-1 text-muted-foreground transition-[color]
                hover:text-foreground
              `}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiGithub size={28} />
            </a>
          </div>

        </div>
        <div className={`
          flex items-center gap-2 pt-2 text-sm text-muted-foreground
        `}
        >
          <Clock size={12} className="shrink-0" />
          <div>
            <span>最後更新 </span>
            {plugin.repository.releases.releases[0]?.published_at
              ? (
                  <div className="group relative inline-block">
                    <span className={`
                      cursor-help transition-colors
                      hover:text-foreground
                    `}
                    >
                      {getRelativeTime(plugin.repository.releases.releases[0].published_at)}
                    </span>
                    <span className={`
                      invisible absolute -top-8 left-0 z-10 whitespace-nowrap
                      rounded-md border bg-popover px-2.5 py-1.5 text-sm
                      shadow-md
                      group-hover:visible
                    `}
                    >
                      {formatTimeString(plugin.repository.releases.releases[0].published_at)}
                    </span>
                  </div>
                )
              : (
                  <span>尚未發布</span>
                )}
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag size={16} />
              <span>{plugin.repository.releases.releases[0]?.tag_name ?? '無'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download size={16} />
              <span>{formatNumber(plugin.repository.releases.total_downloads)}</span>
            </div>
          </div>
          {plugin.repository.releases.releases.length > 0
          && (
            <div className="flex" onClick={(e) => e.stopPropagation()}>
              <Button
                className={plugin.repository.releases.releases.length > 1
                  ? `rounded-e-none`
                  : ''}
                asChild
              >
                <a
                  href={`https://github.com/${plugin.repository.full_name}/releases/latest/download/${plugin.name}.trem`}
                  download
                >
                  下載
                </a>
              </Button>
              {plugin.repository.releases.releases.length > 1
              && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" className="w-6 rounded-s-none">
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {plugin.repository.releases.releases.map((release) => (
                      <DropdownMenuItem key={release.tag_name} asChild>
                        <a
                          href={`https://github.com/${plugin.repository.full_name}/releases/download/${release.tag_name}/${plugin.name}.trem`}
                          download
                        >
                          {release.tag_name}
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
