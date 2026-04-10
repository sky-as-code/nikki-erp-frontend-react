import { Badge, Box, Divider, Space, Stack, Text } from '@mantine/core';
import { IconBox } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PreviewDrawer } from '@/components/PreviewDrawer';

import { useKioskModelDetail } from '../../hooks/useKioskModelDetail';
import { KioskModel, ShelvesConfigRow } from '../../types';
import { parseShelvesConfigRows, ShelvesConfig } from '../ShelvesConfig';


export interface KioskModelDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	modelId: string;
}

export const KioskModelDetailDrawer: React.FC<KioskModelDetailDrawerProps> = ({
	opened,
	onClose,
	modelId,
}) => {
	const { model, isLoading } = useKioskModelDetail(modelId);
	const navigate = useNavigate();

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: model?.name,
				subtitle: model?.modelId,
				avatar: <IconBox size={20} />,
			}}
			onViewDetails={() => {
				if (model?.id) {
					navigate(`../kiosk-models/${model.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!model && !isLoading}
		>
			<KioskModelDrawerContent model={model} />
		</PreviewDrawer>
	);
};


const KioskModelDrawerContent: React.FC<{ model: KioskModel | undefined }> = ({ model }) => {
	const { t: translate } = useTranslation();
	const [shelvesConfigRows, _] = useState<ShelvesConfigRow[]>(
		() => parseShelvesConfigRows(model?.shelvesConfig || {}),
	);

	if (!model) return null;

	return (
		<Stack gap='md'>
			<Box>
				<Text size='sm' c='dimmed' mb={'xs'}>
					{translate('nikki.vendingMachine.kioskModels.fields.referenceCode')}
				</Text>
				<Text size='sm' fw={500}>{model.referenceCode}</Text>
			</Box>
			<Divider />
			<Box>
				<Text size='sm' c='dimmed' mb={'xs'}>
					{translate('nikki.vendingMachine.kioskModels.fields.name')}
				</Text>
				<Text size='sm'>{model.name}</Text>
			</Box>
			<Divider />
			<Box>
				<Text size='sm' c='dimmed' mb={'xs'}>
					{translate('nikki.vendingMachine.kioskModels.fields.description')}
				</Text>
				<Text size='sm'>{model.description}</Text>
			</Box>
			<Divider />
			<Box>
				<Text size='sm' c='dimmed' mb={'xs'}>
					{translate('nikki.vendingMachine.kioskModels.fields.status')}
				</Text>
				{getStatusBadge(model.status, translate)}
			</Box>
			<Divider />
			<Box>
				<Text size='sm' c='dimmed' mb={'xs'}>
					{translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
				</Text>
				<Text size='sm'>{model.kioskType}</Text>
			</Box>
			<Divider />
			<ShelvesConfig
				isEditing={false}
				shelvesNumber={model.shelvesNumber || 0}
				shelvesConfigRows={shelvesConfigRows}
			/>
			<Divider my={'xs'}/>
			<Box>
				<Text size='sm' c='dimmed' mb={'xs'}>
					{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(model.createdAt).toLocaleString()}</Text>
			</Box>
			<Space h='md' />
		</Stack>
	);
};


const getStatusBadge = (status: string, translate: TFunction) => {
	const statusMap: Record<string, { color: string; label: string }> = {
		active: { color: 'green', label: translate('nikki.general.status.active') },
		inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		deleted: { color: 'red', label: translate('nikki.general.status.deleted') },
	};
	const statusInfo = statusMap[status] || { color: 'gray', label: status };
	return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
};