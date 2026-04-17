import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Group, Progress, Select, Text, Tooltip } from '@mantine/core';
import { IconGripVertical, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PlaylistMediaRow } from '../../types';


export type TrialPlaybackState = {
	trialPlaying: boolean;
	elapsedSec: number;
	/** Clip đang phát theo thứ tự playlist; `null` khi không chạy thử hoặc không có media. */
	currentItem: PlaylistMediaRow | null;
};

export interface PlaylistDurationTimelineProps {
	previewLayout: 'vertical' | 'horizontal';
	setPreviewLayout: (layout: 'vertical' | 'horizontal') => void;
	media: PlaylistMediaRow[];
	onMediaChange: (items: PlaylistMediaRow[]) => void;
	/** Đồng bộ xem trước (vertical/horizontal) với thời điểm phát thử. */
	onTrialPlaybackChange?: (state: TrialPlaybackState) => void;
	/** When true, timeline blocks cannot be reordered or resized (view / trial playback only). */
	readOnly?: boolean;
}

const MIN_DURATION_SEC = 1;
/** Kéo ngang hết track ≈ thêm/bớt chừng này giây cho đúng một clip (không đụng clip khác). */
const REFERENCE_SECONDS_PER_TRACK = 120;
const TIMELINE_MIN_WIDTH_PX = 320;
const TIMELINE_MAX_WIDTH_PX = 1920;
const SECONDS_PER_PX_WIDTH = 6;

const sortByPlayOrder = (rows: PlaylistMediaRow[]) =>
	[...rows].sort((a, b) => a.order - b.order);

const renumberOrders = (rows: PlaylistMediaRow[]) =>
	rows.map((row, index) => ({ ...row, order: index + 1 }));

const effectiveDur = (sec?: number) => Math.max(sec ?? 0, MIN_DURATION_SEC);

const sumEffectiveDurations = (items: PlaylistMediaRow[]) =>
	items.reduce((sum, row) => sum + effectiveDur(row.durationSec), 0);

const formatSec = (sec?: number) => {
	if (sec === undefined || sec === null) return '0:00';
	const s = Math.round(sec);
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function activeSegmentIndex(elapsedSec: number, items: PlaylistMediaRow[]): number {
	let acc = 0;
	const sorted = sortByPlayOrder(items);
	for (let i = 0; i < sorted.length; i++) {
		const d = effectiveDur(sorted[i].durationSec);
		if (elapsedSec < acc + d) return i;
		acc += d;
	}
	return Math.max(0, sorted.length - 1);
}

type ResizeSession = {
	initialX: number;
	index: number;
	trackW: number;
	snapshot: PlaylistMediaRow[];
	initialDuration: number;
};

interface SortableBlockProps {
	item: PlaylistMediaRow;
	weight: number;
	index: number;
	trialActive: boolean;
	onResizePointerDown: (e: React.PointerEvent, index: number) => void;
	translate: (key: string, options?: Record<string, unknown>) => string;
}

function SortableTimelineBlock({
	item,
	weight,
	index,
	trialActive,
	onResizePointerDown,
	translate,
}: SortableBlockProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const mergedStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		flexGrow: Math.max(weight, 0.01),
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 48,
		opacity: isDragging ? 0.88 : 1,
		border: trialActive
			? '2px solid var(--mantine-color-blue-filled)'
			: '1px solid var(--mantine-color-gray-4)',
		borderRadius: 6,
		overflow: 'hidden',
	};

	return (
		<Box ref={setNodeRef} display='flex' bg='var(--mantine-color-gray-1)' style={mergedStyle}>
			<Box
				{...attributes}
				{...listeners}
				flex={1}
				p={6}
				style={{ cursor: 'grab', touchAction: 'none', minWidth: 0 }}
			>
				<Group gap={4} wrap='nowrap' align='flex-start'>
					<IconGripVertical size={14} style={{ flexShrink: 0, marginTop: 2 }} />
					<Box style={{ minWidth: 0 }}>
						<Text size='xs' fw={600} lineClamp={1}>
							{item.order}. {item.name}
						</Text>
						<Text size='xs' c='dimmed'>{formatSec(item.durationSec)}</Text>
					</Box>
				</Group>
			</Box>
			<Tooltip
				label={translate('nikki.vendingMachine.mediaPlaylist.media.timeline.resize_hint')}
				position='top'
			>
				<Box
					onPointerDown={e => onResizePointerDown(e, index)}
					w={10}
					style={{
						cursor: 'ew-resize',
						touchAction: 'none',
						background: 'var(--mantine-color-gray-4)',
						flexShrink: 0,
					}}
					aria-label={translate('nikki.vendingMachine.mediaPlaylist.media.timeline.resize_hint')}
				/>
			</Tooltip>
		</Box>
	);
}

function StaticTimelineBlock({
	item,
	weight,
	trialActive,
}: {
	item: PlaylistMediaRow;
	weight: number;
	trialActive: boolean;
}) {
	const mergedStyle: React.CSSProperties = {
		flexGrow: Math.max(weight, 0.01),
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 48,
		border: trialActive
			? '2px solid var(--mantine-color-blue-filled)'
			: '1px solid var(--mantine-color-gray-4)',
		borderRadius: 6,
		overflow: 'hidden',
	};

	return (
		<Box display='flex' bg='var(--mantine-color-gray-1)' style={mergedStyle}>
			<Box flex={1} p={6} style={{ minWidth: 0 }}>
				<Group gap={4} wrap='nowrap' align='flex-start'>
					<Box style={{ minWidth: 0 }}>
						<Text size='xs' fw={600} lineClamp={1}>
							{item.order}. {item.name}
						</Text>
						<Text size='xs' c='dimmed'>{formatSec(item.durationSec)}</Text>
					</Box>
				</Group>
			</Box>
		</Box>
	);
}

function applyResize(session: ResizeSession, clientX: number): PlaylistMediaRow[] {
	const dx = clientX - session.initialX;
	const deltaSec = (dx / session.trackW) * REFERENCE_SECONDS_PER_TRACK;
	const next = session.snapshot.map(m => ({ ...m }));
	const idx = session.index;
	const newDur = Math.max(MIN_DURATION_SEC, session.initialDuration + deltaSec);
	next[idx] = { ...next[idx], durationSec: newDur };
	return renumberOrders(next);
}

// eslint-disable-next-line max-lines-per-function -- DnD + resize + trial playback
export const PlaylistDurationTimeline: React.FC<PlaylistDurationTimelineProps> = ({
	media,
	previewLayout,
	setPreviewLayout,
	onMediaChange,
	onTrialPlaybackChange,
	readOnly = false,
}) => {
	const { t: translate } = useTranslation();
	const containerRef = useRef<HTMLDivElement>(null);
	const resizeSessionRef = useRef<ResizeSession | null>(null);

	const [trialPlaying, setTrialPlaying] = useState(false);
	const [elapsedSec, setElapsedSec] = useState(0);

	const sortedMedia = useMemo(() => sortByPlayOrder(media), [media]);

	const totalSec = useMemo(
		() => Math.max(sumEffectiveDurations(sortedMedia), MIN_DURATION_SEC),
		[sortedMedia],
	);

	const totalWeight = totalSec;

	const weights = useMemo(
		() => sortedMedia.map(row => effectiveDur(row.durationSec)),
		[sortedMedia],
	);

	const _timelineWidthPx = useMemo(() => {
		const t = Math.max(sumEffectiveDurations(sortedMedia), MIN_DURATION_SEC);
		return Math.min(
			TIMELINE_MAX_WIDTH_PX,
			Math.max(TIMELINE_MIN_WIDTH_PX, t * SECONDS_PER_PX_WIDTH),
		);
	}, [sortedMedia]);

	const playingIndex = useMemo(
		() => (trialPlaying ? activeSegmentIndex(elapsedSec, media) : -1),
		[trialPlaying, elapsedSec, media],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	const totalSecRef = useRef(totalSec);
	totalSecRef.current = totalSec;

	useEffect(() => {
		if (!onTrialPlaybackChange) return;
		if (!trialPlaying) {
			onTrialPlaybackChange({ trialPlaying: false, elapsedSec: 0, currentItem: null });
			return;
		}
		const sorted = sortByPlayOrder(media);
		const idx = activeSegmentIndex(elapsedSec, media);
		const currentItem = sorted[idx] ?? null;
		onTrialPlaybackChange({ trialPlaying: true, elapsedSec, currentItem });
	}, [trialPlaying, elapsedSec, media, onTrialPlaybackChange]);

	useEffect(() => {
		if (!trialPlaying) return;
		const start = performance.now();
		const tickMs = 32;

		const step = (): boolean => {
			const elapsed = (performance.now() - start) / 1000;
			const cap = totalSecRef.current;
			if (elapsed >= cap) {
				setElapsedSec(cap);
				setTrialPlaying(false);
				return true;
			}
			setElapsedSec(elapsed);
			return false;
		};

		if (step()) return;
		const id = window.setInterval(() => {
			if (step()) window.clearInterval(id);
		}, tickMs);
		return () => window.clearInterval(id);
	}, [trialPlaying]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const ordered = sortByPlayOrder(media);
		const oldIndex = ordered.findIndex(i => i.id === active.id);
		const newIndex = ordered.findIndex(i => i.id === over.id);
		if (oldIndex < 0 || newIndex < 0) return;
		onMediaChange(renumberOrders(arrayMove(ordered, oldIndex, newIndex)));
	};

	const handleResizePointerDown = useCallback(
		(e: React.PointerEvent, index: number) => {
			e.preventDefault();
			e.stopPropagation();
			const track = containerRef.current;
			if (!track || sortedMedia.length === 0) return;
			const trackW = Math.max(track.offsetWidth, 1);
			const ordered = sortByPlayOrder(media);
			const row = ordered[index];
			resizeSessionRef.current = {
				initialX: e.clientX,
				index,
				trackW,
				snapshot: ordered.map(m => ({ ...m })),
				initialDuration: row.durationSec ?? 0,
			};

			const onMove = (ev: PointerEvent) => {
				const session = resizeSessionRef.current;
				if (!session) return;
				onMediaChange(applyResize(session, ev.clientX));
			};

			const onUp = () => {
				document.removeEventListener('pointermove', onMove);
				document.removeEventListener('pointerup', onUp);
				document.removeEventListener('pointercancel', onUp);
				resizeSessionRef.current = null;
			};

			document.addEventListener('pointermove', onMove);
			document.addEventListener('pointerup', onUp);
			document.addEventListener('pointercancel', onUp);
		},
		[media, onMediaChange, sortedMedia.length],
	);

	const startTrial = () => {
		setElapsedSec(0);
		setTrialPlaying(true);
	};

	const stopTrial = () => {
		setTrialPlaying(false);
		setElapsedSec(0);
	};

	if (media.length === 0) {
		return null;
	}

	const previewLayoutOptions = [
		{
			value: 'vertical',
			label: translate('nikki.vendingMachine.mediaPlaylist.preview.vertical'),
		},
		{
			value: 'horizontal',
			label: translate('nikki.vendingMachine.mediaPlaylist.preview.horizontal'),
		},
	];

	const progressPct = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;
	const showTrialTime = trialPlaying || elapsedSec > 0;

	return (
		// <Box style={{ width: timelineWidthPx, maxWidth: '100%' }}>
		<Box w='100%'>
			<Group justify='space-between' mb='xs' wrap='wrap'>
				<Box>
					<Select
						data={previewLayoutOptions}
						value={previewLayout}
						onChange={(v) => v && setPreviewLayout(v as 'vertical' | 'horizontal')}
						clearable={false}
						w={{ base: '100%', sm: 360 }}
						maw={420}
					/>
				</Box>
				<Group gap='xs'>
					<Text size='xs' c='dimmed'>
						{translate('nikki.vendingMachine.mediaPlaylist.media.timeline.total_duration')}:{' '}
						{formatSec(totalWeight)}
					</Text>
					{trialPlaying ? (
						<Button
							size='compact-xs'
							variant='light'
							color='red'
							leftSection={<IconPlayerStop size={14} />}
							onClick={stopTrial}
						>
							{translate('nikki.vendingMachine.mediaPlaylist.media.timeline.trial_stop')}
						</Button>
					) : (
						<Button
							size='compact-xs'
							variant='light'
							leftSection={<IconPlayerPlay size={14} />}
							onClick={startTrial}
						>
							{translate('nikki.vendingMachine.mediaPlaylist.media.timeline.trial_play')}
						</Button>
					)}
				</Group>
			</Group>

			<Box mb='sm'>
				<Progress
					value={progressPct}
					size='sm'
					transitionDuration={trialPlaying ? 80 : 0}
				/>
				{showTrialTime ? (
					<Text size='xs' c='dimmed' mt={4}>
						{translate('nikki.vendingMachine.mediaPlaylist.media.timeline.trial_position')}:{' '}
						{formatSec(elapsedSec)} / {formatSec(totalSec)}
					</Text>
				) :
					<Text size='xs' c='dimmed' mt={4}>
						{`00:00 / 00:00`}
					</Text>
				}
			</Box>

			{readOnly ? (
				<Box
					ref={containerRef}
					display='flex'
					mih={56}
					style={{ overflowX: 'auto' }}
				>
					{sortedMedia.map((item, index) => (
						<StaticTimelineBlock
							key={item.id}
							item={item}
							weight={weights[index] ?? MIN_DURATION_SEC}
							trialActive={trialPlaying && playingIndex === index}
						/>
					))}
				</Box>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={sortedMedia.map(i => i.id)}
						strategy={horizontalListSortingStrategy}
					>
						<Box
							ref={containerRef}
							display='flex'
							mih={56}
							style={{ overflowX: 'auto' }}
						>
							{sortedMedia.map((item, index) => (
								<SortableTimelineBlock
									key={item.id}
									item={item}
									weight={weights[index] ?? MIN_DURATION_SEC}
									index={index}
									trialActive={trialPlaying && playingIndex === index}
									onResizePointerDown={handleResizePointerDown}
									translate={translate}
								/>
							))}
						</Box>
					</SortableContext>
				</DndContext>
			)}
		</Box>
	);
};
