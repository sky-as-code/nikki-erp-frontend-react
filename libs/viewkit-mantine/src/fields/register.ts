import { TranslatedFieldRenderer } from '@nikkierp/ui/components/DataTable';
import { MoneyFieldRenderer } from '@nikkierp/ui/components/ExcelDataTable';
import { z } from 'zod';

import {
	FIELD_RENDERER_ATTRIBUTE_PILLS, FIELD_RENDERER_AVATAR, FIELD_RENDERER_BADGE,
	FIELD_RENDERER_MONEY, FIELD_RENDERER_TRANSLATED,
} from '../ids';
import { attributePillsSpecSchema, AttributePillsFieldRenderer } from './attributePills';
import { AvatarFieldRenderer } from './avatar';
import { badgeSpecSchema, BadgeFieldRenderer } from './badge';

import type { IViewRegistry } from '@nikkierp/viewengine/core';


export const translatedSpecSchema = z.object({
	renderer: z.literal('translated'),
	prefix: z.string().optional(),
}).strict();

export const moneySpecSchema = z.object({
	renderer: z.literal('money'),
	/**
	 * Overrides the organization's own currency, for a column denominated in something else.
	 * Omitted, the amount is marked with whatever currency the session was booted with.
	 */
	currencySymbol: z.string().min(1).optional(),
	/** Defaults to the currency's decimal places, then to the digits the raw value carries. */
	fractionDigits: z.number().int().min(0).max(20).optional(),
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

	registry.registerFieldRenderer(FIELD_RENDERER_MONEY, (spec) => {
		const { currencySymbol, fractionDigits } = moneySpecSchema.parse(spec);
		return new MoneyFieldRenderer(currencySymbol, fractionDigits);
	});

	registry.registerFieldRenderer(FIELD_RENDERER_ATTRIBUTE_PILLS, (spec) => {
		const { separator } = attributePillsSpecSchema.parse(spec);
		return new AttributePillsFieldRenderer({ separator });
	});
}
