import { MaskInput as MantineMaskInput } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';

import { withInputDensity } from '../Input/inputDensity';

import type { MaskInputProps as MantineMaskInputProps } from '@mantine/core';


export type MaskInputProps = Omit<MantineMaskInputProps, 'value' | 'defaultValue'> & {
	/**
	 * The raw value. Mantine's mask edits the DOM itself and reports through `onChangeRaw`, so it
	 * cannot be React-controlled; a value set here is typed into the mask instead, without echoing
	 * back through `onChangeRaw` (a stored value the mask would reject stays untouched until edited).
	 */
	value?: string | null,
	ref?: React.Ref<HTMLInputElement>,
};

/**
 * Feeds an outside value into the mask by firing the `input` event its own listener reformats
 * from, the only way to reach its internal state. A value the mask itself just reported is skipped,
 * so typing never round-trips (that would also jump the caret to the end).
 */
function useMaskValueSync(
	inputRef: React.RefObject<HTMLInputElement | null>,
	value: string | null | undefined,
	lastRawRef: React.RefObject<string | undefined>,
	syncingRef: React.RefObject<boolean>,
): void {
	React.useLayoutEffect(() => {
		const input = inputRef.current;
		if (!input || value === undefined || (value ?? '') === lastRawRef.current) {
			return;
		}
		lastRawRef.current = value ?? '';
		input.value = value ?? '';
		syncingRef.current = true;
		input.dispatchEvent(new Event('input'));
		syncingRef.current = false;
	}, [inputRef, value, lastRawRef, syncingRef]);
}

/**
 * Mantine's `MaskInput` at the app's standard density (see `Input`), with a `value` prop it can
 * follow. Read the value back from `onChangeRaw`, not `onChange`: the mask writes the DOM directly.
 */
export function MaskInput({
	size, classNames, value, onChangeRaw, ref: forwardedRef, ...props
}: MaskInputProps): React.ReactElement {
	const ownRef = React.useRef<HTMLInputElement>(null);
	const ref = useMergedRef(forwardedRef, ownRef);
	const lastRawRef = React.useRef<string | undefined>(undefined);
	const syncingRef = React.useRef(false);
	useMaskValueSync(ownRef, value, lastRawRef, syncingRef);

	const handleChangeRaw = (raw: string, masked: string) => {
		if (syncingRef.current) {
			return;
		}
		lastRawRef.current = raw;
		onChangeRaw?.(raw, masked);
	};

	return (
		<MantineMaskInput
			size={size ?? 'sm'}
			classNames={size ? classNames : withInputDensity(classNames)}
			{...props}
			onChangeRaw={handleChangeRaw}
			ref={ref}
		/>
	);
}
