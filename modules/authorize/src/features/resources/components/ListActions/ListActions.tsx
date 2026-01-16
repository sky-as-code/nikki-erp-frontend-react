import { Badge, Group, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Action } from '@/features/actions';


interface ListActionsProps {
	actions?: Action[];
}

export const ListActions: React.FC<ListActionsProps> = ({ actions }) => {
	const { t } = useTranslation();
	return (
		<div>
			<TextInput
				label={t('nikki.authorize.resource.messages.actions')}
				value=''
				readOnly
				styles={{ input: { display: 'none' } }}
			/>
			{actions && actions.length > 0 ? (
				<Group gap='xs' mt='xs'>
					{actions.map((action) => (
						<Badge key={action.id} color='blue' variant='light' size='sm'>
							{action.name}
						</Badge>
					))}
				</Group>
			) : (
				<Text size='sm' c='dimmed'>{t('nikki.authorize.resource.messages.no_actions_defined')}</Text>
			)}
		</div>
	);
};
