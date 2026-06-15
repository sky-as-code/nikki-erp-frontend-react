import {
	AvatarFieldRenderer, BadgeFieldRenderer, IFieldRenderer, TranslatedFieldRenderer,
} from '../templates/fieldRenderers';

import type { FieldRendererMap } from '../templates/fieldRenderers';


export type FieldRendererFactory = (config: Record<string, unknown>) => IFieldRenderer;

const fieldRendererRegistry = new Map<string, FieldRendererFactory>();

export function registerFieldRenderer(name: string, factory: FieldRendererFactory): void {
	fieldRendererRegistry.set(name, factory);
}

export function resolveFieldRenderer(name: string, config: Record<string, unknown>): IFieldRenderer | undefined {
	return fieldRendererRegistry.get(name)?.(config);
}

export function resolveFieldRendererMap(
	config?: Record<string, { renderer: string } & Record<string, unknown>>,
): FieldRendererMap | undefined {
	if (!config) {
		return undefined;
	}
	const result: FieldRendererMap = {};
	for (const [field, entry] of Object.entries(config)) {
		const renderer = resolveFieldRenderer(entry.renderer, entry);
		if (renderer) {
			result[field] = renderer;
		}
	}
	return result;
}

registerFieldRenderer('avatar', () => new AvatarFieldRenderer());
registerFieldRenderer('badge', config => new BadgeFieldRenderer({
	colorMap: (config.colorMap as Record<string, string>) ?? {},
	translationKey: buildPrefixTranslate(config.prefix),
}));
registerFieldRenderer('translated', config => new TranslatedFieldRenderer((config.prefix as string) ?? ''));

function buildPrefixTranslate(prefix: unknown): ((value: string) => string) | undefined {
	if (typeof prefix !== 'string') {
		return undefined;
	}
	return (value: string) => `${prefix}${value}`;
}
