import { templateRefSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


/**
 * Both panes are {@link TemplateRef}s, not inlined props of one concrete
 * template. That is what makes split view ordinary composition: a third party
 * can put their own list template in the primary pane, which the previous
 * `primaryProps: ResourceListTemplateProps` shape made impossible.
 */
export const resourceSplitViewPropsSchema = z.object({
	primary: templateRefSchema,
	secondary: templateRefSchema,
}).strict();

export type ResourceSplitViewProps = z.infer<typeof resourceSplitViewPropsSchema>;
export type ResourceSplitViewPropsInput = z.input<typeof resourceSplitViewPropsSchema>;
