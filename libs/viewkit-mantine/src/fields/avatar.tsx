import { Avatar } from '@mantine/core';
import React from 'react';
import { z } from 'zod';

import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export const avatarSpecSchema = z.object({ renderer: z.literal('avatar') }).strict();

export class AvatarFieldRenderer implements IFieldRenderer {
	public render(rawValue: string, _: string): React.ReactNode {
		return <Avatar src={rawValue || undefined} size='lg' radius='md' />;
	}
}
