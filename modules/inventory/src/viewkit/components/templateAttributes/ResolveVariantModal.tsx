import { Alert, Group, Modal, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, LinkButton, Select } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useResourceBaseHref, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { useAttributeCatalogue } from './attributeCatalogue';
import { useTemplateRecord } from './configDraftState';
import { attributeLabel, TEST_ID_PREFIX, valueLabel } from './sectionText';
import { configFromRecord } from './templateConfigDrafts';
import { useSectionText } from './useSectionText';
import { PRODUCT_TEMPLATE_SCHEMA_NAME } from '../../../constants';
import { ProductTemplateCommands } from '../../../features/productTemplate/commands';
import { TEMPLATE_RESOLVE_VARIANT } from '../../ids';

import type { AttributeCatalogue } from './attributeCatalogue';
import type { TemplateRecord } from './configDraftState';
import type { SectionText } from './sectionText';
import type { AttributeLineDraft } from './templateConfigDrafts';
import type { ResolveSelectionRequest, ResolveSelectionResponse } from '../../../features/productTemplate/types';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/** The backend action a resolve that may create the variant asserts (a plain lookup needs only read). */
const MATERIALIZE_ACTION = 'generate_variants';
const RESOLVABLE_MODES = new Set(['instant', 'dynamic']);

type ActionProps = { label: string };

/**
 * A `component` contextual action of the template detail: it sits in the page's actions row, beside
 * Copy and Re-sync, and the page passes its translated label.
 */
export const templateResolveVariantRenderer: IComponentRenderer<ActionProps> = {
	type: TEMPLATE_RESOLVE_VARIANT,
	propsSchema: z.object({ label: z.string() }).strict(),
	render(props) {
		return (
			<ComponentAnchor id={TEMPLATE_RESOLVE_VARIANT}>
				<ResolveVariantAction label={props.label} />
			</ComponentAnchor>
		);
	},
};

/**
 * Reads the SAVED configuration off the record, so it is hidden while the form is edited: a resolve
 * then would act on lines other than the ones on screen.
 */
function ResolveVariantAction({ label }: ActionProps): React.ReactNode {
	const record = useTemplateRecord();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const text = useSectionText();
	const configuration = record?.configuration;
	const lines = React.useMemo(() => configFromRecord(configuration).lines, [configuration]);
	const attributeIds = React.useMemo(() => [...new Set(lines.map(line => line.attributeId))], [lines]);
	const catalogue = useAttributeCatalogue(attributeIds);
	if (!record || updateMode) {
		return null;
	}
	return <ResolveVariantButton record={record} lines={lines} catalogue={catalogue} text={text} label={label} />;
}

type ResolveProps = {
	record: TemplateRecord,
	lines: AttributeLineDraft[],
	catalogue: AttributeCatalogue,
	text: SectionText,
};

/**
 * Admin action: pick one value per variant-creating attribute and get the complete variant, created
 * or restored when it does not exist yet (`materialize_if_missing`). Mostly for dynamic attributes,
 * whose complete variants are otherwise created only when ordered.
 */
function ResolveVariantButton({ label, ...props }: ResolveProps & ActionProps): React.ReactNode {
	const [opened, setOpened] = React.useState(false);
	const lock = useActionLock(PRODUCT_TEMPLATE_SCHEMA_NAME, MATERIALIZE_ACTION);
	const lines = props.lines.filter(line => RESOLVABLE_MODES.has(lineMode(line, props.catalogue)));
	return (
		<>
			<Button
				variant='outline'
				size='compact-md'
				locked={lock.locked}
				lockedMissing={lock.missing}
				disabled={lines.length === 0}
				onClick={() => setOpened(true)}
				{...testAttrs(TEST_ID_PREFIX, 'resolve')}
			>
				{label}
			</Button>
			{opened ? <ResolveModal {...props} lines={lines} onClose={() => setOpened(false)} /> : null}
		</>
	);
}

function ResolveModal({ record, lines, catalogue, text, onClose }: ResolveProps & { onClose: () => void }) {
	const [selection, setSelection] = React.useState<Record<string, string>>({});
	const resolve = useCommand<ResolveSelectionResponse>(ProductTemplateCommands.RESOLVE_SELECTION);
	const complete = lines.every(line => selection[line.attributeId]);
	const submit = () => {
		const request: ResolveSelectionRequest = {
			product_template_id: record.id,
			selections: lines.map(line => ({ attribute_id: line.attributeId, value_id: selection[line.attributeId] })),
			expected_etag: record.etag,
			materialize_if_missing: true,
		};
		void resolve.publish(request);
	};
	// The counts are reloaded only once the dialog closes: reloading the record re-renders the page
	// under it and would drop the outcome the user is reading.
	const close = () => {
		if (resolve.data?.materialized || resolve.data?.outcome === 'restored') {
			record.refresh();
		}
		onClose();
	};
	return (
		<Modal opened onClose={close} title={text.t('product_template_config_resolveTitle')} centered>
			<Stack gap='sm' {...testAttrs(TEST_ID_PREFIX, 'resolveModal')}>
				<Text size='sm'>{text.t('product_template_config_resolveIntro')}</Text>
				{lines.map(line => (
					<Select
						key={line.key}
						label={attributeLabel(catalogue, line.attributeId, text)}
						data={line.valueIds.map(id => {
							const value = catalogue.values.get(id);
							return { value: id, label: value ? valueLabel(value, text) : id };
						})}
						value={selection[line.attributeId] ?? null}
						onChange={next => setSelection(previous => ({ ...previous, [line.attributeId]: next ?? '' }))}
						{...testAttrs(TEST_ID_PREFIX, 'resolveValue')}
					/>
				))}
				<ResolveOutcome
					data={resolve.data}
					errors={resolve.clientErrors.map(text.translateError)}
					text={text}
				/>
				<Group justify='flex-end'>
					<Button color='gray' onClick={close}>{text.t('common:action.close', { defaultValue: 'Close' })}</Button>
					<Button
						variant='filled'
						disabled={!complete}
						loading={resolve.isPending}
						onClick={submit}
						{...testAttrs(TEST_ID_PREFIX, 'resolveSubmit')}
					>
						{text.t('product_template_config_resolveSubmit')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

function ResolveOutcome({ data, errors, text }: {
	data: ResolveSelectionResponse | null,
	errors: string[],
	text: SectionText,
}): React.ReactNode {
	const variantsHref = useResourceBaseHref('inventory_product_variant');
	if (errors.length > 0) {
		return <Alert color='red' variant='light' {...testAttrs(TEST_ID_PREFIX, 'resolveError')}>{errors.join('\n')}</Alert>;
	}
	if (!data) {
		return null;
	}
	return (
		<Alert
			color={data.outcome === 'missing' ? 'gray' : 'green'}
			variant='light'
			{...testAttrs(TEST_ID_PREFIX, 'resolveOutcome')}
		>
			<Group justify='space-between'>
				<Text size='sm'>{text.t(`product_template_config_resolveOutcome_${data.outcome}`)}</Text>
				{data.variant_id && variantsHref ? (
					<LinkButton to={`${variantsHref}/${encodeURIComponent(data.variant_id)}`} relative='route'>
						{text.t('product_template_config_resolveOpen')}
					</LinkButton>
				) : null}
			</Group>
		</Alert>
	);
}

function lineMode(line: AttributeLineDraft, catalogue: AttributeCatalogue): string {
	return line.snapshot ?? catalogue.attributes.get(line.attributeId)?.mode ?? '';
}
