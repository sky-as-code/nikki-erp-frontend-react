import { ICommandBus } from '@nikkierp/common/commandBus';

import { MicroAppDispatchFn } from '../../microApp';
import {
	AvatarFieldRenderer, BadgeFieldRenderer, IFieldRenderer, TranslatedFieldRenderer,
} from '../templates/fieldRenderers';


/**
 * Context passed to template adapters. Adapters convert serializable JSON props
 * (command names, expression objects, renderer ids) into the runtime props the
 * concrete template component expects.
 */
export type AdapterContext = {
	commandBus: ICommandBus,
	dispatch?: MicroAppDispatchFn,
	translationNs?: string,
};

export type FieldRendererFactory = (config: Record<string, unknown>) => IFieldRenderer;

const fieldRendererRegistry = new Map<string, FieldRendererFactory>();

export function registerFieldRenderer(name: string, factory: FieldRendererFactory): void {
	fieldRendererRegistry.set(name, factory);
}

export function resolveFieldRenderer(name: string, config: Record<string, unknown>): IFieldRenderer | undefined {
	return fieldRendererRegistry.get(name)?.(config);
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
