import { Avatar, Box, Group, Stack, Text } from '@mantine/core';
import React from 'react';

import { getUserInitials } from '@/features/fileShare/driveFileShareUserUtils';


export type DriveUserDisplayProps = {
	displayName: string;
	email?: string;
	avatarUrl?: string | null;
	avatarSize?: number;
	nameSize?: React.ComponentProps<typeof Text>['size'];
	nameFw?: number;
	emailSize?: React.ComponentProps<typeof Text>['size'];
};

export function DriveUserDisplay({
	displayName,
	email,
	avatarUrl,
	avatarSize = 32,
	nameSize = 'sm',
	nameFw = 500,
	emailSize = 'xs',
}: DriveUserDisplayProps): React.ReactNode {
	return (
		<Box>
			<Group gap='sm' wrap='nowrap' align='flex-start'>
				<Avatar src={avatarUrl ?? null} size={avatarSize} radius='xl'>
					{getUserInitials({ displayName, email })}
				</Avatar>
				<Stack gap={0} align='flex-start'>
					<Text size={nameSize} fw={nameFw}>
						{displayName}
					</Text>
					{email?.trim() ? (
						<Text size={emailSize} c='dimmed'>
							{email}
						</Text>
					) : null}
				</Stack>
			</Group>
		</Box>
	);
}
