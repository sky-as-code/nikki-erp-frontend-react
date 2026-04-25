import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface ListActionListPageProps {
	onCreate?: () => void;
	onRefresh: () => void;
	onRemoveUser?: () => void;

	/** Whether the Import button is rendered. Defaults to `true`. */
	showImport?: boolean;
	/** Disables the Import button without hiding it. */
	disableImport?: boolean;
	/** Click handler for the Import button. */
	onImport?: () => void;
	/** Override for the Import button label. */
	importLabel?: React.ReactNode;
}

export function ListActionListPage({
	onCreate,
	onRefresh,
	showImport = true,
	disableImport,
	onImport,
	importLabel,
}: ListActionListPageProps): React.ReactElement {
	const { t } = useTranslation();

	return (
		<Group>
			<Button
				size='compact-md'
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
				disabled={!onCreate}
			>
				{t('nikki.identity.user.actions.create')}
			</Button>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				{t('nikki.identity.user.actions.refresh')}
			</Button>
			{showImport && (
				<Button
					size='compact-md'
					variant='outline'
					leftSection={<IconUpload size={16} />}
					onClick={onImport}
					disabled={disableImport || !onImport}
				>
					{importLabel ?? t('nikki.identity.user.actions.import')}
				</Button>
			)}
		</Group>
	);
}
