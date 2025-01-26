import { z } from 'zod';

const Release = z.object({
  tag_name: z.string(),
  name: z.string(),
  downloads: z.number(),
  published_at: z.string().nullable(),
});

type Release = z.infer<typeof Release>;

export default Release;
