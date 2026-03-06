import { Breadcrumbs, Button } from '@mantine/core';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';


interface BreadCrumbsProps {
	items: { title: string; href: string }[];
}

export function BreadCrumbs({ items }: BreadCrumbsProps) {
	const navigate = useNavigate();

	const breadcrumbs = useMemo(() => items.map((item, index) => {
		return (
			<Button key={index} variant='transparent' size='compact-xs' p={0} fz='md' fw={500}
				onClick={() => item.href !== '#' && navigate(item.href)}
			>
				{item.title}
			</Button>
		);
	}), [items]);

	return (
		<Breadcrumbs>{breadcrumbs}</Breadcrumbs>
	);
}