import { Button, ButtonProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';

import {
	SearchableSelect,
	SearchableSelectProps,
} from './SearchableSelect';
import { toAriaKeyShortcuts, useShortcut } from '../../shortcuts';

import type { ShortcutSpec } from '../../shortcuts';


export type FlatSearchableSelectProps = Omit<
	SearchableSelectProps,
	'triggerComponent'
> & {
	targetColor?: ButtonProps['color'],
	targetClass?: ButtonProps['className'],
	targetFz?: ButtonProps['fz'],
	targetFw?: ButtonProps['fw'],
	targetP?: ButtonProps['p'],
	targetPb?: ButtonProps['pb'],
	targetPt?: ButtonProps['pt'],
	targetSize?: ButtonProps['size'],
	targetVariant?: ButtonProps['variant'],
	/** `Alt+{shortcut}` opens the dropdown, as a click on the trigger would. */
	shortcut?: ShortcutSpec,
};

type FlatTargetProps = Omit<FlatSearchableSelectProps, keyof SearchableSelectProps>;

// The trigger's look travels by context rather than through a component built per render: a new
// component type on every render would remount the trigger, and with it its shortcut registration.
const FlatTargetContext = React.createContext<FlatTargetProps>({});

export const FlatSearchableSelect: React.FC<FlatSearchableSelectProps> = (props) => {
	const {
		targetColor, targetClass, targetFz, targetFw, targetP, targetPb, targetPt, targetSize, targetVariant,
		shortcut, ...selectProps
	} = props;
	const target = React.useMemo<FlatTargetProps>(() => ({
		targetColor, targetClass, targetFz, targetFw, targetP, targetPb, targetPt, targetSize, targetVariant, shortcut,
	}), [
		targetColor, targetClass, targetFz, targetFw, targetP, targetPb, targetPt, targetSize, targetVariant, shortcut,
	]);

	return (
		<FlatTargetContext.Provider value={target}>
			<SearchableSelect {...selectProps} triggerComponent={FlatButton} />
		</FlatTargetContext.Provider>
	);
};

type FlatButtonProps = ButtonProps & React.ComponentPropsWithoutRef<'button'> & {
	ref?: React.Ref<HTMLButtonElement>,
};

function FlatButtonImpl({ children, ref, ...props }: FlatButtonProps) {
	const target = React.useContext(FlatTargetContext);
	const ownRef = React.useRef<HTMLButtonElement>(null);
	// `Combobox.Target` hands its own ref down; the dropdown anchors to it, so both must be kept.
	const mergedRef = useMergedRef(ref, ownRef);
	useShortcut(ownRef, target.shortcut, { mode: 'click', disabled: props.disabled });

	return (
		<Button
			style={{
				color: 'var(--mantine-color-text)',
			}}
			{...props}
			ref={mergedRef}
			aria-keyshortcuts={toAriaKeyShortcuts(target.shortcut)}
			color={target.targetColor ?? 'inherit'}
			className={target.targetClass}
			fz={target.targetFz ?? 'md'}
			fw={target.targetFw ?? 'normal'}
			p={target.targetP ?? 0}
			pb={target.targetPb ?? 0}
			pt={target.targetPt ?? 0}
			size={target.targetSize ?? 'compact-lg'}
			variant={target.targetVariant ?? 'subtle'}
		>
			{children}
		</Button>
	);
}

const FlatButton = FlatButtonImpl as unknown as typeof Button;
