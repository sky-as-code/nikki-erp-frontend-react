import { z } from 'zod';


/**
 * `resource_form` props.
 *
 * Split out of `resourceForm.tsx` so the React-free `props.ts` entry point can parse them without
 * importing a `.tsx` — the same split every other component in this kit uses.
 */
export const resourceFormPropsSchema = z.object({
	variant: z.enum(['create', 'update']).default('update'),
}).strict();

export type ResourceFormProps = z.output<typeof resourceFormPropsSchema>;
export type ResourceFormPropsInput = z.input<typeof resourceFormPropsSchema>;
