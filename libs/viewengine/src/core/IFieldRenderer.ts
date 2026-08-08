import type { RenderResult } from './renderResult';
import type { FieldRendererSpec } from '../metadata/types';


export interface IFieldRenderer {
	/**
	 * Render the value.
	 * @param rawValue The raw value as display text (or string form for custom renderers).
	 * @param translatedValue Translated value; same as `rawValue` when `translationKey` is not set.
	 */
	render(rawValue: string, translatedValue: string): RenderResult;

	/** When set, the value is translated with this key before `render` runs. */
	translationKey?(value: string): string;
}

export type FieldRendererMap = Record<string, IFieldRenderer>;

/**
 * Turns a serializable {@link FieldRendererSpec} into a live renderer. The
 * factory may close over values from the spec -- closures are fine *inside* a
 * factory; they were only a problem when the closure was the serialized artifact.
 */
export type FieldRendererFactory<TSpec extends FieldRendererSpec = FieldRendererSpec> =
	(spec: TSpec) => IFieldRenderer;
