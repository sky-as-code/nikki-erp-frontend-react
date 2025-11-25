import { Badge, Group, MantineColor, Text } from '@mantine/core';
import React from 'react';


export interface TextBadgeItem {
	id: string;
	name: string;
	[key: string]: any;
}

interface TextBadgeProps<T extends TextBadgeItem = TextBadgeItem> {
	items?: T[];
	emptyText?: string;
	color?: MantineColor;
	variant?: 'filled' | 'light' | 'outline' | 'dot' | 'default';
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	renderLabel?: (item: T) => string;
	getColor?: (item: T) => MantineColor;
}

export const TextBadge = <T extends TextBadgeItem = TextBadgeItem>({
	items,
	emptyText = '-',
	color = 'blue',
	variant = 'light',
	size = 'sm',
	gap = 'xs',
	renderLabel,
	getColor,
}: TextBadgeProps<T>): React.ReactElement => {
	if (!items || items.length === 0) {
		return <Text size='sm' c='dimmed'>{emptyText}</Text>;
	}

	return (
		<Group gap={gap}>
			{items.map((item) => {
				const label = renderLabel ? renderLabel(item) : item.name;
				const badgeColor = getColor ? getColor(item) : color;

				return (
					<Badge key={item.id} variant={variant} size={size} color={badgeColor}>
						{label}
					</Badge>
				);
			})}
		</Group>
	);
};