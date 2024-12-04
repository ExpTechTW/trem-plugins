import { SiGithub } from '@icons-pack/react-simple-icons';
import { ChevronDown, Clock, Download, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';

import GithubPeople from './github_people';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import type { Plugin } from '@/modal/plugin';

type Props = Readonly<{
  plugin: Plugin;
}>;

export default function PluginCard({ plugin }: Props) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/plugins/${plugin.name}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`
        flex h-full cursor-pointer flex-col
        transition-[color_background-color_border-color]
        dark:hover:bg-primary/[.08] dark:glow:bg-primary/[.12]
        glow:border-primary/40 glow:bg-primary/[.08]
        hover:border-primary/20 hover:bg-primary/[.04]
      `}
    >
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl font-bold">{plugin.name}</CardTitle>
            <CardDescription>
              <div className="flex flex-col gap-2">
                <GithubPeople people={plugin.author} />
                <div>
                  {plugin.repository.releases.releases[0]?.published_at
                  && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="shrink-0" />
                      <Tooltip>
                        <TooltipContent>
                          {formatTimeString(plugin.repository.releases.releases[0].published_at)}
                        </TooltipContent>
                        <TooltipTrigger>
                          最後更新
                          {' '}
                          {getRelativeTime(plugin.repository.releases.releases[0].published_at)}
                        </TooltipTrigger>
                      </Tooltip>
                    </div>
                  )}
                </div>
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
      </CardHeader>
      <CardContent className="flex-1">
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
