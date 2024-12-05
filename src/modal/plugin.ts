import { z } from 'zod';

import Repository from './repository';

const Plugin = z.object({
  name: z.string(),
  version: z.string(),
  description: z.object({
    zh_tw: z.string(),
  }),
  author: z.array(z.string()),
  dependencies: z.record(z.string(), z.string()),
  link: z.string(),
  repository: Repository,
  updated_at: z.string(),
});

type Plugin = z.infer<typeof Plugin>;

export default Plugin;
