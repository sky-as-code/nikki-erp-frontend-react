import { Button, Group } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface ActionsProps {
	onCreate?: () => void;
	onRefresh: () => void;
	showImport?: boolean;
	onImport?: () => void;
	/** `{module}.{component}` prefix for these buttons. */
	testId?: string;
}

export const Actions: React.FC<ActionsProps> = ({
	onCreate,
	onRefresh,
	showImport = true,
	onImport,
	testId,
}) => {
	const { t: translate } = useTranslation();
	const prefix = testId ?? 'ui.tableHeader';
	return (
		<Group>
			{onCreate && (
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={onCreate}
					{...testAttrs(prefix, 'create')}
				>
					{translate('nikki.general.actions.create')}
				</Button>
			)}
			<Button
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
				{...testAttrs(prefix, 'refresh')}
			>
				{translate('nikki.general.actions.refresh')}
			</Button>
			{showImport && (
				<Button
					variant='outline'
					leftSection={<IconUpload size={16} />}
					onClick={onImport}
					{...testAttrs(prefix, 'import')}
				>
					{translate('nikki.general.actions.import')}
				</Button>
			)}
		</Group>
	);
};

