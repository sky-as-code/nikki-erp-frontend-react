import { Button } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ORG_HOME_PATH } from '@nikkierp/shell/constants';
import { IconCategoryFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import classes from './GoHomeButton.module.css';


export type GoHomeButtonProps = {
	/** Test-id segments, so the header's and the drawer's buttons stay apart. */
	testId: string,
};

/** The all-apps button: plays its flip, then opens the org's module home. */
export function GoHomeButton({ testId }: GoHomeButtonProps): React.ReactNode {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [isAnimating, setIsAnimating] = React.useState(false);
	const label = t('nikki.shell.menuBar.allApps');

	const handleAnimationEnd = () => {
		setIsAnimating(false);
		navigate(ORG_HOME_PATH);
	};

	return (
		<Button
			p={0}
			variant='transparent'
			onClick={() => setIsAnimating(true)}
			onAnimationEnd={handleAnimationEnd}
			className={clsx(classes.goHomeButton, isAnimating && classes.goHomeButtonClick)}
			aria-label={label}
			title={label}
			{...testAttrs(testId)}
		>
			<IconCategoryFilled size={26} color={'var(--mantine-color-blue-6)'}/>
		</Button>
	);
}
