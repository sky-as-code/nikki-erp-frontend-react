

import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';


export interface SoundItem {
	id: string;
	title: string;
	duration?: number;
}

interface PlaylistDnDProps {
	value: SoundItem[];
	onChange: (items: SoundItem[]) => void;
}

export function PlaylistDnD({ value, onChange }: PlaylistDnDProps) {
	const sensors = useSensors(useSensor(PointerSensor));

	function handleDragEnd(event: any) {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = value.findIndex(i => i.id === active.id);
		const newIndex = value.findIndex(i => i.id === over.id);

		const newList = arrayMove(value, oldIndex, newIndex);
		onChange(newList);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={value.map(i => i.id)}
				strategy={verticalListSortingStrategy}
			>
				<div>
					{value.map(item => (
						<SortableItem key={item.id} item={item} />
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}



function SortableItem({ item }: { item: SoundItem }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='flex items-center gap-2 p-3 border rounded mb-2 bg-white'
		>
			{/* Drag handle */}
			<div
				{...attributes}
				{...listeners}
				className='cursor-grab px-2'
			>
				☰
			</div>

			{/* Content */}
			<div className='flex-1'>
				<div>{item.title}</div>
				{item.duration && (
					<small>{item.duration}s</small>
				)}
			</div>
		</div>
	);
}

export const MediaListPage: React.FC = () => {
	const [playlist, setPlaylist] = useState<SoundItem[]>([
		{ id: '1', title: 'Sound A' },
		{ id: '2', title: 'Sound B' },
		{ id: '3', title: 'Sound C' },
	]);

	return (
		<PlaylistDnD value={playlist} onChange={setPlaylist} />
	);
};