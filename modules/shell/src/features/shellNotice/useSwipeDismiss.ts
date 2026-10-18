import React from 'react';


export type SwipeOutcome = 'dismiss' | 'reset';

/** Movement before a press becomes a swipe, so link clicks and vertical scrolling still work. */
export const SWIPE_START_PX = 8;
export const SWIPE_DISMISS_RATIO = 0.35;
export const SWIPE_FLICK_PX_PER_MS = 0.5;
/** Matches the card's CSS transition, so the card slides out before it unmounts. */
export const SWIPE_LEAVE_MS = 180;

export function resolveSwipe(deltaX: number, width: number, velocity: number): SwipeOutcome {
	if (width > 0 && Math.abs(deltaX) >= width * SWIPE_DISMISS_RATIO) return 'dismiss';
	if (Math.abs(deltaX) >= SWIPE_START_PX * 3 && velocity >= SWIPE_FLICK_PX_PER_MS) return 'dismiss';
	return 'reset';
}

type Gesture = {
	pointerId: number,
	startX: number,
	startY: number,
	startedAt: number,
	dragging: boolean,
};

type SwipeContext = {
	gesture: React.RefObject<Gesture | null>,
	suppressClick: React.RefObject<boolean>,
	setOffsetX: (offset: number) => void,
	setIsDragging: (dragging: boolean) => void,
	setIsLeaving: (leaving: boolean) => void,
};

type PointerHandler = (event: React.PointerEvent<HTMLElement>) => void;

export type SwipeDismissState = {
	offsetX: number,
	isDragging: boolean,
	isLeaving: boolean,
	handlers: {
		onPointerDown: PointerHandler,
		onPointerMove: PointerHandler,
		onPointerUp: PointerHandler,
		onPointerCancel: PointerHandler,
		onClickCapture: (event: React.MouseEvent<HTMLElement>) => void,
	},
};

/** Horizontal swipe in either direction; past the threshold the card slides out, then `onDismiss` runs. */
export function useSwipeDismiss(enabled: boolean, onDismiss: () => void): SwipeDismissState {
	const gesture = React.useRef<Gesture | null>(null);
	const suppressClick = React.useRef(false);
	const [offsetX, setOffsetX] = React.useState(0);
	const [isDragging, setIsDragging] = React.useState(false);
	const [isLeaving, setIsLeaving] = React.useState(false);
	const ctx: SwipeContext = { gesture, suppressClick, setOffsetX, setIsDragging, setIsLeaving };

	React.useEffect(() => {
		if (!isLeaving) return;
		const handle = setTimeout(onDismiss, SWIPE_LEAVE_MS);
		return () => clearTimeout(handle);
	}, [isLeaving, onDismiss]);

	const handlers: SwipeDismissState['handlers'] = {
		onPointerDown: event => enabled && !isLeaving && startGesture(event, ctx),
		onPointerMove: event => trackGesture(event, ctx),
		onPointerUp: event => finishGesture(event, ctx),
		onPointerCancel: event => finishGesture(event, ctx),
		onClickCapture: event => swallowClickAfterDrag(event, ctx),
	};
	return { offsetX, isDragging, isLeaving, handlers };
}

function startGesture(event: React.PointerEvent<HTMLElement>, ctx: SwipeContext): void {
	if (event.button !== 0) return;
	ctx.gesture.current = {
		pointerId: event.pointerId,
		startX: event.clientX,
		startY: event.clientY,
		startedAt: event.timeStamp,
		dragging: false,
	};
}

function trackGesture(event: React.PointerEvent<HTMLElement>, ctx: SwipeContext): void {
	const current = ctx.gesture.current;
	if (!current || current.pointerId !== event.pointerId) return;
	const deltaX = event.clientX - current.startX;
	const deltaY = event.clientY - current.startY;

	if (!current.dragging) {
		if (Math.abs(deltaY) > SWIPE_START_PX && Math.abs(deltaY) > Math.abs(deltaX)) {
			ctx.gesture.current = null;
			return;
		}
		if (Math.abs(deltaX) <= SWIPE_START_PX) return;
		current.dragging = true;
		ctx.setIsDragging(true);
		event.currentTarget.setPointerCapture(event.pointerId);
	}
	ctx.setOffsetX(deltaX);
}

function finishGesture(event: React.PointerEvent<HTMLElement>, ctx: SwipeContext): void {
	const current = ctx.gesture.current;
	ctx.gesture.current = null;
	ctx.setIsDragging(false);
	if (!current?.dragging) return;

	ctx.suppressClick.current = true;
	const deltaX = event.clientX - current.startX;
	const width = event.currentTarget.offsetWidth;
	const velocity = Math.abs(deltaX) / Math.max(1, event.timeStamp - current.startedAt);
	if (event.type === 'pointerup' && resolveSwipe(deltaX, width, velocity) === 'dismiss') {
		ctx.setOffsetX(Math.sign(deltaX) * width * 1.2);
		ctx.setIsLeaving(true);
		return;
	}
	ctx.setOffsetX(0);
}

/** A drag that ends over a link inside the message must not also follow it. */
function swallowClickAfterDrag(event: React.MouseEvent<HTMLElement>, ctx: SwipeContext): void {
	if (!ctx.suppressClick.current) return;
	ctx.suppressClick.current = false;
	event.preventDefault();
	event.stopPropagation();
}
