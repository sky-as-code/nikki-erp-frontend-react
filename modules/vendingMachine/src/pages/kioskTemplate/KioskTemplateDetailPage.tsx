/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Card, Divider, Group, Select, Stack, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconPalette, IconPhoto, IconPlus, IconTemplate } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { Ad } from '@/features/ads/types';
import { AdCard } from '@/features/events/components/EventDetailDrawer/AdCard';
import { AdSelectModal } from '@/features/events/components/EventDetailDrawer/AdSelectModal';
import { GamePreviewCard } from '@/features/events/components/EventDetailDrawer/GamePreviewCard';
import { GameSelectModal } from '@/features/events/components/EventDetailDrawer/GameSelectModal';
import { ThemePreviewCard } from '@/features/events/components/EventDetailDrawer/ThemePreviewCard';
import { ThemeSelectModal } from '@/features/events/components/EventDetailDrawer/ThemeSelectModal';
import { Game } from '@/features/games/types';
import { useKioskTemplateDetail } from '@/features/kioskTemplate';
import { TrayConfiguration } from '@/features/kioskTemplate/components/KioskTemplateDetailDrawer/TrayConfiguration';
import { OperatingMode, KioskType, InterfaceMode, TrayConfiguration as TrayConfigurationType } from '@/features/kioskTemplate/types';
import { Theme } from '@/features/themes/types';


export const KioskTemplateDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { template, isLoading } = useKioskTemplateDetail(id);
	const [adSelectModalOpened, setAdSelectModalOpened] = useState(false);
	const [themeSelectModalOpened, setThemeSelectModalOpened] = useState(false);
	const [gameSelectModalOpened, setGameSelectModalOpened] = useState(false);
	const [selectedSlideshow, setSelectedSlideshow] = useState<Ad | undefined>(template?.slideshow);
	const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>(template?.theme);
	const [selectedGame, setSelectedGame] = useState<Game | undefined>(template?.game);
	const [selectedOperatingMode, setSelectedOperatingMode] =
		useState<OperatingMode | undefined>(template?.operatingMode);
	const [selectedKioskType, setSelectedKioskType] = useState<KioskType | undefined>(template?.kioskType);
	const [selectedInterfaceMode, setSelectedInterfaceMode] =
		useState<InterfaceMode | undefined>(template?.interfaceMode);
	const [numberOfTrays, setNumberOfTrays] = useState<number>(template?.numberOfTrays || 0);
	const [trayConfigurations, setTrayConfigurations] =
		useState<TrayConfigurationType[]>(template?.trayConfigurations || []);

	// Update state when template changes
	React.useEffect(() => {
		if (template) {
			setSelectedSlideshow(template.slideshow);
			setSelectedTheme(template.theme);
			setSelectedGame(template.game);
			setSelectedOperatingMode(template.operatingMode);
			setSelectedKioskType(template.kioskType);
			setSelectedInterfaceMode(template.interfaceMode);
			setNumberOfTrays(template.numberOfTrays || 0);
			setTrayConfigurations(template.trayConfigurations || []);
		}
	}, [template]);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const handleSelectAds = (ads: Ad[]) => {
		if (ads.length > 0) {
			setSelectedSlideshow(ads[0]);
		}
		setAdSelectModalOpened(false);
	};

	const handleSelectTheme = (theme: Theme) => {
		setSelectedTheme(theme);
		setThemeSelectModalOpened(false);
	};

	const handleSelectGame = (game: Game) => {
		setSelectedGame(game);
		setGameSelectModalOpened(false);
	};

	const handleRemoveSlideshow = () => {
		setSelectedSlideshow(undefined);
	};

	const handleRemoveTheme = () => {
		setSelectedTheme(undefined);
	};

	const handleRemoveGame = () => {
		setSelectedGame(undefined);
	};

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskTemplate.title'), href: '../kiosk-template' },
		{ title: template?.name || translate('nikki.vendingMachine.kioskTemplate.detail.title'), href: '#' },
	];

	if (isLoading || !template) {
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
			actionBar={<DetailActionBar
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='lg'>
				<Group gap='xs' mb='md'>
					<IconTemplate size={24} />
					<Text fw={600} size='xl'>{template.name}</Text>
				</Group>

				{/* Basic Information Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskTemplate.sections.basicInfo')}
					</Text>

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskTemplate.fields.code')}
						</Text>
						<Text size='sm' fw={500}>{template.code}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskTemplate.fields.name')}
						</Text>
						<Text size='sm'>{template.name}</Text>
					</div>

					{template.description && (
						<>
							<Divider />
							<div>
								<Text size='sm' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.kioskTemplate.fields.description')}
								</Text>
								<Text size='sm'>{template.description}</Text>
							</div>
						</>
					)}

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskTemplate.fields.status')}
						</Text>
						{getStatusBadge(template.status)}
					</div>
				</Stack>

				<Divider />

				{/* Configuration Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskTemplate.sections.configuration')}
					</Text>

					{/* Operating Mode */}
					<div>
						<Text size='sm' c='dimmed' mb='xs' fw={500}>
							{translate('nikki.vendingMachine.kioskTemplate.fields.operatingMode')}
						</Text>
						<Select
							value={selectedOperatingMode || null}
							onChange={(value) => setSelectedOperatingMode(value as OperatingMode | undefined)}
							placeholder={translate('nikki.vendingMachine.kioskTemplate.fields.operatingMode')}
							data={[
								{ value: 'pending', label: translate('nikki.vendingMachine.kioskTemplate.operatingMode.pending') },
								{ value: 'selling', label: translate('nikki.vendingMachine.kioskTemplate.operatingMode.selling') },
								{ value: 'adsOnly', label: translate('nikki.vendingMachine.kioskTemplate.operatingMode.adsOnly') },
							]}
							clearable
						/>
					</div>

					<Divider />

					{/* Kiosk Type */}
					<div>
						<Text size='sm' c='dimmed' mb='xs' fw={500}>
							{translate('nikki.vendingMachine.kioskTemplate.fields.kioskType')}
						</Text>
						<Select
							value={selectedKioskType || null}
							onChange={(value) => setSelectedKioskType(value as KioskType | undefined)}
							placeholder={translate('nikki.vendingMachine.kioskTemplate.fields.kioskType')}
							data={[
								{ value: 'withoutElevator', label: translate('nikki.vendingMachine.kioskTemplate.kioskType.withoutElevator') },
								{ value: 'elevatorWithConveyor', label: translate('nikki.vendingMachine.kioskTemplate.kioskType.elevatorWithConveyor') },
								{ value: 'elevatorWithoutConveyor', label: translate('nikki.vendingMachine.kioskTemplate.kioskType.elevatorWithoutConveyor') },
							]}
							clearable
						/>
					</div>

					<Divider />

					{/* Interface Mode */}
					<div>
						<Text size='sm' c='dimmed' mb='xs' fw={500}>
							{translate('nikki.vendingMachine.kioskTemplate.fields.interfaceMode')}
						</Text>
						<Select
							value={selectedInterfaceMode || null}
							onChange={(value) => setSelectedInterfaceMode(value as InterfaceMode | undefined)}
							placeholder={translate('nikki.vendingMachine.kioskTemplate.fields.interfaceMode')}
							data={[
								{ value: 'normal', label: translate('nikki.vendingMachine.kioskTemplate.interfaceMode.normal') },
								{ value: 'focus', label: translate('nikki.vendingMachine.kioskTemplate.interfaceMode.focus') },
							]}
							clearable
						/>
					</div>
				</Stack>

				<Divider />

				{/* Content & Media Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskTemplate.sections.contentMedia')}
					</Text>

					{/* Slideshow */}
					<div>
						<Text size='sm' c='dimmed' mb='xs' fw={500}>
							{translate('nikki.vendingMachine.kioskTemplate.fields.slideshow')}
						</Text>
						{selectedSlideshow ? (
							<AdCard ad={selectedSlideshow} onRemove={handleRemoveSlideshow} />
						) : (
							<Card withBorder p='sm' radius='md'>
								<Group gap='xs' justify='space-between'>
									<Box>
										<Group gap='xs' mb='sm'>
											<IconPhoto size={20} />
											<Text size='sm' fw={500}>
												{translate('nikki.vendingMachine.kioskTemplate.fields.slideshow')}
											</Text>
										</Group>
										<Text size='sm' c='dimmed'>
											{translate('nikki.vendingMachine.kioskTemplate.messages.no_slideshow')}
										</Text>
									</Box>
									<Button
										size='xs'
										leftSection={<IconPlus size={14} />}
										onClick={() => setAdSelectModalOpened(true)}
									>
										{translate('nikki.vendingMachine.events.playlist.selectAds')}
									</Button>
								</Group>
							</Card>
						)}
					</div>

					<Divider />

					{/* Theme */}
					<div>
						<Text size='sm' c='dimmed' mb='xs' fw={500}>
							{translate('nikki.vendingMachine.events.fields.theme')}
						</Text>
						{selectedTheme ? (
							<ThemePreviewCard theme={selectedTheme} onRemove={handleRemoveTheme} />
						) : (
							<Card withBorder p='sm' radius='md'>
								<Group gap='xs' justify='space-between'>
									<Box>
										<Group gap='xs' mb='sm'>
											<IconPalette size={20} />
											<Text size='sm' fw={500}>
												{translate('nikki.vendingMachine.events.fields.theme')}
											</Text>
										</Group>
										<Text size='sm' c='dimmed'>
											{translate('nikki.vendingMachine.events.messages.no_theme')}
										</Text>
									</Box>
									<Button
										size='xs'
										leftSection={<IconPlus size={14} />}
										onClick={() => setThemeSelectModalOpened(true)}
									>
										{translate('nikki.vendingMachine.events.selectTheme.selectTheme')}
									</Button>
								</Group>
							</Card>
						)}
					</div>

					<Divider />

					{/* Game */}
					<div>
						<Text size='sm' c='dimmed' mb='xs' fw={500}>
							{translate('nikki.vendingMachine.events.fields.game')}
						</Text>
						{selectedGame ? (
							<GamePreviewCard game={selectedGame} onRemove={handleRemoveGame} />
						) : (
							<Card withBorder p='sm' radius='md'>
								<Group gap='xs' justify='space-between'>
									<Box>
										<Group gap='xs' mb='sm'>
											<IconDeviceGamepad2 size={20} />
											<Text size='sm' fw={500}>
												{translate('nikki.vendingMachine.events.fields.game')}
											</Text>
										</Group>
										<Text size='sm' c='dimmed'>
											{translate('nikki.vendingMachine.events.messages.no_game')}
										</Text>
									</Box>
									<Button
										size='xs'
										leftSection={<IconPlus size={14} />}
										onClick={() => setGameSelectModalOpened(true)}
									>
										{translate('nikki.vendingMachine.events.selectGame.selectGame')}
									</Button>
								</Group>
							</Card>
						)}
					</div>
				</Stack>

				<Divider />

				{/* Tray Configuration Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskTemplate.sections.trayConfiguration')}
					</Text>
					<TrayConfiguration
						numberOfTrays={numberOfTrays}
						trayConfigurations={trayConfigurations}
						onNumberOfTraysChange={setNumberOfTrays}
						onTrayConfigurationsChange={setTrayConfigurations}
					/>
				</Stack>

				<Divider />

				{/* Metadata Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskTemplate.sections.metadata')}
					</Text>
					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskTemplate.fields.createdAt')}
						</Text>
						<Text size='sm'>{new Date(template.createdAt).toLocaleString()}</Text>
					</div>
				</Stack>

				<Box h={50}></Box>
			</Stack>

			{/* Modals */}
			<AdSelectModal
				opened={adSelectModalOpened}
				onClose={() => setAdSelectModalOpened(false)}
				onSelectAds={handleSelectAds}
			/>

			<ThemeSelectModal
				opened={themeSelectModalOpened}
				onClose={() => setThemeSelectModalOpened(false)}
				onSelectTheme={handleSelectTheme}
				selectedThemeId={template.themeId || template.theme?.id}
			/>

			<GameSelectModal
				opened={gameSelectModalOpened}
				onClose={() => setGameSelectModalOpened(false)}
				onSelectGame={handleSelectGame}
				selectedGameId={template.gameId || template.game?.id}
			/>
		</PageContainer>
	);
};
