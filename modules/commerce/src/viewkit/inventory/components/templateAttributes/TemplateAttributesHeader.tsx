import { Group } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { LinkButton } from '@nikkierp/ui/components';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useResourceBaseHref, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';

import { ResolveVariantAction } from './ResolveVariantModal';
import { TEST_ID_PREFIX } from './sectionText';
import { useSectionText } from './useSectionText';
import { PRODUCT_ATTRIBUTE_SCHEMA_NAME } from '../../../../constants/inventory';
import { TEMPLATE_ATTRIBUTES_HEADER } from '../../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const templateAttributesHeaderRenderer: IComponentRenderer<Record<string, never>> = {
	type: TEMPLATE_ATTRIBUTES_HEADER,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={TEMPLATE_ATTRIBUTES_HEADER}>
				<TemplateAttributesHeader />
			</ComponentAnchor>
		);
	},
};

/** The Attributes section header's right segment: Resolve variant, then "All attributes". */
function TemplateAttributesHeader(): React.ReactNode {
	return (
		<Group gap='xs' wrap='nowrap'>
			<ResolveVariantAction />
			<AllAttributesLink />
		</Group>
	);
}

/** To the attribute catalogue. Hidden while the template is created or edited: following it would discard the edits. */
function AllAttributesLink(): React.ReactNode {
	const text = useSectionText();
	const { id } = useParams();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const href = useResourceBaseHref(PRODUCT_ATTRIBUTE_SCHEMA_NAME);
	if (!href || id === 'new' || updateMode) {
		return null;
	}
	return (
		<LinkButton to={href} mode='append' variant='subtle' size='compact-sm' {...testAttrs(TEST_ID_PREFIX, 'allAttributes')}>
			{text.t('product_template_config_allAttributes', { defaultValue: 'All attributes' })}
		</LinkButton>
	);
}
