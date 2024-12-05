import { z } from 'zod';

import Release from './release';

const Repository = z.object({
  full_name: z.string(),
  releases: z.object({
    total_count: z.number(),
    total_downloads: z.number(),
    releases: z.array(Release),
  }),
});

type Repository = z.infer<typeof Repository>;

export default Repository;
