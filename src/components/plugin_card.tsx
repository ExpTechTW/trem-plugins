import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SiGithub } from '@icons-pack/react-simple-icons';
import GithubPeople from './github_people';
import { ChevronDown, Download, Tag } from 'lucide-react';
import { formatNumber, formatTimeString } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
                <span>
                  資料更新於
                  {' '}
                  {formatTimeString(plugin.updated_at)}
                </span>
                <span>
                  {plugin.repository.releases.releases[0]?.published_at
                    ? `最後發布於 ${formatTimeString(plugin.repository.releases.releases[0].published_at)}`
                    : '尚未發布'}
                </span>
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
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p>
            {plugin.description.zh_tw}
          </p>
          <div className="flex gap-2 items-center text-muted-foreground flex-wrap">
            {Object.entries(plugin.dependencies).map(([key, value]) => (
              <Badge key={key} variant="secondary">
                {key}
                {value}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center text-muted-foreground">
              <Tag size={16} />
              <span>
                {plugin.repository.releases.releases[0]?.tag_name ?? '無'}
              </span>
            </div>
            <div className="flex gap-2 items-center text-muted-foreground">
              <Download size={16} />
              <span>
                {formatNumber(plugin.repository.releases.total_downloads)}
              </span>
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
