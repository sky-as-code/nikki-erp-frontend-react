import { Alert, Badge, Group, List, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';

import { combinationLabel, firstRows, holdsQuantity, previewVariantLabel } from './configPreview';
import { qualifiedValueLabel } from './ExclusionsTable';
import { TEST_ID_PREFIX, valueLabel } from './sectionText';

import type { AttributeCatalogue } from './attributeCatalogue';
import type { PendingPreview } from './configDraftState';
import type { ConfigPreview, PreviewCounts, PreviewVariant } from './configPreview';
import type { SectionText } from './sectionText';


const LIST_LIMIT = 10;
const COUNT_COLORS: Partial<Record<keyof PreviewCounts, string>> = {
	keep: 'gray', extend: 'teal', restore: 'cyan', create: 'green', archive: 'orange', delete: 'red',
};

type SummaryProps = { preview: ConfigPreview, catalogue: AttributeCatalogue, text: SectionText };

/** Asks the user to accept what the save would do to the variants, before the save goes out. */
export function PreviewConfirmModal({ pending, catalogue, text }: {
	pending: PendingPreview | null,
	catalogue: AttributeCatalogue,
	text: SectionText,
}): React.ReactNode {
	if (!pending) {
		return null;
	}
	return (
		<ConfirmModal
			opened
			size='lg'
			confirmColor='orange'
			title={text.t('product_template_config_previewTitle')}
			message={<PreviewSummary preview={pending.preview} catalogue={catalogue} text={text} />}
			confirmLabel={text.t('product_template_config_previewConfirm')}
			cancelLabel={text.t('common:action.cancel')}
			onConfirm={() => pending.answer(true)}
			onClose={() => pending.answer(false)}
			testId={`${TEST_ID_PREFIX}.preview`}
		/>
	);
}

function PreviewSummary({ preview, catalogue, text }: SummaryProps): React.ReactNode {
	const lookups = { catalogue, text };
	return (
		<Stack gap='sm' {...testAttrs(TEST_ID_PREFIX, 'previewSummary')}>
			<Text size='sm'>{text.t('product_template_config_previewIntro')}</Text>
			<PreviewCountBadges counts={preview.counts} text={text} />
			{preview.changes_identity ? (
				<Alert color='orange' variant='light' p='xs'>{text.t('product_template_config_previewIdentity')}</Alert>
			) : null}
			<PreCreateNote preview={preview} text={text} />
			<VariantList titleKey='product_template_config_previewCreateList' items={preview.create} {...lookups} />
			<VariantList titleKey='product_template_config_previewArchiveList' items={preview.archive} {...lookups} />
			<VariantList titleKey='product_template_config_previewDeleteList' items={preview.delete} {...lookups} />
			<InactiveExclusions preview={preview} catalogue={catalogue} text={text} />
		</Stack>
	);
}

function PreviewCountBadges({ counts, text }: { counts: PreviewCounts, text: SectionText }): React.ReactNode {
	const entries = (Object.keys(COUNT_COLORS) as (keyof PreviewCounts)[]).filter(key => counts[key] > 0);
	return (
		<Group gap={6}>
			{entries.map(key => (
				<Badge key={key} color={COUNT_COLORS[key]} variant='light' tt='none' {...testAttrs(TEST_ID_PREFIX, `count.${key}`)}>
					{text.t(`product_template_config_preview_${key}`, { count: counts[key] })}
				</Badge>
			))}
		</Group>
	);
}

/** Base vs complete wording: a mixed template pre-creates bases, and completes only on demand. */
function PreCreateNote({ preview, text }: { preview: ConfigPreview, text: SectionText }): React.ReactNode {
	const kind = preview.pre_create_kind === 'base' ? 'base' : 'complete';
	return (
		<Stack gap={2}>
			<Text size='sm'>
				{text.t(`product_template_config_previewPreCreate_${kind}`, { count: preview.pre_create_count })}
			</Text>
			<Text size='sm' c='dimmed'>
				{preview.possible_over_threshold || preview.possible_complete_count === null
					? text.t('product_template_config_overThreshold')
					: text.t('product_template_config_countPossible', { count: preview.possible_complete_count })}
			</Text>
		</Stack>
	);
}

function VariantList({ titleKey, items, catalogue, text }: {
	titleKey: string,
	items: PreviewVariant[] | null,
	catalogue: AttributeCatalogue,
	text: SectionText,
}): React.ReactNode {
	const { shown, hidden } = firstRows(items, LIST_LIMIT);
	if (shown.length === 0) {
		return null;
	}
	return (
		<Stack gap={2}>
			<Text size='sm' fw={600}>{text.t(titleKey)}</Text>
			<List size='sm' spacing={2}>
				{shown.map((item, index) => (
					<List.Item key={item.variant_id ?? `${item.combination_key}:${index}`}>
						<VariantLine item={item} catalogue={catalogue} text={text} />
					</List.Item>
				))}
			</List>
			{hidden > 0 ? (
				<Text size='xs' c='dimmed'>{text.t('product_template_config_previewMore', { count: hidden })}</Text>
			) : null}
		</Stack>
	);
}

function VariantLine({ item, catalogue, text }: {
	item: PreviewVariant,
	catalogue: AttributeCatalogue,
	text: SectionText,
}): React.ReactNode {
	const labelOf = (valueId: string) => {
		const value = catalogue.values.get(valueId);
		return value ? valueLabel(value, text) : valueId;
	};
	const parts = [
		previewVariantLabel(item, text.language, () => combinationLabel(
			item.value_ids ?? [], labelOf, text.t('product_template_config_previewDefault'),
		)),
		text.t(`variant_kind.${item.variant_kind}`),
		item.sku ? `SKU ${item.sku}` : '',
		item.primary_barcode ? text.t('product_template_config_previewBarcode', { barcode: item.primary_barcode }) : '',
		item.archive_reason ? text.t(`product_template_config_archiveReason_${item.archive_reason}`, {
			modules: (item.used_by ?? []).join(', '),
		}) : '',
	].filter(part => part !== '');
	return (
		<Text size='sm' component='span'>
			{parts.join(' · ')}
			{holdsQuantity(item.on_hand_quantity) ? (
				<Text span c='orange' size='sm'>
					{' · '}{text.t('product_template_config_previewOnHand', { quantity: item.on_hand_quantity })}
				</Text>
			) : null}
			{holdsQuantity(item.reserved_quantity) ? (
				<Text span c='orange' size='sm'>
					{' · '}{text.t('product_template_config_previewReserved', { quantity: item.reserved_quantity })}
				</Text>
			) : null}
		</Text>
	);
}

function InactiveExclusions({ preview, catalogue, text }: SummaryProps): React.ReactNode {
	const items = preview.inactive_exclusions ?? [];
	if (items.length === 0) {
		return null;
	}
	return (
		<Stack gap={2}>
			<Text size='sm' fw={600}>{text.t('product_template_config_previewInactiveExclusions')}</Text>
			<List size='sm' spacing={2}>
				{items.map(item => (
					<List.Item key={`${item.left_value_id}|${item.right_value_id}`}>
						{qualifiedValueLabel(catalogue, item.left_value_id, text)}
						{' × '}
						{qualifiedValueLabel(catalogue, item.right_value_id, text)}
					</List.Item>
				))}
			</List>
		</Stack>
	);
}
