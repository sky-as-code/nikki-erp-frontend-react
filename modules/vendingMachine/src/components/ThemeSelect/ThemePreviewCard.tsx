/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Box, Card, Group, Stack, Text } from '@mantine/core';
import { IconPalette, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Theme } from '@/features/themes/types';


export interface ThemePreviewCardProps {
	theme: Theme;
	onRemove?: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ theme, onRemove }) => {
	const { t: translate } = useTranslation();

	const productCardStyleOptions = [
		{ value: 'default', label: translate('nikki.vendingMachine.themes.productCardStyle.default') },
		{ value: 'rounded', label: translate('nikki.vendingMachine.themes.productCardStyle.rounded') },
		{ value: 'minimal', label: translate('nikki.vendingMachine.themes.productCardStyle.minimal') },
		{ value: 'elegant', label: translate('nikki.vendingMachine.themes.productCardStyle.elegant') },
		{ value: 'modern', label: translate('nikki.vendingMachine.themes.productCardStyle.modern') },
	];

	const appBackgroundOptions = [
		{ value: 'none', label: translate('nikki.vendingMachine.themes.appBackground.none') },
		{ value: 'snow', label: translate('nikki.vendingMachine.themes.appBackground.snow') },
		{ value: 'fireworks', label: translate('nikki.vendingMachine.themes.appBackground.fireworks') },
		{ value: 'particles', label: translate('nikki.vendingMachine.themes.appBackground.particles') },
		{ value: 'gradient', label: translate('nikki.vendingMachine.themes.appBackground.gradient') },
		{ value: 'custom', label: translate('nikki.vendingMachine.themes.appBackground.custom') },
	];

	const fontStyleOptions = [
		{ value: 'default', label: translate('nikki.vendingMachine.themes.fontStyle.default') },
		{ value: 'roboto', label: translate('nikki.vendingMachine.themes.fontStyle.roboto') },
		{ value: 'inter', label: translate('nikki.vendingMachine.themes.fontStyle.inter') },
		{ value: 'poppins', label: translate('nikki.vendingMachine.themes.fontStyle.poppins') },
		{ value: 'montserrat', label: translate('nikki.vendingMachine.themes.fontStyle.montserrat') },
		{ value: 'custom', label: translate('nikki.vendingMachine.themes.fontStyle.custom') },
	];

	return (
		<Card withBorder p='md' radius='md'>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconPalette size={24} />
						<Stack gap={2}>
							<Text size='sm' fw={600}>{theme.name}</Text>
							<Badge size='sm' variant='filled'>{theme.code}</Badge>
						</Stack>
					</Group>
					{onRemove && (
						<ActionIcon
							variant='subtle'
							color='red'
							size='sm'
							onClick={onRemove}
						>
							<IconTrash size={16} />
						</ActionIcon>
					)}
				</Group>

				{theme.description && (
					<Text size='xs' c='dimmed' lineClamp={2}>
						{theme.description}
					</Text>
				)}

				<Group gap='xs' wrap='wrap'>
					<Badge size='sm' variant='filled' color={theme.status === 'active' ? 'green' : 'gray'}>
						{theme.status}
					</Badge>
					<Group gap={4}>
						<Text size='xs' c='dimmed'>{translate('nikki.vendingMachine.themes.fields.primaryColor')}:</Text>
						<Box
							w={20}
							h={20}
							style={{
								backgroundColor: theme.primaryColor,
								borderRadius: 4,
								border: '1px solid #ddd',
							}}
						/>
					</Group>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('nikki.vendingMachine.themes.fields.productCardStyle')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{productCardStyleOptions.find(
							(opt) => opt.value === theme.productCardStyle)?.label || theme.productCardStyle}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('nikki.vendingMachine.themes.fields.appBackground')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{appBackgroundOptions.find(
							(opt) => opt.value === theme.appBackground)?.label || theme.appBackground}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('nikki.vendingMachine.themes.fields.fontStyle')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{fontStyleOptions.find((opt) => opt.value === theme.fontStyle)?.label || theme.fontStyle}
					</Badge>
				</Group>
			</Stack>
		</Card>
	);
};
