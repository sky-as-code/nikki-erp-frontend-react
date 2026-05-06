import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { AttributeCreateForm } from '../../features/attribute/components';
import { useAttributeCreateHandlers } from '../../features/attribute/hooks';


export const AttributeCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const { isLoading, onSubmit } = useAttributeCreateHandlers();
	const navigate = useNavigate();
	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.attributes'), href: '../attributes' },
		{ title: t('nikki.inventory.breadcrumbs.createAttribute'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: t('nikki.general.actions.cancel'), variant: 'outline', onClick: () => navigate(-1) },
						{ label: t('nikki.general.actions.create'), type: 'submit', form: 'attribute-create-form' },
					]}
				/>,
			]}
		>
			<AttributeCreateForm
				isLoading={isLoading}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const AttributeCreatePage = withWindowTitle('Create Attribute', AttributeCreatePageBody);