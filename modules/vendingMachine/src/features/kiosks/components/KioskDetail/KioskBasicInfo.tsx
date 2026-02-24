/* eslint-disable max-lines-per-function */
import { Box, Button, Card, Divider, Group, MultiSelect, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconDeviceDesktop, IconDeviceGamepad2, IconMapPin, IconPalette, IconPhoto, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Ad } from '@/features/ads/types';
import { AdCard } from '@/features/events/components/EventDetailDrawer/AdCard';
import { AdSelectModal } from '@/features/events/components/EventDetailDrawer/AdSelectModal';
import { GamePreviewCard } from '@/features/events/components/EventDetailDrawer/GamePreviewCard';
import { GameSelectModal } from '@/features/events/components/EventDetailDrawer/GameSelectModal';
import { ThemePreviewCard } from '@/features/events/components/EventDetailDrawer/ThemePreviewCard';
import { ThemeSelectModal } from '@/features/events/components/EventDetailDrawer/ThemeSelectModal';
import { Game } from '@/features/games/types';
import { Kiosk, KioskMode, KioskStatus } from '@/features/kiosks/types';
import { useKioskTemplateList } from '@/features/kioskTemplate';
import { OperatingMode, KioskType, InterfaceMode, KioskTemplate } from '@/features/kioskTemplate/types';
import { usePaymentList } from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';
import { Theme } from '@/features/themes/types';


interface KioskBasicInfoProps {
	kiosk: Kiosk;
}

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk }) => {
	const { t: translate } = useTranslation();
	const { payments } = usePaymentList();
	const { templates } = useKioskTemplateList();

	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState(kiosk.name);
	const [editedAddress, setEditedAddress] = useState(kiosk.address);
	const [editedLatitude, setEditedLatitude] = useState(kiosk.coordinates.latitude.toString());
	const [editedLongitude, setEditedLongitude] = useState(kiosk.coordinates.longitude.toString());
	const [editedMode, setEditedMode] = useState<KioskMode>(kiosk.mode);
	const [editedStatus, setEditedStatus] = useState<KioskStatus>(kiosk.status);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
	const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<string[]>([]);
	const [selectedOperatingMode, setSelectedOperatingMode] = useState<OperatingMode | undefined>(undefined);
	const [selectedKioskType, setSelectedKioskType] = useState<KioskType | undefined>(undefined);
	const [selectedInterfaceMode, setSelectedInterfaceMode] = useState<InterfaceMode | undefined>(undefined);
	const [selectedSlideshow, setSelectedSlideshow] = useState<Ad | undefined>(undefined);
	const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>(undefined);
	const [selectedGame, setSelectedGame] = useState<Game | undefined>(undefined);

	const [adSelectModalOpened, setAdSelectModalOpened] = useState(false);
	const [themeSelectModalOpened, setThemeSelectModalOpened] = useState(false);
	const [gameSelectModalOpened, setGameSelectModalOpened] = useState(false);


	const handleSave = () => {
		// TODO: Implement save logic
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditedName(kiosk.name);
		setEditedAddress(kiosk.address);
		setEditedLatitude(kiosk.coordinates.latitude.toString());
		setEditedLongitude(kiosk.coordinates.longitude.toString());
		setEditedMode(kiosk.mode);
		setEditedStatus(kiosk.status);
		setIsEditing(false);
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

	const paymentOptions = payments?.map((p: PaymentMethod) => ({ value: p.id, label: p.name })) || [];
	const templateOptions = templates?.map((t: KioskTemplate) => ({ value: t.id, label: t.name })) || [];

	const getStatusLabel = (status: KioskStatus) => {
		const statusMap = {
			[KioskStatus.ACTIVATED]: translate('nikki.vendingMachine.kiosk.status.activated'),
			[KioskStatus.DISABLED]: translate('nikki.vendingMachine.kiosk.status.disabled'),
			[KioskStatus.DELETED]: translate('nikki.vendingMachine.kiosk.status.deleted'),
		};
		return statusMap[status] || status;
	};

	const getModeLabel = (mode: KioskMode) => {
		const modeMap = {
			[KioskMode.PENDING]: translate('nikki.vendingMachine.kiosk.mode.pending'),
			[KioskMode.SELLING]: translate('nikki.vendingMachine.kiosk.mode.selling'),
			[KioskMode.ADSONLY]: translate('nikki.vendingMachine.kiosk.mode.adsOnly'),
		};
		return modeMap[mode] || mode;
	};

	const getOperatingModeLabel = (mode: OperatingMode | undefined) => {
		if (!mode) return '-';
		const modeMap = {
			pending: translate('nikki.vendingMachine.kioskTemplate.operatingMode.pending'),
			selling: translate('nikki.vendingMachine.kioskTemplate.operatingMode.selling'),
			adsOnly: translate('nikki.vendingMachine.kioskTemplate.operatingMode.adsOnly'),
		};
		return modeMap[mode] || mode;
	};

	const getKioskTypeLabel = (type: KioskType | undefined) => {
		if (!type) return '-';
		const typeMap = {
			withoutElevator: translate('nikki.vendingMachine.kioskTemplate.kioskType.withoutElevator'),
			elevatorWithConveyor: translate('nikki.vendingMachine.kioskTemplate.kioskType.elevatorWithConveyor'),
			elevatorWithoutConveyor: translate('nikki.vendingMachine.kioskTemplate.kioskType.elevatorWithoutConveyor'),
		};
		return typeMap[type] || type;
	};

	const getInterfaceModeLabel = (mode: InterfaceMode | undefined) => {
		if (!mode) return '-';
		const modeMap = {
			normal: translate('nikki.vendingMachine.kioskTemplate.interfaceMode.normal'),
			focus: translate('nikki.vendingMachine.kioskTemplate.interfaceMode.focus'),
		};
		return modeMap[mode] || mode;
	};

	const getTemplateName = (templateId: string | null) => {
		if (!templateId) return '-';
		const template = templates?.find((t: KioskTemplate) => t.id === templateId);
		return template?.name || '-';
	};

	const getPaymentMethodNames = (paymentIds: string[]) => {
		if (paymentIds.length === 0) return '-';
		const names = paymentIds
			.map((id) => payments?.find((p: PaymentMethod) => p.id === id)?.name)
			.filter(Boolean);
		return names.length > 0 ? names.join(', ') : '-';
	};

	return (
		<Stack gap='md'>
			<Group justify='space-between' mb='md'>
				<Group gap='xs'>
					<IconDeviceDesktop size={20} />
					<Text fw={600} size='lg'>{kiosk.name}</Text>
				</Group>
				{!isEditing ? (
					<Button size='xs' onClick={() => setIsEditing(true)}>
						{translate('nikki.general.actions.edit')}
					</Button>
				) : (
					<Group gap='xs'>
						<Button size='xs' onClick={handleSave}>
							{translate('nikki.general.actions.save')}
						</Button>
						<Button size='xs' variant='subtle' onClick={handleCancel}>
							{translate('nikki.general.actions.cancel')}
						</Button>
					</Group>
				)}
			</Group>

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.code')}
				</Text>
				<Text size='sm' fw={500}>{kiosk.code}</Text>
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.name')}
				</Text>
				{isEditing ? (
					<TextInput
						value={editedName}
						onChange={(e) => setEditedName(e.currentTarget.value)}
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{kiosk.name}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.address')}
				</Text>
				{isEditing ? (
					<TextInput
						value={editedAddress}
						onChange={(e) => setEditedAddress(e.currentTarget.value)}
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Group gap='xs'>
							<IconMapPin size={16} />
							<Text size='sm'>{kiosk.address}</Text>
						</Group>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.coordinates')}
				</Text>
				{isEditing ? (
					<Group gap='xs'>
						<TextInput
							label={translate('nikki.vendingMachine.kiosk.fields.latitude')}
							value={editedLatitude}
							onChange={(e) => setEditedLatitude(e.currentTarget.value)}
							style={{ flex: 1 }}
						/>
						<TextInput
							label={translate('nikki.vendingMachine.kiosk.fields.longitude')}
							value={editedLongitude}
							onChange={(e) => setEditedLongitude(e.currentTarget.value)}
							style={{ flex: 1 }}
						/>
					</Group>
				) : (
					<Group gap='xs'>
						<Box p='xs' style={{ flex: 1, border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
							<Text size='xs' c='dimmed' mb={4}>{translate('nikki.vendingMachine.kiosk.fields.latitude')}</Text>
							<Text size='sm'>{kiosk.coordinates.latitude.toFixed(6)}</Text>
						</Box>
						<Box p='xs' style={{ flex: 1, border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
							<Text size='xs' c='dimmed' mb={4}>{translate('nikki.vendingMachine.kiosk.fields.longitude')}</Text>
							<Text size='sm'>{kiosk.coordinates.longitude.toFixed(6)}</Text>
						</Box>
					</Group>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.status')}
				</Text>
				{isEditing ? (
					<Select
						value={editedStatus}
						onChange={(value) => setEditedStatus(value as KioskStatus)}
						data={[
							{ value: KioskStatus.ACTIVATED, label: translate('nikki.vendingMachine.kiosk.status.activated') },
							{ value: KioskStatus.DISABLED, label: translate('nikki.vendingMachine.kiosk.status.disabled') },
							{ value: KioskStatus.DELETED, label: translate('nikki.vendingMachine.kiosk.status.deleted') },
						]}
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getStatusLabel(kiosk.status)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.mode')}
				</Text>
				{isEditing ? (
					<Select
						value={editedMode}
						onChange={(value) => setEditedMode(value as KioskMode)}
						data={[
							{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
							{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
							{ value: KioskMode.ADSONLY, label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
						]}
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getModeLabel(kiosk.mode)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskTemplate.fields.template')}
				</Text>
				{isEditing ? (
					<Select
						value={selectedTemplateId}
						onChange={setSelectedTemplateId}
						placeholder={translate('nikki.vendingMachine.kioskTemplate.fields.template')}
						data={templateOptions}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getTemplateName(selectedTemplateId)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kiosk.fields.paymentMethods')}
				</Text>
				{isEditing ? (
					<MultiSelect
						value={selectedPaymentMethodIds}
						onChange={setSelectedPaymentMethodIds}
						placeholder={translate('nikki.vendingMachine.kiosk.fields.paymentMethods')}
						data={paymentOptions}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getPaymentMethodNames(selectedPaymentMethodIds)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskTemplate.fields.operatingMode')}
				</Text>
				{isEditing ? (
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
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getOperatingModeLabel(selectedOperatingMode)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskTemplate.fields.kioskType')}
				</Text>
				{isEditing ? (
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
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getKioskTypeLabel(selectedKioskType)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskTemplate.fields.interfaceMode')}
				</Text>
				{isEditing ? (
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
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getInterfaceModeLabel(selectedInterfaceMode)}</Text>
					</Box>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskTemplate.fields.slideshow')}
				</Text>
				{selectedSlideshow ? (
					<AdCard ad={selectedSlideshow} onRemove={isEditing ? handleRemoveSlideshow : undefined} />
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
							{isEditing && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => setAdSelectModalOpened(true)}
								>
									{translate('nikki.vendingMachine.events.playlist.selectAds')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.theme')}
				</Text>
				{selectedTheme ? (
					<ThemePreviewCard theme={selectedTheme} onRemove={isEditing ? handleRemoveTheme : undefined} />
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
							{isEditing && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => setThemeSelectModalOpened(true)}
								>
									{translate('nikki.vendingMachine.events.selectTheme.selectTheme')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.game')}
				</Text>
				{selectedGame ? (
					<GamePreviewCard game={selectedGame} onRemove={isEditing ? handleRemoveGame : undefined} />
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
							{isEditing && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => setGameSelectModalOpened(true)}
								>
									{translate('nikki.vendingMachine.events.selectGame.selectGame')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kiosk.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(kiosk.createdAt).toLocaleString()}</Text>
			</div>

			{kiosk.deletedAt && (
				<>
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kiosk.fields.deletedAt')}
						</Text>
						<Text size='sm'>{new Date(kiosk.deletedAt).toLocaleString()}</Text>
					</div>
				</>
			)}

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
			/>

			<GameSelectModal
				opened={gameSelectModalOpened}
				onClose={() => setGameSelectModalOpened(false)}
				onSelectGame={handleSelectGame}
			/>
		</Stack>
	);
};
