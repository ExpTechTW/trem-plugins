const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/trem-plugins' : '';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/ExpTechTW/trem-plugins/main/public';

const getReleaseNoteContent = async (version: string) => {
  if (!version) return null;
  try {
    const normalizedVersion = version.replace(/^v/, '');

    const baseUrl = isProduction
      ? `${GITHUB_RAW_URL}/releases`
      : `${basePath}/releases`;

    const response = await fetch(`${baseUrl}/${normalizedVersion}.md`);

    if (!response.ok) {
      console.log(`Failed to load release notes for ${version}: ${response.statusText}`);
      return null;
    }

    return await response.text();
  }
  catch (error) {
    console.log(`Failed to load release notes for version ${version}:`, error);
    return null;
  }
};

const emojiMap: Record<string, string> = {
  ':star2:': '⭐',
  ':green_square:': '🟩',
  ':MacOS:': '<img src="https://cdn.discordapp.com/emojis/1302898671641170012.webp?size=80" alt="MacOS" class="inline h-5 w-5" />',
  ':Windows:': '<img src="https://cdn.discordapp.com/emojis/1302898878667821058.webp?size=80" alt="Windows" class="inline h-5 w-5" />',
  ':electric_plug:': '🔌',
  ':lady_beetle:': '🐞',
  ':tools:': '🛠️',
  ':warning:': '⚠️',
};

function convertEmoji(text: string): string {
  return text.replace(/:([\w_]+):/g, (match) => {
    return emojiMap[match] || match;
  });
}

export async function getReleaseContent(version: string): Promise<string> {
  const content = await getReleaseNoteContent(version);
  return content ? convertEmoji(content) : '此版本無更新日誌。';
}
