import { Grid, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { QuickLinkItem } from '@/features/overviews/QuickLinkItem';


export interface QuickLink {
	titleKey: string;
	descriptionKey: string;
	link: string;
}

export interface QuickLinksProps {
	links: QuickLink[];
	titleKey?: string;
}

export function QuickLinks({ links, titleKey = 'nikki.authorize.overview.quick_links' }: QuickLinksProps) {
	const { t: translate } = useTranslation();

	return (
		<>
			<Title order={5} mt='lg'>{translate(titleKey)}</Title>
			<Grid>
				{links.map((link, index) => (
					<Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
						<QuickLinkItem
							titleKey={link.titleKey}
							descriptionKey={link.descriptionKey}
							link={link.link}
						/>
					</Grid.Col>
				))}
			</Grid>
		</>
	);
}
