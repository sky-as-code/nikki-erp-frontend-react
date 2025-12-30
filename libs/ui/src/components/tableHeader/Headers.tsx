import { Breadcrumbs, Group, TagsInput, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface HeadersProps {
	titleKey: string;
	searchPlaceholderKey?: string;
}

export const Headers: React.FC<HeadersProps> = ({
	titleKey,
	searchPlaceholderKey = 'nikki.general.actions.search',
}) => {
	const { t: translate } = useTranslation();
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Title order={4}>
					{translate(titleKey)}
				</Title>
			</Breadcrumbs>
			<TagsInput
				placeholder={translate(searchPlaceholderKey)}
				w='500px'
			/>
		</Group>
	);
};

