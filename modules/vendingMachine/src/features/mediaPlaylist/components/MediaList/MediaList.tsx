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
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Image,
	Modal,
	NumberInput,
	Select,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconEdit, IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ObjectFit, normalizePlaylistObjectFit, type PlaylistMediaRow } from '../../types';
import { MediaPreview } from '../MediaPreview';


const MAX_PRESENTATION_DURATION_SEC = 300; // 5 minutes

export interface MediaListProps {
	maxHeight?: number;
	media: PlaylistMediaRow[];
	onAddMedia: () => void;
	onRemoveMedia: (mediaId: string) => void;
	onMediaChange: (items: PlaylistMediaRow[]) => void;
	/** When true, list is display-only (no add, reorder, edit, or remove). */
	readOnly?: boolean;
}

const formatDuration = (seconds?: number) => {
	if (seconds === undefined || seconds === null) return '-';
	const s = Math.round(seconds);
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const sortByPlayOrder = (rows: PlaylistMediaRow[]) =>
	[...rows].sort((a, b) => a.order - b.order);

const renumberOrders = (rows: PlaylistMediaRow[]) =>
	rows.map((row, index) => ({ ...row, order: index + 1 }));

interface SortableMediaRowProps {
	item: PlaylistMediaRow;
	onPreview: (row: PlaylistMediaRow) => void;
	onEdit: (row: PlaylistMediaRow) => void;
	onRemove: (id: string) => void;
	translate: (key: string) => string;
	readOnly?: boolean;
}

function ReadOnlyMediaRow({
	item,
	translate,
}: Pick<SortableMediaRowProps, 'item' | 'translate'>) {
	return (
		<Table.Tr>
			<Table.Td style={{ width: 44 }} />
			<Table.Td>
				<Text size='xs' c='dimmed'>
					{item.order}
				</Text>
			</Table.Td>
			<Table.Td>
				<MediaPreview media={item} size='sm' />
			</Table.Td>
			<Table.Td>
				<Text size='sm'>{item.name}</Text>
			</Table.Td>
			<Table.Td>
				<Badge color={item.type === 'image' ? 'blue' : 'red'} size='sm'>
					{item.type === 'image'
						? translate('nikki.vendingMachine.mediaPlaylist.media.type.image')
						: translate('nikki.vendingMachine.mediaPlaylist.media.type.video')}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Text size='sm'>{formatDuration(item.durationSec)}</Text>
			</Table.Td>
			<Table.Td style={{ width: 100 }} />
		</Table.Tr>
	);
}

function SortableMediaRow({
	item,
	onEdit,
	onRemove,
	translate,
	readOnly,
}: SortableMediaRowProps) {
	if (readOnly) {
		return <ReadOnlyMediaRow item={item} translate={translate} />;
	}
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.85 : 1,
	};

	return (
		<Table.Tr ref={setNodeRef} style={style}>
			<Table.Td style={{ width: 44 }}>
				<div
					{...attributes}
					{...listeners}
					style={{ cursor: 'grab', touchAction: 'none' }}
					aria-label={translate('nikki.vendingMachine.mediaPlaylist.media.drag_hint')}
				>
					<IconGripVertical size={18} />
				</div>
			</Table.Td>
			<Table.Td>
				<Text size='xs' c='dimmed'>
					{item.order}
				</Text>
			</Table.Td>
			<Table.Td>
				<MediaPreview media={item} size='sm' onClick={() => onEdit(item)} />
			</Table.Td>
			<Table.Td>
				<Text size='sm'>{item.name}</Text>
			</Table.Td>
			<Table.Td>
				<Badge color={item.type === 'image' ? 'blue' : 'red'} size='sm'>
					{item.type === 'image'
						? translate('nikki.vendingMachine.mediaPlaylist.media.type.image')
						: translate('nikki.vendingMachine.mediaPlaylist.media.type.video')}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Text size='sm'>{formatDuration(item.durationSec)}</Text>
			</Table.Td>
			<Table.Td style={{ width: 100 }}>
				<Group gap={4} wrap='nowrap'>
					<Tooltip label={translate('nikki.vendingMachine.mediaPlaylist.media.edit')}>
						<ActionIcon variant='subtle' size='sm' onClick={() => onEdit(item)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onRemove(item.id)}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}

function MediaModalPreviewPane({ media, fit }: { media: PlaylistMediaRow; fit: ObjectFit }) {
	return (
		<Stack gap='xs' align='center'>
			{media.type === 'image' ? (
				<Image src={media.url} alt={media.name} fit={fit} mah={300} w='100%' />
			) : (
				<video
					src={media.url}
					controls
					style={{
						width: '100%',
						maxHeight: 300,
						borderRadius: 8,
						objectFit: fit,
					}}
				/>
			)}
			<Text size='sm' c='dimmed' ta='center'>
				{media.name}
			</Text>
		</Stack>
	);
}

interface MediaPreviewEditModalProps {
	opened: boolean;
	onClose: () => void;
	media: PlaylistMediaRow | null;
	listLength: number;
	onSave: (id: string, durationSec: number, playOrder: number, objectFit: ObjectFit) => void;
	labels: {
		title: string;
		duration: string;
		playOrder: string;
		objectFit: string;
		save: string;
		cancel: string;
	};
}

function MediaPreviewEditModal({
	opened,
	onClose,
	media,
	listLength,
	onSave,
	labels,
}: MediaPreviewEditModalProps) {
	const { t: translate } = useTranslation();
	const [duration, setDuration] = useState<number | string>(0);
	const [playOrder, setPlayOrder] = useState<number | string>(1);
	const [objectFit, setObjectFit] = useState<ObjectFit>(normalizePlaylistObjectFit(media?.objectFit));

	const objectFitOptions = useMemo(
		() =>
			Object.values(ObjectFit).map((v) => ({
				value: v,
				label: translate(`nikki.vendingMachine.mediaPlaylist.media.object_fit_option.${v}`),
			})),
		[translate],
	);

	useEffect(() => {
		if (!media) return;
		setDuration(media.durationSec ?? 0);
		setPlayOrder(media.order);
		setObjectFit(normalizePlaylistObjectFit(media.objectFit));
	}, [media]);

	const handleSubmit = () => {
		if (!media) return;
		const dur = typeof duration === 'string' ? Number(duration) : duration;
		const ord = typeof playOrder === 'string' ? Number(playOrder) : playOrder;
		const safeDur = Number.isFinite(dur) && dur >= 0 ? dur : 0;
		const safeOrd =
			Number.isFinite(ord) ? Math.min(Math.max(1, Math.floor(ord)), listLength) : 1;
		onSave(media.id, safeDur, safeOrd, objectFit);
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={labels.title} size='lg' centered>
			{media && (
				<Stack gap='sm'>
					<MediaModalPreviewPane media={media} fit={objectFit} />
					<Divider label={translate('nikki.vendingMachine.mediaPlaylist.media.edit')} labelPosition='center' />
					<NumberInput
						label={labels.duration}
						min={0}
						max={MAX_PRESENTATION_DURATION_SEC}
						value={duration}
						onChange={setDuration}
					/>
					<NumberInput
						label={labels.playOrder}
						min={1}
						max={Math.max(1, listLength)}
						value={playOrder}
						onChange={setPlayOrder}
					/>
					<Select
						label={labels.objectFit}
						data={objectFitOptions}
						value={objectFit}
						onChange={(v) => v && setObjectFit(v as ObjectFit)}
						clearable={false}
					/>
					<Group justify='flex-end' mt='sm'>
						<Button variant='default' onClick={onClose}>
							{labels.cancel}
						</Button>
						<Button onClick={handleSubmit}>{labels.save}</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
}

// eslint-disable-next-line max-lines-per-function -- table + DnD + modals
export const MediaList: React.FC<MediaListProps> = ({
	media,
	maxHeight,
	onAddMedia,
	onRemoveMedia,
	onMediaChange,
	readOnly = false,
}) => {
	const { t: translate } = useTranslation();
	const [detailRow, setDetailRow] = useState<PlaylistMediaRow | null>(null);

	const sortedMedia = useMemo(() => sortByPlayOrder(media), [media]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const ordered = sortByPlayOrder(media);
		const oldIndex = ordered.findIndex(i => i.id === active.id);
		const newIndex = ordered.findIndex(i => i.id === over.id);
		if (oldIndex < 0 || newIndex < 0) return;
		const moved = arrayMove(ordered, oldIndex, newIndex);
		onMediaChange(renumberOrders(moved));
	};

	const handleEditSave = (id: string, durationSec: number, playOrder: number, objectFit: ObjectFit) => {
		const ordered = sortByPlayOrder(media);
		const curIdx = ordered.findIndex(r => r.id === id);
		if (curIdx < 0) return;
		const newIndex = Math.min(Math.max(0, playOrder - 1), ordered.length - 1);
		const withDuration = ordered.map(r =>
			r.id === id ? { ...r, durationSec, objectFit } : r,
		);
		const moved = arrayMove(withDuration, curIdx, newIndex);
		onMediaChange(renumberOrders(moved));
	};

	const editLabels = {
		title: translate('nikki.vendingMachine.mediaPlaylist.media.edit_modal_title'),
		duration: translate('nikki.vendingMachine.mediaPlaylist.media.fields.duration'),
		playOrder: translate('nikki.vendingMachine.mediaPlaylist.media.play_order'),
		objectFit: translate('nikki.vendingMachine.mediaPlaylist.media.fields.object_fit'),
		save: translate('nikki.general.actions.save'),
		cancel: translate('nikki.general.actions.cancel'),
	};

	if (media.length === 0) {
		return (
			<Stack gap='md'>
				<Group justify='space-between'>
					<Text size='sm' fw={500}>
						{translate('nikki.vendingMachine.mediaPlaylist.media.title')}
					</Text>
					{!readOnly ? (
						<Button size='xs' leftSection={<IconPlus size={16} />} onClick={onAddMedia}>
							{translate('nikki.vendingMachine.mediaPlaylist.media.add')}
						</Button>
					) : null}
				</Group>
				<Text size='sm' c='dimmed' ta='center' py='xl'>
					{translate('nikki.vendingMachine.mediaPlaylist.media.empty')}
				</Text>
			</Stack>
		);
	}

	const tableBody = (
		<Table>
			<Table.Tbody>
				{sortedMedia.map(item => (
					<SortableMediaRow
						key={item.id}
						item={item}
						onPreview={setDetailRow}
						onEdit={setDetailRow}
						onRemove={onRemoveMedia}
						translate={translate}
						readOnly={readOnly}
					/>
				))}
			</Table.Tbody>
		</Table>
	);

	return (
		<>
			<Stack gap='md'>
				<Group justify='space-between'>
					<Text size='sm' fw={500}>
						{translate('nikki.vendingMachine.mediaPlaylist.media.title')} ({media.length})
					</Text>
					{!readOnly ? (
						<Button size='xs' leftSection={<IconPlus size={16} />} onClick={onAddMedia}>
							{translate('nikki.vendingMachine.mediaPlaylist.media.add')}
						</Button>
					) : null}
				</Group>

				<Box style={{ maxHeight: maxHeight ?? 'auto', overflowY: 'auto' }}>
					{readOnly ? (
						tableBody
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={sortedMedia.map(i => i.id)}
								strategy={verticalListSortingStrategy}
							>
								{tableBody}
							</SortableContext>
						</DndContext>
					)}
				</Box>
			</Stack>

			{!readOnly ? (
				<MediaPreviewEditModal
					opened={detailRow !== null}
					onClose={() => setDetailRow(null)}
					media={detailRow}
					listLength={sortedMedia.length}
					onSave={handleEditSave}
					labels={editLabels}
				/>
			) : null}
		</>
	);
};
