import { Badge, MantineColor } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export type StatusConfig = {
	color: MantineColor;
	translationKey: string;
};

interface StatusBadgeProps {
	value: string;
	configMap: Record<string, StatusConfig>;
	variant?: 'filled' | 'light' | 'outline' | 'dot';
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
	value,
	configMap,
	variant = 'light',
	size = 'sm',
}) => {
	const { t } = useTranslation();
	const config = configMap[value] || { color: 'gray', translationKey: value };

	return (
		<Badge color={config.color} variant={variant} size={size}>
			{t(config.translationKey)}
		</Badge>
	);
};
