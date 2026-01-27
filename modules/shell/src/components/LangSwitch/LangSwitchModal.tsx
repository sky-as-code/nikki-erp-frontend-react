import { Modal, Text, Radio, Stack, Flex, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './LangSwitchModal.module.css';


export interface LangSwitchModalRef {
	open: () => void;
	close: () => void;
}

export const LangSwitchModal = forwardRef<LangSwitchModalRef>((props, ref) => {
	const [opened, { open, close }] = useDisclosure(false);
	const { t: translate } = useTranslation();

	useImperativeHandle(ref, () => ({
		open,
		close,
	}));

	return (
		<Modal.Root centered opened={opened} onClose={close}>
			<Modal.Overlay />
			<Modal.Content radius={'md'}>
				<Modal.Header>
					<Modal.Title className='flex justify-between items-center' w={'100%'}>
						<Text w={'100%'} size='xl' fw={700} ta='center'>{translate('nikki.shell.profileMenu.language')}</Text>
						<Modal.CloseButton />
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<LangSwitcher />
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});

LangSwitchModal.displayName = 'LangSwitchModal';

interface LanguageItem {
	name: string;
	value: string;
	icon: React.ReactNode;
	description?: string;
	disabled?: boolean;
}

const LangSwitcher: React.FC = () => {
	const { i18n } = useTranslation();

	const data: LanguageItem[] = [
		{ name: 'Tiếng Việt', value: 'vi', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇻🇳</Box>, disabled: false },
		{ name: 'English', value: 'en', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇺🇸</Box>, disabled: false },
		{ name: '中文', value: 'zh', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇨🇳</Box>, disabled: true },
		{ name: '日本語', value: 'ja', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇯🇵</Box>, disabled: true },
		{ name: '한국어', value: 'ko', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇰🇷</Box>, disabled: true },
		{ name: 'Français', value: 'fr', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇫🇷</Box>, disabled: true },
		{ name: 'Deutsch', value: 'de', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇩🇪</Box>, disabled: true },
		{ name: 'Español', value: 'es', icon: <Box style={{ fontSize: '24px', lineHeight: '24px' }}>🇪🇸</Box>, disabled: true },
	];

	// Get current language or default to first enabled language
	const getCurrentValue = () => {
		const currentLang = data.find((item) => item.value === i18n.language && !item.disabled);
		return currentLang?.value || data.find((item) => !item.disabled)?.value || null;
	};

	const [value, setValue] = useState<string | null>(getCurrentValue());

	const changeLang = (lang: string) => {
		const selectedLang = data.find((item) => item.value === lang);
		// Only allow changing to enabled languages
		if (selectedLang && !selectedLang.disabled) {
			i18n.changeLanguage(lang);
			setValue(lang);
		}
	};


	const cards = data.map((item) => (
		<Radio.Card
			className={classes.root}
			radius='md'
			value={item.value}
			key={item.value}
			disabled={item.disabled}
			style={{
				opacity: item.disabled ? 0.5 : 1,
				cursor: item.disabled ? 'not-allowed' : 'pointer',
			}}
		>
			<Flex wrap='nowrap' align='center' justify='flex-start'>
				<Box mr={'md'}>{item.icon}</Box>
				<Text w='100%' className={classes.label} c={item.disabled ? 'dimmed' : undefined}>
					{item.name}
					{item.disabled && (
						<Text component='span' size='xs' c='dimmed' ml='xs'>
							(Coming soon)
						</Text>
					)}
				</Text>
				<Radio.Indicator />
			</Flex>
		</Radio.Card>
	));

	return (
		<Radio.Group
			value={value}
			onChange={(value) => changeLang(value as string)}
			label='Pick your language'
			description='Choose a language that you will use in your application'
		>
			<Stack pt='md' gap='xs'>
				{cards}
			</Stack>
		</Radio.Group>
	);
};
