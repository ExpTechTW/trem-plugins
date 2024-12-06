import { CheckCircle, Clock, Download, ShieldCheck, Tag } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import GithubPeople from './github_people';

import type Plugin from '@/modal/plugin';

type Props = Readonly<{
  plugin: Plugin;
}>;

export default function PluginCard({ plugin }: Props) {
  const router = useRouter();
  const isVerified = plugin.author.includes('ExpTechTW');

  const handleCardClick = () => {
    router.push(`/plugins?name=${plugin.name}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`
        flex h-full cursor-pointer flex-col
        transition-[color_background-color_border-color]
        dark:hover:bg-primary/[.08]
        glow:border-primary glow:bg-primary/[.08]
        hover:border-primary/40 hover:bg-primary/[.04]
      `}
    >
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold text-primary">{plugin.name}</CardTitle>
              {isVerified && (
                <div className="flex translate-y-[1px] items-center gap-2">
                  <CheckCircle
                    size={16}
                    className={`
                      text-green-500
                      dark:text-green-700
                    `}
                  />
                  <ShieldCheck
                    size={16}
                    className={`
                      text-blue-500
                      dark:text-blue-700
                    `}
                  />
                </div>
              )}
            </div>
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
        </div>
      </CardFooter>
    </Card>
  );
}
