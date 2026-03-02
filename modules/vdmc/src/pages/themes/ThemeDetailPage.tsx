import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { DetailControlPanel } from '@/components/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { useThemeDetail } from '@/features/themes';
import { ThemePreview } from '@/features/themes/components/ThemePreview';


export const ThemeDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { theme, isLoading } = useThemeDetail(id);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

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

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.themes'), href: '../themes' },
		{ title: theme?.name || translate('nikki.vendingMachine.themes.detail.title'), href: '#' },
	];

	if (isLoading || !theme) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailControlPanel
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='md'>
				<Group gap='xs' mb='md'>
					<IconPalette size={20} />
					<Text fw={600} size='lg'>{theme.name}</Text>
				</Group>

				{/* Basic Info */}
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{theme.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.name')}
					</Text>
					<Text size='sm'>{theme.name}</Text>
				</div>

				{theme.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.themes.fields.description')}
							</Text>
							<Text size='sm'>{theme.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.status')}
					</Text>
					{getStatusBadge(theme.status)}
				</div>

				<Divider />

				{/* Theme Configuration */}
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.primaryColor')}
					</Text>
					<Group gap='xs'>
						<Box
							style={{
								width: 40,
								height: 40,
								borderRadius: 8,
								backgroundColor: theme.primaryColor,
								border: '2px solid #ddd',
							}}
						/>
						<Text size='sm'>{theme.primaryColor}</Text>
					</Group>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.productCardStyle')}
					</Text>
					<Text size='sm'>
						{productCardStyleOptions.find(
							(opt) => opt.value === theme.productCardStyle)?.label || theme.productCardStyle}
					</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.appBackground')}
					</Text>
					<Text size='sm'>
						{appBackgroundOptions.find(
							(opt) => opt.value === theme.appBackground)?.label || theme.appBackground}
					</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.fontStyle')}
					</Text>
					<Text size='sm'>
						{fontStyleOptions.find((opt) => opt.value === theme.fontStyle)?.label || theme.fontStyle}
					</Text>
				</div>

				{theme.mascotImage && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.themes.fields.mascotImage')}
							</Text>
							<Box
								style={{
									width: '100%',
									maxWidth: 200,
									height: 200,
									borderRadius: 8,
									overflow: 'hidden',
									border: '1px solid #ddd',
								}}
							>
								<img
									src={theme.mascotImage}
									alt='Mascot'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
									}}
								/>
							</Box>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.themes.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(theme.createdAt).toLocaleString()}</Text>
				</div>

				<Divider />

				{/* Preview */}
				<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
					<Text size='xs' c='dimmed'>
						{translate('nikki.vendingMachine.themes.preview.title')}
					</Text>
					<ThemePreview theme={theme} />
				</Stack>

				<Divider />
				<Box h={100}></Box>
			</Stack>
		</PageContainer>
	);
};
