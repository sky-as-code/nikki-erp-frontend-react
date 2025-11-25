import { Avatar, FileButton, Stack, Text, ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import React, { useState, useEffect } from 'react';


interface AvatarProfileProps {
	avatarUrl?: string | null;
	displayName: string;
	onAvatarChange?: (file: File | null) => void;
	disabled?: boolean;
	size?: number;
}

export const AvatarProfile: React.FC<AvatarProfileProps> = ({
	avatarUrl,
	displayName,
	onAvatarChange,
	disabled = false,
	size = 120,
}) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isHovered, setIsHovered] = useState(false);

	const fallback = displayName?.trim()
		? displayName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')[0].toUpperCase()
		: '?';

	const handleFileChange = (file: File | null) => {
		if (file && file.size <= 5 * 1024 * 1024) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			onAvatarChange?.(file);
		}
	};

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	return (
		<Stack gap='xs' align='center'>
			<Box
				pos='relative'
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Avatar
					src={previewUrl || avatarUrl}
					size={size}
					radius='xl'
					style={{
						border: '4px solid var(--mantine-color-gray-2)',
						transition: 'all 0.2s ease',
						boxShadow: isHovered && !disabled
							? '0 8px 16px rgba(0, 0, 0, 0.15)'
							: '0 2px 8px rgba(0, 0, 0, 0.1)',
					}}
				>
					{fallback}
				</Avatar>

				{!disabled && (
					<Box pos='absolute' bottom={-8} right={-8}>
						<Tooltip label='Upload new avatar' position='right' withArrow>
							<FileButton
								onChange={handleFileChange}
								accept='image/png,image/jpeg,image/jpg,image/webp'
							>
								{(props) => (
									<ActionIcon
										{...props}
										variant='filled'
										color='blue'
										size='lg'
										radius='xl'
										style={{
											boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
											transition: 'transform 0.2s ease',
										}}
										onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
										onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
									>
										<IconCamera size={18} />
									</ActionIcon>
								)}
							</FileButton>
						</Tooltip>
					</Box>
				)}
			</Box>

			<Text size='sm' fw={500} c='dimmed'>
				{displayName}
			</Text>
		</Stack>
	);
};
