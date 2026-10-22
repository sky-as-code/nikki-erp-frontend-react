import { BadgeFieldRenderer, TranslatedFieldRenderer } from '@nikkierp/ui/components/ExcelDataTable';
import { z } from 'zod';

import {
	FIELD_RENDERER_ATTRIBUTE_PILLS, FIELD_RENDERER_AVATAR, FIELD_RENDERER_BADGE, FIELD_RENDERER_ENUM,
	FIELD_RENDERER_FLOAT, FIELD_RENDERER_INTEGER, FIELD_RENDERER_MONEY, FIELD_RENDERER_TRANSLATED,
} from '../ids';
import { attributePillsSpecSchema, AttributePillsFieldRenderer } from './attributePills';
import { AvatarFieldRenderer, avatarSpecSchema } from './avatar';
import { badgeSpecSchema } from './badge';
import {
	EnumFieldRenderer, enumSpecSchema, FloatFieldRenderer, floatSpecSchema, IntegerFieldRenderer,
	integerSpecSchema, MoneyValueFieldRenderer, moneySpecSchema,
} from './valueRenderers';

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
	registry.registerFieldRenderer(FIELD_RENDERER_AVATAR, (spec) => {
		const { urlField } = avatarSpecSchema.parse(spec);
		return new AvatarFieldRenderer(urlField);
	});

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

	registerValueRenderers(registry);

	registry.registerFieldRenderer(FIELD_RENDERER_ATTRIBUTE_PILLS, (spec) => {
		const { separator } = attributePillsSpecSchema.parse(spec);
		return new AttributePillsFieldRenderer({ separator });
	});
}

function registerValueRenderers(registry: IViewRegistry): void {
	registry.registerFieldRenderer(FIELD_RENDERER_INTEGER, (spec) => {
		integerSpecSchema.parse(spec);
		return new IntegerFieldRenderer();
	});

	registry.registerFieldRenderer(FIELD_RENDERER_FLOAT, (spec) => {
		const { precision } = floatSpecSchema.parse(spec);
		return new FloatFieldRenderer(precision);
	});

	registry.registerFieldRenderer(FIELD_RENDERER_MONEY, (spec) => {
		const { currencyField } = moneySpecSchema.parse(spec);
		return new MoneyValueFieldRenderer(currencyField);
	});

	registry.registerFieldRenderer(FIELD_RENDERER_ENUM, (spec) => {
		const { colorMap, prefix } = enumSpecSchema.parse(spec);
		return new EnumFieldRenderer(colorMap, prefix);
	});
}
