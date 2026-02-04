import { Breadcrumbs, Button, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';


interface BreadCrumbsProps {
	items: { title: string; href: string }[];
}

export function BreadCrumbs({ items }: BreadCrumbsProps) {
	const navigate = useNavigate();

	const breadcrumbs = useMemo(() => items.map((item, index) => {
		return (
			<Button key={index} variant='transparent' size='xs' p={0}
				onClick={() => navigate(item.href)}
			>
				<Text key={index} component='span' c='blue' fz='md' fw={500}>
					{item.title}
				</Text>
			</Button>
		);
	}), [items]);

	return (
		<Breadcrumbs separator={<IconChevronRight size={16} />} fw='bolder'>{breadcrumbs}</Breadcrumbs>
	);
}