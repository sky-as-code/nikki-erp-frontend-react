import { z } from 'zod';


export const badgeSpecSchema = z.object({
	renderer: z.literal('badge'),
	colorMap: z.record(z.string(), z.string()).default({}),
	prefix: z.string().optional(),
}).strict();
