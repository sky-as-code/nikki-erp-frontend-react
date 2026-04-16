import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { TablePaginationProps } from '@nikkierp/ui/components';
import { IconBox } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { TableAction } from '@/components/Table';

import { KioskModel } from '../../types';
import { getKioskModelTableActions, KioskModelTableActions } from '../KioskModelTable';



export interface KioskModelGridViewProps {
	models: KioskModel[];
	isLoading?: boolean;
	actions?: KioskModelTableActions;
	pagination?: TablePaginationProps;
}

export const KioskModelGridView: React.FC<KioskModelGridViewProps> = ({
	models,
	isLoading = false,
	actions = {},
}) => {
	const { t: translate } = useTranslation();
	const { view: onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (models.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kioskModels.messages.no_models')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{models.map((model) => (
				<Card
					key={model.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: model.isArchived ? 'default' : 'pointer',
					}}
					onClick={() => {
						if (!model.isArchived) onPreview?.(model);
					}}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconBox size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{model.referenceCode}</Text>
									<Text size='xs' c='dimmed'>{model.name}</Text>
								</Stack>
							</Group>
							<TableAction
								actions={getKioskModelTableActions(model, cardActions, translate)}
								overflowMenuLabel={translate('nikki.general.actions.title')}
							/>
						</Group>

						{model.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{model.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							<ArchivedStatusBadge isArchived={model.isArchived ?? false} />
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}: {new Date(model.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
