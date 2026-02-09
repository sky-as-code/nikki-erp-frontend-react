import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface ActionsProps {
	onCreate?: () => void;
	onRefresh: () => void;
	showImport?: boolean;
	onImport?: () => void;
}

export const Actions: React.FC<ActionsProps> = ({
	onCreate,
	onRefresh,
	showImport = true,
	onImport,
}) => {
	const { t: translate } = useTranslation();
	return (
		<Group>
			{onCreate && (
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={onCreate}
				>
					{translate('nikki.general.actions.create')}
				</Button>
			)}
			<Button
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				{translate('nikki.general.actions.refresh')}
			</Button>
			{showImport && (
				<Button
					variant='outline'
					leftSection={<IconUpload size={16} />}
					onClick={onImport}
				>
					{translate('nikki.general.actions.import')}
				</Button>
			)}
		</Group>
	);
};

