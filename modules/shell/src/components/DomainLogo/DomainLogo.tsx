import { Button, Flex } from '@mantine/core';
import { IconBrandBlackberry, IconChevronLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { useNavigate } from 'react-router';

import classes from './DomainLogo.module.css';


export const DomainLogoButton: React.FC<{ isRootPath: boolean }> = ({ isRootPath }) => {
	const navigate = useNavigate();

	return (
		<Button
			className={classes.domainLogoButton}
			h={'100%'}
			variant='transparent'
			p={0}
			onClick={() => {
				navigate(`/`);
			}}
		>
			<Flex align='center' justify='center' gap={2} style={{ minWidth: 'auto', position: 'relative' }}>
				<IconChevronLeft
					size={26}
					className={clsx(classes.iconHome, isRootPath && classes.iconHidden)}
					style={{ flexShrink: 0, transition: 'opacity 0.2s ease, transform 0.2s ease' }}
				/>
				<IconBrandBlackberry
					size={30}
					className={clsx(classes.iconBrand)}
					style={{ flexShrink: 0, transition: 'opacity 0.2s ease, transform 0.2s ease' }}
				/>
			</Flex>
		</Button>
	);
};
