import clsx from 'clsx';

import classes from './inputDensity.module.css';


type InputClassNames = Record<string, string | undefined>;

/**
 * Adds the density classes to a Mantine input's `classNames`, keeping any the caller passed.
 *
 * For any Mantine input built on `Input` (`TextInput`, `NumberInput`, `Select`, `DateInput`,
 * `InputBase`...): its control then takes its height from `--nikki-control-height` instead of the
 * `size` prop. Apply it only when the caller gave no `size` — an explicit size keeps its own
 * height. Mantine also accepts a `classNames` *function*; that form is passed through untouched.
 */
export function withInputDensity<T>(classNames: T): T {
	return addDensityClasses(classNames);
}

/**
 * {@link withInputDensity} for a field of a form or of a page body: its control takes its height
 * from `--nikki-form-control-height` (Mantine's `md`, 42px, in spacious) instead. Pair it with
 * {@link FORM_INPUT_SIZE}, whose only remaining job is the typography: density never changes it.
 * Inside an inline-controls scope the form token is remapped too, so an `AutoField` in a table row
 * still takes the inline height.
 */
export function withFormInputDensity<T>(classNames: T): T {
	return addDensityClasses(classNames, classes.form);
}

/**
 * {@link withInputDensity} for a pill input (`MultiSelect`, `TagsInput`). Mantine lays these out as
 * multiline inputs, which the single-line rules leave alone: this sizes the box's floor and its
 * vertical padding from the density token instead, so the pills grow it only past one line.
 */
export function withPillsInputDensity<T>(classNames: T): T {
	return addDensityClasses(classNames, classes.pills);
}

/**
 * The Mantine `size` a form field passes, for its font and its dropdown's: `md`, the size forms had
 * before density existed. Its height is overridden by {@link withFormInputDensity}.
 */
export const FORM_INPUT_SIZE = 'md';

/** The form field `size` inside an inline-controls scope: the row's small text, options included. */
export const INLINE_INPUT_SIZE = 'sm';

export type FormInputSize = typeof FORM_INPUT_SIZE | typeof INLINE_INPUT_SIZE;

/**
 * A form field's `size` and `classNames` ({@link FORM_INPUT_SIZE}, {@link withFormInputDensity}),
 * merged under the caller's `inputProps`. A caller's own `size` keeps that size's own height.
 * Pass `useFormInputSize()` as `size` so a field in a table row opens a dropdown matching its text.
 */
export function formInputProps<T extends { size?: unknown, classNames?: unknown }>(
	props?: T, size: FormInputSize = FORM_INPUT_SIZE,
): T {
	return {
		size,
		...props,
		classNames: props?.size ? props.classNames : withFormInputDensity(props?.classNames),
	} as T;
}

function addDensityClasses<T>(classNames: T, variant?: string): T {
	if (typeof classNames === 'function') return classNames;
	const own = classNames as InputClassNames | undefined;
	return {
		...own,
		wrapper: clsx(classes.wrapper, variant, own?.wrapper),
		input: clsx(classes.input, own?.input),
	} as T;
}

/**
 * Marks a scope whose controls take the inline height — an ExcelDataTable row in insert or edit
 * mode. The Shell's `density.css` remaps `--nikki-control-height` to `--nikki-control-height-inline`
 * under it, and drops input and button text to `--mantine-font-size-sm`, so every density-aware
 * control inside shrinks without a `size` prop. A portalled dropdown escapes that CSS scope: wrap the
 * row in `InlineControlsScope` too, so form fields size their options to match (`useFormInputSize`).
 */
export const INLINE_CONTROLS_ATTRS = { 'data-nikki-inline-controls': '' } as const;
