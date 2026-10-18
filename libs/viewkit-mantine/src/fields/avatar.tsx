import { Avatar } from '@mantine/core';
import React from 'react';
import { z } from 'zod';

import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export const avatarSpecSchema = z.object({
	renderer: z.literal('avatar'),
	/**
	 * A sibling field of the row holding the preferred image URL, e.g. the `avatar_file_url` the
	 * server presigns from an uploaded file. The column's own value is the fallback when the row has
	 * none, and Mantine's placeholder is the fallback after that, also when an image fails to load.
	 */
	urlField: z.string().min(1).optional(),
}).strict();

export type AvatarSpec = z.infer<typeof avatarSpecSchema>;

export class AvatarFieldRenderer implements IFieldRenderer {
	public constructor(private readonly urlField?: string) {}

	public render(rawValue: string, _: string): React.ReactNode {
		return renderAvatar(rawValue);
	}

	public renderRaw(rawValue: unknown, _textValue: string, record?: Record<string, unknown>): React.ReactNode {
		return renderAvatar(pickAvatarSrc(this.urlField, rawValue, record));
	}
}

/** The row's preferred URL when it has one, else the column's own value. */
export function pickAvatarSrc(
	urlField: string | undefined, rawValue: unknown, record?: Record<string, unknown>,
): string | undefined {
	const preferred = urlField ? record?.[urlField] : undefined;
	return nonEmptyString(preferred) ?? nonEmptyString(rawValue);
}

function nonEmptyString(value: unknown): string | undefined {
	return typeof value === 'string' && value !== '' ? value : undefined;
}

// Inline, not Mantine's block `div`: a table cell wraps the photo in an inline link, and a block
// child would stretch that link across the whole cell width.
function renderAvatar(src: string | undefined): React.ReactNode {
	return (
		<Avatar
			component='span'
			src={src || undefined}
			size='lg'
			radius='md'
			style={{ display: 'inline-flex', verticalAlign: 'middle' }}
		/>
	);
}
