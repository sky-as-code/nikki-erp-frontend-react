import { Paper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';


export interface QuickLinkItemProps {
	titleKey: string;
	descriptionKey: string;
	link: string;
}

export function QuickLinkItem({ titleKey, descriptionKey, link }: QuickLinkItemProps) {
	const { t: translate } = useTranslation();

	return (
		<Paper withBorder p='md' component={Link} to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
			<Text fw={500}>{translate(titleKey)}</Text>
			<Text size='sm' c='dimmed'>{translate(descriptionKey)}</Text>
		</Paper>
	);
}
