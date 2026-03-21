import {
	Badge,
	Paper,
	Text,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';

import { localizedTextToString } from '../../localizedText';
import attributeSchema from '../../../schemas/attribute-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Attribute } from '../types';


const ATTRIBUTE_COLUMNS = [
	'codeName',
	'displayName',
	'dataType',
	'isRequired',
	'sortIndex'
];

interface AttributeTableProps {
	attributes: Attribute[];
	getAttributeDetailLink?: (attribute: Attribute) => string;
	emptyMessage?: string;
}

export function AttributeTable({
	attributes,
	getAttributeDetailLink,
	emptyMessage = 'No attributes found',
}: AttributeTableProps): React.ReactElement {
	if (attributes.length === 0) {
		return (
			<Paper p='md' withBorder>
				<Text c='dimmed' ta='center'>{emptyMessage}</Text>
			</Paper>
		);
	}

	return (
		<Paper p='md'>
			<AutoTable
				schema={attributeSchema as ModelSchema}
				columns={ATTRIBUTE_COLUMNS}
				data={attributes as unknown as Record<string, unknown>[]}
				columnAsLink='codeName'
				columnAsLinkHref={(row) => {
					const attribute = row as Attribute;
					return getAttributeDetailLink?.(attribute) ?? `./${attribute.id}`;
				}}
				columnRenderers={{
					displayName: (row) => {
						const attribute = row as Attribute;
						return localizedTextToString(attribute.displayName) || attribute.id;
					},
					dataType: (row) => {
						const attribute = row as Attribute;
						return String(attribute.dataType || '-');
					},
					isRequired: (row) => {
						const attribute = row as Attribute;
						return (
							<Badge color={attribute.isRequired ? 'green' : 'gray'} variant='light'>
								{attribute.isRequired ? 'Yes' : 'No'}
							</Badge>
						);
					},
					sortIndex: (row) => {
						const attribute = row as Attribute;
						return typeof attribute.sortIndex === 'number' ? attribute.sortIndex : '-';
					},
				}}
			/>
		</Paper>
	);
}