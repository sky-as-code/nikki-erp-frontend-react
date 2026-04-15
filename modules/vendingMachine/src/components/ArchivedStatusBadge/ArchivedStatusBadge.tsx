import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';



export const ArchivedStatusBadge: React.FC<{ isArchived: boolean }> = ({ isArchived }) => {
	const { t: translate } = useTranslation();

	const statusInfo = isArchived
		? { color: 'orange', label: translate('nikki.general.status.archived') }
		: { color: 'green', label: translate('nikki.general.status.active') };

	return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
};