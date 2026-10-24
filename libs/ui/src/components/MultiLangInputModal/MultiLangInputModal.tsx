import { Button, Group, Stack, Text, Textarea, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { Modal } from '../Modal/Modal';


export type MultiLangInputModalProps = {
	opened: boolean,
	onClose: () => void,
	onSave: (value: dyn.ModelSchemaLangJson) => void,
	title: string,
	value?: dyn.ModelSchemaLangJson,
	supportedLngs: string[],
	currentLanguage: string,
};

/**
 * Fills the other languages from the current one. A language follows the current one while it is
 * empty or still holds what the current language held before this edit (`previousValue`), so typing
 * "Navy" keystroke by keystroke mirrors "Navy" rather than freezing the first letter; a language the
 * user translated differently is never touched.
 */
export function propagateCurrentLangToEmpty(
	langJson: dyn.ModelSchemaLangJson,
	currentLng: string,
	supportedLngs: string[],
	previousValue?: string,
): dyn.ModelSchemaLangJson {
	const currentValue = langJson[currentLng] ?? '';
	const result = { ...langJson, [currentLng]: currentValue };
	for (const lng of supportedLngs) {
		if (lng === currentLng) {
			continue;
		}
		const other = result[lng] ?? '';
		if (!other.trim() || (previousValue !== undefined && previousValue !== '' && other === previousValue)) {
			result[lng] = currentValue;
		}
	}
	return result;
}

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

export function MultiLangInputModal({
	opened, onClose, onSave, title, value = {}, supportedLngs, currentLanguage,
}: MultiLangInputModalProps): React.ReactNode {
	const [localValues, setLocalValues] = React.useState<Record<string, string>>({});

	React.useEffect(() => {
		if (!opened) {
			return;
		}
		const initial: Record<string, string> = {};
		for (const lng of supportedLngs) {
			initial[lng] = value[lng] ?? '';
		}
		setLocalValues(initial);
	}, [opened, value, supportedLngs]);

	const handleSave = () => {
		const result: dyn.ModelSchemaLangJson = {};
		for (const lng of supportedLngs) {
			result[lng] = localValues[lng] ?? '';
		}
		onSave(propagateCurrentLangToEmpty(result, currentLanguage, supportedLngs));
		onClose();
	};

	const handleChange = (lng: string, text: string) => {
		setLocalValues(prev => ({ ...prev, [lng]: text }));
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>{title}</Title>}
			size='lg'
			centered
		>
			<Stack gap='md'>
				{supportedLngs.map(lng => (
					<Textarea
						key={lng}
						label={<Text size='sm' fw={500}>{getLanguageLabel(lng)}</Text>}
						value={localValues[lng] ?? ''}
						onChange={e => handleChange(lng, e.target.value)}
						autosize
						minRows={3}
					/>
				))}
				<Group justify='flex-end' mt='xs'>
					<Button variant='filled' onClick={handleSave}>Save</Button>
					<Button variant='subtle' onClick={onClose}>Discard</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
