import { Group, Stack, Text, Textarea, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { fillFromNeighbours, sortLanguageCodes } from './langJson';
import { useTranslate } from '../../i18n';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';


export type MultiLangInputModalProps = {
	opened: boolean,
	onClose: () => void,
	onSave: (value: dyn.ModelSchemaLangJson) => void,
	/** The localized label of the field being translated; the modal title names it. */
	title: string,
	value?: dyn.ModelSchemaLangJson,
	supportedLngs: string[],
};

function getLanguageLabel(lng: string): string {
	try {
		const [langBase] = lng.split('-');
		const englishName = new Intl.DisplayNames(['en'], { type: 'language' }).of(lng) ?? lng;
		const nativeName = new Intl.DisplayNames([langBase], { type: 'language' }).of(langBase) ?? '';
		if (!nativeName || nativeName === englishName) {
			return englishName;
		}
		return `${englishName} / ${nativeName}`;
	}
	catch {
		return lng;
	}
}

/**
 * What Save submits: every language filled from its neighbours in code order, or `{}` when the
 * user left them all blank — the same "no value" the input produces when cleared.
 */
export function buildSavedTranslations(
	localValues: Record<string, string>, sortedLngs: readonly string[],
): dyn.ModelSchemaLangJson {
	const result: dyn.ModelSchemaLangJson = {};
	for (const lng of sortedLngs) {
		result[lng] = localValues[lng] ?? '';
	}
	if (sortedLngs.every(lng => !result[lng].trim())) {
		return {};
	}
	return fillFromNeighbours(result, sortedLngs);
}

export function MultiLangInputModal({
	opened, onClose, onSave, title, value = {}, supportedLngs,
}: MultiLangInputModalProps): React.ReactNode {
	const t = useTranslate();
	const [localValues, setLocalValues] = React.useState<Record<string, string>>({});
	const sortedLngs = React.useMemo(() => sortLanguageCodes(supportedLngs), [supportedLngs]);

	React.useEffect(() => {
		if (!opened) {
			return;
		}
		const initial: Record<string, string> = {};
		for (const lng of sortedLngs) {
			initial[lng] = value[lng] ?? '';
		}
		setLocalValues(initial);
	}, [opened, value, sortedLngs]);

	const handleSave = () => {
		onSave(buildSavedTranslations(localValues, sortedLngs));
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>{t('translatable.modalTitle', { field: title })}</Title>}
			size='lg'
			centered
		>
			<Stack gap='md'>
				{sortedLngs.map(lng => (
					<Textarea
						key={lng}
						label={<Text size='sm' fw={500}>{getLanguageLabel(lng)}</Text>}
						value={localValues[lng] ?? ''}
						onChange={e => setLocalValues(prev => ({ ...prev, [lng]: e.target.value }))}
						autosize
						minRows={3}
					/>
				))}
				<Group justify='flex-end' mt='xs'>
					<Button variant='filled' onClick={handleSave}>{t('translatable.save')}</Button>
					<Button variant='subtle' onClick={onClose}>{t('translatable.discard')}</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
