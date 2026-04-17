import { Box, Image } from '@mantine/core';
import { IconPhoto, IconVideo } from '@tabler/icons-react';
import React, { useEffect, useRef, type CSSProperties } from 'react';

import { normalizePlaylistObjectFit, type PlaylistMediaRow } from '../../types';


export interface MediaPreviewProps {
	media: PlaylistMediaRow;
	size?: 'sm' | 'md' | 'lg';
	onClick?: () => void;
}

const sizeMap = {
	sm: { width: 80, height: 60 },
	md: { width: 150, height: 100 },
	lg: { width: 200, height: 150 },
};

const formatDuration = (seconds?: number) => {
	if (seconds === undefined || seconds === null) return '';
	const s = Math.round(seconds);
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/** Stream URL không phải ảnh — dùng video tĩnh (khung đầu) làm thumbnail. */
function VideoStreamThumbnail({
	src,
	label,
	fitMode,
}: {
	src: string;
	label: string;
	fitMode: CSSProperties['objectFit'];
}) {
	const ref = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const seekFirstFrame = () => {
			if (el.readyState < 2) return;
			const dur = Number.isFinite(el.duration) ? el.duration : 0;
			const t = dur > 0 ? Math.min(0.05, dur * 0.01) : 0.05;
			el.currentTime = t;
		};
		el.addEventListener('loadeddata', seekFirstFrame);
		return () => el.removeEventListener('loadeddata', seekFirstFrame);
	}, [src]);

	return (
		<video
			ref={ref}
			src={src}
			muted
			playsInline
			preload='metadata'
			aria-label={label}
			tabIndex={-1}
			style={{
				width: '100%',
				height: '100%',
				objectFit: fitMode,
				display: 'block',
				pointerEvents: 'none',
			}}
		/>
	);
}

function VideoDurationBadge({ sec }: { sec: number }) {
	return (
		<Box
			style={{
				position: 'absolute',
				bottom: 4,
				right: 4,
				backgroundColor: 'rgba(0,0,0,0.7)',
				color: 'white',
				padding: '2px 6px',
				borderRadius: 4,
				fontSize: 10,
				fontWeight: 500,
			}}
		>
			{formatDuration(sec)}
		</Box>
	);
}

function CornerTypeBadge({ kind }: { kind: 'image' | 'video' }) {
	return (
		<Box
			style={{
				position: 'absolute',
				top: 4,
				left: 4,
				backgroundColor: 'rgba(0,0,0,0.6)',
				color: 'white',
				padding: '2px 6px',
				borderRadius: 4,
				display: 'flex',
				alignItems: 'center',
				gap: 4,
			}}
		>
			{kind === 'image' ? <IconPhoto size={12} /> : <IconVideo size={12} />}
		</Box>
	);
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media, size = 'md', onClick }) => {
	const dimensions = sizeMap[size];
	const fit = normalizePlaylistObjectFit(media.objectFit);

	return (
		<Box
			onClick={onClick}
			style={{
				cursor: onClick ? 'pointer' : 'default',
				position: 'relative',
				width: dimensions.width,
				height: dimensions.height,
				borderRadius: 8,
				overflow: 'hidden',
				border: '1px solid #ddd',
				backgroundColor: '#f5f5f5',
			}}
		>
			{media.type === 'image' ? (
				<Image
					src={media.url}
					alt={media.name}
					fit={fit}
					style={{
						width: '100%',
						height: '100%',
					}}
				/>
			) : (
				<>
					{media.thumbnailUrl ? (
						<Image
							src={media.thumbnailUrl}
							alt={media.name}
							fit={fit}
							style={{
								width: '100%',
								height: '100%',
							}}
						/>
					) : (
						<VideoStreamThumbnail src={media.url} label={media.name} fitMode={fit} />
					)}
					{media.durationSec != null && <VideoDurationBadge sec={media.durationSec} />}
				</>
			)}
			<CornerTypeBadge kind={media.type} />
		</Box>
	);
};
