import { Skeleton, Text } from '@mantine/core';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import classes from './NameCell.module.css';


interface NameCellProps {
	content?: React.ReactNode;
	link?: string;
	onClick?: () => void;
}

export const NameCell: React.FC<NameCellProps> = ({ content, link, onClick }) => {
	const navigate = useNavigate();
	const isLink = !!link && !!content;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClick) {
			onClick();
			return;
		}
		if (isLink) navigate(link);
	};

	return (
		<Text
			className={clsx({[classes.nameLink]: isLink})}
			c={isLink ? 'light-dark(var(--mantine-color-blue-8), var(--mantine-color-blue-2))' : 'var(--mantine-color-gray-7)'}
			fw={500} w={'max-content'}
			onClick={handleClick}
		>
			{content ?? <Skeleton height={18} width={100} />}
		</Text>
	);
};