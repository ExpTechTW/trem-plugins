import { type Plugin } from '@/modal/plugin';

async function getPlugins(): Promise<Plugin[]> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
      { next: { revalidate: 3600 } },
    );
    return response.json() as Promise<Plugin[]>;
  }
  catch (error) {
    console.error('Error fetching plugins:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const plugins = await getPlugins();

  return plugins.map((plugin) => ({
    name: plugin.name,
  }));
}

async function getPluginData(name: string): Promise<Plugin | null> {
  const plugins = await getPlugins();
  return plugins.find((plugin) => plugin.name === name) || null;
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function PluginPage({ params }: PageProps) {
  const { name } = await params;
  const plugin = await getPluginData(name);

  if (!plugin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">找不到擴充</h1>
        <p>
          找不到名為
          {name}
          {' '}
          的擴充。
        </p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{plugin.name}</h1>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">描述</h2>
              <p>{plugin.description.zh_tw}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">作者</h2>
              <div className="flex gap-2 flex-wrap">
                {plugin.author.map((author) => (
                  <span key={author} className="bg-secondary px-2 py-1 rounded">
                    {author}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">版本資訊</h2>
              <div className="space-y-2">
                <p>
                  目前版本：
                  {plugin.version}
                </p>
                <p>
                  最後更新：
                  {new Date(plugin.updated_at).toLocaleDateString('zh-TW')}
                </p>
                {plugin.repository.releases.releases[0]?.published_at && (
                  <p>
                    最後發布：
                    {new Date(plugin.repository.releases.releases[0].published_at).toLocaleDateString('zh-TW')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">相依性</h2>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(plugin.dependencies).map(([key, value]) => (
                  <span key={key} className="bg-secondary px-2 py-1 rounded">
                    {key}
                    {' '}
                    {value}
                  </span>
                ))}
              </div>
            </div>

            {plugin.repository.releases.releases.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">版本紀錄</h2>
                <div className="space-y-4">
                  {plugin.repository.releases.releases.map((release) => (
                    <div key={release.tag_name} className="border-b pb-4">
                      <h3 className="font-medium mb-1">
                        {release.tag_name}
                        <span className="text-sm text-muted-foreground ml-2">
                          (
                          {new Date(release.published_at).toLocaleDateString('zh-TW')}
                          )
                        </span>
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          下載次數:
                          {' '}
                          {release.downloads}
                        </span>
                        <a
                          href={`https://github.com/${plugin.repository.full_name}/releases/download/${release.tag_name}/${plugin.name}.trem`}
                          className="text-primary hover:underline"
                          download
                        >
                          下載此版本
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <a
                href={plugin.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                在 GitHub 上查看 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
