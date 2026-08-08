import { TranslatedFieldRenderer } from '@nikkierp/ui/components/DataTable';
import { z } from 'zod';

import { FIELD_RENDERER_AVATAR, FIELD_RENDERER_BADGE, FIELD_RENDERER_TRANSLATED } from '../ids';
import { AvatarFieldRenderer } from './avatar';
import { badgeSpecSchema, BadgeFieldRenderer } from './badge';

import type { IViewRegistry } from '@nikkierp/viewengine/core';


export const translatedSpecSchema = z.object({
	renderer: z.literal('translated'),
	prefix: z.string().optional(),
}).strict();

/**
 * Field renderers are registered as *factories* over a serializable spec. The
 * closure `badge` builds for `translationKey` lives inside the factory, so the
 * page metadata stays plain JSON.
 */
export function registerFieldRenderers(registry: IViewRegistry): void {
	registry.registerFieldRenderer(FIELD_RENDERER_AVATAR, () => new AvatarFieldRenderer());

	registry.registerFieldRenderer(FIELD_RENDERER_BADGE, (spec) => {
		const { colorMap, prefix } = badgeSpecSchema.parse(spec);
		return new BadgeFieldRenderer({
			colorMap,
			translationKey: prefix ? (value: string) => `${prefix}${value}` : undefined,
		});
	});

	registry.registerFieldRenderer(FIELD_RENDERER_TRANSLATED, (spec) => {
		const { prefix } = translatedSpecSchema.parse(spec);
		return new TranslatedFieldRenderer(prefix ?? '');
	});
}
