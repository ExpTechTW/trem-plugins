interface Release {
  tag_name: string;
  name: string;
  downloads: number;
  published_at: string;
}

interface Repository {
  full_name: string;
  releases: {
    total_count: number;
    total_downloads: number;
    releases: Release[];
  };
}

export interface Plugin {
  name: string;
  version: string;
  description: {
    zh_tw: string;
  };
  author: string[];
  dependencies: {
    [key: string]: string;
  };
  link: string;
  status: 'stable' | 'rc' | 'pre';
  repository: Repository;
  updated_at: string;
}
