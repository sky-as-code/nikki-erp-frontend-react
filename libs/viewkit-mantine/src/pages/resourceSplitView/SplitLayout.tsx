import { ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './SplitLayout.module.css';


const DEFAULT_RATIO = 0.20;
const DEFAULT_MIN_RATIO = 0.15;
const DEFAULT_MAX_RATIO = 0.85;


export type RenderPrimaryParams = {
	openSecondary: () => void,
	closeSecondary: () => void,
	isSecondaryOpen: boolean,
};

export type SplitLayoutProps = {
	renderPrimary: (params: RenderPrimaryParams) => React.ReactNode,
	renderSecondary: () => React.ReactNode,
	primaryOpen?: boolean,
	/** Controlled open state. If omitted, SplitLayout manages it internally. */
	secondaryOpen?: boolean,
	onOpenChange?: (open: boolean) => void,
	defaultRatio?: number,
	minRatio?: number,
	maxRatio?: number,
	/**
	 * Closes the primary pane, leaving the secondary one fullscreen. When omitted the primary
	 * pane offers no close affordance — a layout with nothing to fall back to must not
	 * render a button that would empty the view.
	 */
	onClosePrimary?: () => void,
	closePrimaryLabel?: string,
};


export function SplitLayout(props: SplitLayoutProps): React.ReactNode {
	const {
		primaryOpen = true,
		secondaryOpen = true,
	} = props;
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const openState = useSecondaryOpenState(props);
	const drag = useSplitterDrag({
		containerRef,
		initialRatio: props.defaultRatio ?? DEFAULT_RATIO,
		minRatio: props.minRatio ?? DEFAULT_MIN_RATIO,
		maxRatio: props.maxRatio ?? DEFAULT_MAX_RATIO,
	});

	const primaryNode = primaryOpen ? props.renderPrimary?.({
		openSecondary: openState.openSecondary,
		closeSecondary: openState.closeSecondary,
		isSecondaryOpen: openState.isOpen,
	}) : null;
	const secondaryNode = secondaryOpen ? props.renderSecondary() : null;
	const primaryWidth = openState.isOpen ? `${drag.ratio * 100}%` : '100%';
	const secondaryWidth = openState.isOpen ? `${(1 - drag.ratio) * 100}%` : '0%';
	const paneTransition = drag.isDragging ? 'none' : undefined;

	return (
		<div ref={containerRef} className={clsx(classes.container, 'relative flex w-full h-full')}>
			{primaryNode ? (
				<>
					<div className={classes.pane} style={{ width: primaryWidth, transition: paneTransition }}>
						<PrimaryCloseButton
							visible={openState.isOpen}
							label={props.closePrimaryLabel}
							onClose={props.onClosePrimary}
						/>
						{primaryNode}
					</div>
					<SplitterBar
						visible={openState.isOpen}
						isDragging={drag.isDragging}
						handleProps={drag.handleProps}
					/>
					<div className={classes.pane} style={{ width: secondaryWidth, transition: paneTransition }}>
						{openState.isOpen ? secondaryNode : null}
					</div>
				</>
			) : secondaryNode}
		</div>
	);
}


type PrimaryCloseButtonProps = {
	visible: boolean,
	label?: string,
	onClose?: () => void,
};

/**
 * Dismisses the primary pane from within it. Absent in single-pane mode, where closing the only
 * visible pane would leave nothing behind, and absent when the layout supplies no handler.
 */
function PrimaryCloseButton({ visible, label, onClose }: PrimaryCloseButtonProps): React.ReactNode {
	if (!visible || !onClose) {
		return null;
	}
	return (
		<ActionIcon
			variant='subtle'
			size='md'
			className={classes.closePrimary}
			aria-label={label}
			title={label}
			onClick={onClose}
			data-testid='splitLayout.closePrimary'
		>
			<IconX size={16} />
		</ActionIcon>
	);
}


type SplitterBarProps = {
	visible: boolean,
	isDragging: boolean,
	handleProps: React.HTMLAttributes<HTMLDivElement>,
};

function SplitterBar({ visible, isDragging, handleProps }: SplitterBarProps): React.ReactNode {
	return (
		<div
			role='separator'
			aria-orientation='vertical'
			aria-hidden={!visible}
			className={clsx(
				classes.splitter,
				!visible && classes.splitterHidden,
				isDragging && classes.splitterDragging,
			)}
			{...(visible ? handleProps : {})}
		>
			<div className={classes.handle} />
		</div>
	);
}


function useSecondaryOpenState(props: Pick<SplitLayoutProps, 'secondaryOpen' | 'onOpenChange'>) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isControlled = props.secondaryOpen !== undefined;
	const isOpen = isControlled ? !!props.secondaryOpen : uncontrolledOpen;

	const openSecondary = React.useCallback(() => {
		if (!isControlled) setUncontrolledOpen(true);
		props.onOpenChange?.(true);
	}, [isControlled, props.onOpenChange]);

	const closeSecondary = React.useCallback(() => {
		if (!isControlled) setUncontrolledOpen(false);
		props.onOpenChange?.(false);
	}, [isControlled, props.onOpenChange]);

	return { isOpen, openSecondary, closeSecondary };
}


type UseSplitterDragParams = {
	containerRef: React.RefObject<HTMLDivElement | null>,
	initialRatio: number,
	minRatio: number,
	maxRatio: number,
};

function useSplitterDrag(params: UseSplitterDragParams) {
	const { containerRef, initialRatio, minRatio, maxRatio } = params;
	const [ratio, setRatio] = React.useState(initialRatio);
	const [isDragging, setIsDragging] = React.useState(false);

	const onPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		setIsDragging(true);
	}, []);

	const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
		if (!isDragging || !containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		if (rect.width <= 0) return;
		const next = (event.clientX - rect.left) / rect.width;
		setRatio(Math.max(minRatio, Math.min(maxRatio, next)));
	}, [containerRef, isDragging, minRatio, maxRatio]);

	const onPointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		setIsDragging(false);
	}, []);

	const handleProps: React.HTMLAttributes<HTMLDivElement> = {
		onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp,
	};
	return { ratio, isDragging, handleProps };
}
