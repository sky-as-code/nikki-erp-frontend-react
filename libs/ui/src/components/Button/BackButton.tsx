import { Button, Group } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


interface BackButtonProps {
	onClick?: () => void;
	to?: string | number;
	label?: string;
}

/**
 * Reusable back button. If no onClick is provided, it navigates back in history.
 * Use `to` to navigate to a specific path or history delta.
 */
export const BackButton: React.FC<BackButtonProps> = ({ onClick, to, label }) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const defaultLabel = translate('nikki.general.actions.back');

	const handleClick = React.useCallback(() => {
		if (onClick) {
			onClick();
			return;
		}

		if (typeof to === 'number') {
			navigate(to);
			return;
		}

		if (to) {
			navigate(to);
			return;
		}

		navigate(-1);
	}, [navigate, onClick, to]);

	return (
		<Group>
			<Button variant='subtle' onClick={handleClick}>
				{label || defaultLabel}
			</Button>
		</Group>
	);
};
