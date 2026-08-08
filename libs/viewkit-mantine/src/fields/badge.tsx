import { Badge } from '@mantine/core';
import React from 'react';
import { z } from 'zod';

import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export const badgeSpecSchema = z.object({
	renderer: z.literal('badge'),
	colorMap: z.record(z.string(), z.string()).default({}),
	prefix: z.string().optional(),
}).strict();

export type BadgeFieldRendererProps = {
	colorMap: Record<string, string>,
	translationKey?: (value: string) => string,
};

export class BadgeFieldRenderer implements IFieldRenderer {
	private readonly colorMap: Record<string, string>;
	public readonly translationKey?: (value: string) => string;

	constructor(props: BadgeFieldRendererProps) {
		this.colorMap = props.colorMap;
		this.translationKey = props.translationKey;
	}

	public render(rawValue: string, translatedValue: string): React.ReactNode {
		return <Badge variant='filled' color={this.colorMap[rawValue]}>{translatedValue}</Badge>;
	}
}
