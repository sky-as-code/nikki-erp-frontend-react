import { Modal as MantineModal } from '@mantine/core';
import React from 'react';

import { getShortcutRegistry } from '../../shortcuts';

import type { ModalContentProps as MantineModalContentProps, ModalProps as MantineModalProps } from '@mantine/core';


export type ModalProps = MantineModalProps & { ref?: React.Ref<HTMLDivElement> };

export type ModalContentProps = MantineModalContentProps & { ref?: React.Ref<HTMLDivElement> };

/**
 * Rendered inside the dialog's content, so it mounts and unmounts with it — the enter and exit
 * transitions included — and the scope is live from the first frame the dialog is on screen.
 */
function ModalShortcutScope(): React.ReactElement {
	const anchorRef = React.useRef<HTMLSpanElement>(null);
	React.useEffect(() => {
		const anchor = anchorRef.current;
		const root = anchor?.closest('[role="dialog"]') ?? anchor?.parentElement;
		return root ? getShortcutRegistry().pushScope(root) : undefined;
	}, []);
	// `hidden` is display:none: no box, and no gap in a flex parent.
	return <span ref={anchorRef} hidden data-shortcut-scope-anchor />;
}

/**
 * Mantine's `Modal` that owns the keyboard while it is open: only the shortcuts of controls inside
 * it show a badge and fire (wiki 06 §8.4). A modal opened from it takes over, and closing it hands
 * the keys back. No Mantine default is changed; `ref` rides along in `rest` (React 19).
 */
export function Modal({ children, ...rest }: ModalProps): React.ReactElement {
	return (
		<MantineModal {...rest}>
			<ModalShortcutScope />
			{children}
		</MantineModal>
	);
}

/** The compound form's content, scoped like {@link Modal}. */
function ModalContent({ children, ...rest }: ModalContentProps): React.ReactElement {
	return (
		<MantineModal.Content {...rest}>
			<ModalShortcutScope />
			{children}
		</MantineModal.Content>
	);
}

Modal.Root = MantineModal.Root;
Modal.Overlay = MantineModal.Overlay;
Modal.Content = ModalContent;
Modal.Header = MantineModal.Header;
Modal.Title = MantineModal.Title;
Modal.CloseButton = MantineModal.CloseButton;
Modal.Body = MantineModal.Body;
Modal.Stack = MantineModal.Stack;
