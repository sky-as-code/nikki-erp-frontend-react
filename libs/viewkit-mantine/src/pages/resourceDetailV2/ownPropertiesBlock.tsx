import { Stack, Text, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { AutoField, ReadOnlyBooleanSwitch, useComputedField } from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { useDetailFieldDisplay } from './detailFieldDisplay';
import { fieldPresentation, isBlockVisible } from './fieldVisibility';
import classes from './ResourceDetail.module.css';
import { ResourceUpdateContext } from './resourceUpdateContext';
import { EdgeFieldValue } from '../../components/edgeFieldValue';
import { renderDisplayFieldValue } from '../../components/fieldValue';
import { useResourceDetailContext, useResourceDetailTranslationNs } from '../resourceDetail/ResourceDetailProvider';

import type { FieldVisibilityMode } from './fieldVisibility';
import type { OwnPropertySection } from '../resourceDetail/props';


export function OwnPropertiesBlock({
	block, isLoading, fieldValues, updateMode,
}: {
	block: OwnPropertySection,
	isLoading: boolean,
	fieldValues: Record<string, unknown>,
	updateMode: boolean,
}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { stableFieldLayout } = useDetailFieldDisplay();
	const modelSchema = schemaPack?.modelSchema;
	const t = useTranslate(useResourceDetailTranslationNs());
	const mode = updateMode ? 'update' : 'read';

	// A header over nothing reads as a broken section, so a block whose fields all filter out is
	// dropped along with its title.
	if (!modelSchema || !isBlockVisible(modelSchema, block.fields ?? [], mode, stableFieldLayout)) {
		return null;
	}

	return (
		<Stack gap='sm' className={classes.formBlock}>
			{block.header && block.showTitle ? <Title order={5} className='uppercase'>{t(block.header)}</Title> : null}
			<FieldGroupVertical
				fields={block.fields ?? []}
				isLoading={isLoading}
				modelSchema={modelSchema}
				fieldValues={fieldValues}
				mode={mode}
			/>
		</Stack>
	);
}

/**
 * The fields of one block in any mode. A field the server owns — a key, an auto-generated
 * timestamp, a computed value — has no input to offer, but it is still part of the record the user
 * is looking at, so update mode keeps it on screen as read-only text rather than letting the layout
 * reshuffle the moment Update is pressed. With `stableFieldLayout` create mode does the same.
 */
export function FieldGroupVertical({
	fields, isLoading, modelSchema, fieldValues, mode,
}: {
	fields: string[],
	isLoading: boolean,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
	mode: FieldVisibilityMode,
}): React.ReactNode {
	const { stableFieldLayout } = useDetailFieldDisplay();
	return (
		<div className={classes.formFieldWrapper}>
			{fields.map(field => {
				const presentation = fieldPresentation(modelSchema, field, mode, stableFieldLayout);
				if (presentation === 'hidden') {
					return null;
				}
				if (presentation === 'readonly') {
					return (
						<ReadOnlyFieldValue
							key={field}
							field={field}
							modelSchema={modelSchema}
							fieldValues={fieldValues}
						/>
					);
				}
				return (
					<Stack key={field} gap={4}>
						<AutoField name={field} inputProps={{ disabled: isLoading }} />
					</Stack>
				);
			})}
		</div>
	);
}

/**
 * One field as label-over-value text.
 *
 * A field the record left unset still renders, as its label over a dash: the reader is asking
 * what this record holds, and "no short name" is an answer, while a row that silently disappears
 * is indistinguishable from a field that does not exist.
 */
function ReadOnlyFieldValue({
	field, modelSchema, fieldValues,
}: {
	field: string,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
}): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());
	// Called before the early return, since hooks cannot be skipped. It no-ops for every field
	// that is not function-computed with a declared dependency.
	const computed = useComputedField(field);
	// Optional: a create form with a stable layout renders read-only fields too, and has no record.
	const edgeSchemas = React.useContext(ResourceUpdateContext)?.edgeSchemas ?? {};
	const { fieldRenderers } = useDetailFieldDisplay();
	const fieldDef = modelSchema.fields[field];
	// A foreign key resolves to the relation it owns the key for, the same dispatch edit mode
	// uses to choose `RelationSelectField`.
	const relation = dyn.findRelationBySrcField(modelSchema, field);
	// A live recompute wins over the loaded value, which went stale the moment the user edited the
	// field it derives from. Before the first answer arrives there is nothing fresher to show, so
	// the loaded value stands.
	const rawValue = computed.isLive && computed.value !== undefined
		? computed.value
		: fieldValues[field];
	if (!fieldDef) {
		return null;
	}
	// A boolean is a switch in both modes, so flipping into update mode does not change its look.
	if (fieldDef.data_type?.name === 'boolean') {
		return (
			<Stack gap={4}>
				<Text size='md' fw='600'>{localize(fieldDef.label)}</Text>
				<ReadOnlyBooleanSwitch value={rawValue} />
			</Stack>
		);
	}

	const plainValue = hasDisplayableValue(rawValue)
		? renderDisplayFieldValue(rawValue, fieldDef, localize, fieldRenderers?.[field], fieldValues)
		: emptyFieldPlaceholder;

	return (
		<Stack gap={4}>
			<Text size='md' fw='600'>{localize(fieldDef.label)}</Text>
			<Text size='md' component='div'>
				{relation ? (
					<EdgeFieldValue
						relation={relation}
						destSchema={edgeSchemas[relation.dest_schema_name]}
						fieldValues={fieldValues}
						fallback={plainValue}
					/>
				) : plainValue}
			</Text>
		</Stack>
	);
}

const emptyFieldPlaceholder = '-';

/** Whether a raw field value is worth putting on screen at all. */
function hasDisplayableValue(value: unknown): boolean {
	if (value === null || value === undefined || value === '') {
		return false;
	}
	return !(Array.isArray(value) && value.length === 0);
}
