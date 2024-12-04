import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { SiGithub } from '@icons-pack/react-simple-icons';
import GithubPeople from './github_people';
import { ChevronDown, Download, Tag, Clock } from 'lucide-react';
import { formatNumber, getRelativeTime, formatTimeString } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import type { Plugin } from '@/modal/plugin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

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
              <div>
                <GithubPeople people={plugin.author} />
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
        <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
          <Clock size={12} className="shrink-0" />
          <div>
            <span>最後更新 </span>
            {plugin.repository.releases.releases[0]?.published_at
              ? (
                  <div className="group relative inline-block">
                    <span className="cursor-help hover:text-foreground transition-colors">
                      {getRelativeTime(plugin.repository.releases.releases[0].published_at)}
                    </span>
                    <span className="invisible group-hover:visible absolute left-0 -top-8
          bg-popover px-2.5 py-1.5 rounded-md text-sm shadow-md whitespace-nowrap
          border z-10"
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
          {plugin.repository.releases.releases.length > 0
          && (
            <div className="flex" onClick={(e) => e.stopPropagation()}>
              <Button className={plugin.repository.releases.releases.length > 1 ? 'rounded-e-none' : ''} asChild>
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
                    <Button size="icon" className="rounded-s-none w-6">
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
