/* eslint-disable max-lines-per-function */
import { Box, Divider, Group, MultiSelect, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useKioskModelList } from '@/features/kioskModels';
import { KioskModel } from '@/features/kioskModels/types';
import { Kiosk, KioskMode, KioskStatus } from '@/features/kiosks/types';
import { usePaymentList } from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';


interface KioskBasicInfoProps {
	kiosk: Kiosk;
	isEditing: boolean;
}

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk, isEditing }) => {
	const { t: translate } = useTranslation();
	const { payments } = usePaymentList();
	const { models } = useKioskModelList();
	const [editedName, setEditedName] = useState(kiosk.name);
	const [editedAddress, setEditedAddress] = useState(kiosk.address);
	const [editedLatitude, setEditedLatitude] = useState(kiosk.coordinates.latitude.toString());
	const [editedLongitude, setEditedLongitude] = useState(kiosk.coordinates.longitude.toString());
	const [editedMode, setEditedMode] = useState<KioskMode>(kiosk.mode);
	const [editedStatus, setEditedStatus] = useState<KioskStatus>(kiosk.status);
	const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
	const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<string[]>([]);


	const paymentOptions = payments?.map((p: PaymentMethod) => ({ value: p.id, label: p.name })) || [];
	const modelOptions = models?.map((m: KioskModel) => ({ value: m.id, label: m.name })) || [];

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

	const getModelName = (modelId: string | null) => {
		if (!modelId) return '-';
		const model = models?.find((m: KioskModel) => m.id === modelId);
		return model?.name || '-';
	};

	const getPaymentMethodNames = (paymentIds: string[]) => {
		if (paymentIds.length === 0) return '-';
		const names = paymentIds
			.map((id) => payments?.find((p: PaymentMethod) => p.id === id)?.name)
			.filter(Boolean);
		return names.length > 0 ? names.join(', ') : '-';
	};

	return (
		<Stack gap='xs'>
			<div>
				<Text size='sm' c='dimmed' mb={3}>
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

			<div>
				<Text size='sm' c='dimmed' mb={3}>
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

			<div>
				<Text size='sm' c='dimmed' mb={3}>
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

			<div>
				<Text size='sm' c='dimmed' mb={3}>
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

			<div>
				<Text size='sm' c='dimmed' mb={3}>
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

			<div>
				<Text size='sm' c='dimmed' mb={3} fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.model')}
				</Text>
				{isEditing ? (
					<Select
						value={selectedModelId}
						onChange={setSelectedModelId}
						placeholder={translate('nikki.vendingMachine.kioskModels.fields.model')}
						data={modelOptions}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getModelName(selectedModelId)}</Text>
					</Box>
				)}
			</div>

			<div>
				<Text size='sm' c='dimmed' mb={3} fw={500}>
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

			<Divider my={3} />

			<div>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.kiosk.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(kiosk.createdAt).toLocaleString()}</Text>
			</div>

			{kiosk.deletedAt && (
				<>
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb={3}>
							{translate('nikki.vendingMachine.kiosk.fields.deletedAt')}
						</Text>
						<Text size='sm'>{new Date(kiosk.deletedAt).toLocaleString()}</Text>
					</div>
				</>
			)}
		</Stack>
	);
};
