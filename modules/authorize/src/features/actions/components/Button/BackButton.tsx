import { Button, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface BackButtonProps {
	onClick: () => void;
	label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label }) => {
	const { t: translate } = useTranslation();
	const defaultLabel = translate('nikki.general.actions.back');
	return (
		<Group>
			<Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onClick}>
				{label || defaultLabel}
			</Button>
		</Group>
	);
};