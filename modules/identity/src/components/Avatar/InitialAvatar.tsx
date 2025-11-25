import { Avatar } from '@mantine/core';
import React from 'react';


interface InitialAvatarProps {
	avatarUrl?: string | null;
	displayName: string;
	size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const InitialAvatar: React.FC<InitialAvatarProps> = ({
	avatarUrl,
	displayName,
	size = 'lg',
}) => {
	const fallback = displayName?.trim()
		? displayName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')[0].toUpperCase()
		: '?';

	return (
		<Avatar src={avatarUrl} size={size} radius='xl' >
			{fallback}
		</Avatar>
	);
};