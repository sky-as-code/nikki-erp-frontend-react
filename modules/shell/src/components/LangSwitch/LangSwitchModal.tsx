import { Box, Flex, Modal, Radio, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { testAttrs } from '@nikkierp/common/utils';
import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { useShellCommand } from '@nikkierp/shell/commandBus';
import { useUIState } from '@nikkierp/shell/contexts';
import { useEnabledLanguages } from '@nikkierp/shell/languages';
import { useLanguageCode } from '@nikkierp/shell/userContext';
import { useTranslate } from '@nikkierp/ui/i18n';
import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './LangSwitchModal.module.css';


export interface LangSwitchModalRef {
	open: () => void;
	close: () => void;
}

export const LangSwitchModal = forwardRef<LangSwitchModalRef>((props, ref) => {
	const [opened, { open, close }] = useDisclosure(false);
	const t = useTranslate('common');

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
						<Text w={'100%'} size='xl' fw={700} ta='center'>{t('profile.language')}</Text>
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

const TEST_ID = 'shell.langSwitchModal';

/** Restated rather than imported: the Shell never imports a module. See `ThemeSwitchModal`. */
const SETTINGS_SET_COMMAND = 'settings.settings.set_settings';

/** A flag for the languages shipped today; a language without one is listed without an icon. */
const FLAGS: Record<string, string> = {
	'en-US': '🇺🇸',
	'vi-VN': '🇻🇳',
};

function LangSwitcher(): React.ReactNode {
	const t = useTranslate('common');
	const { i18n } = useTranslation();
	const languages = useEnabledLanguages();
	const { setLanguageCode } = useLanguageCode();
	const persistLanguage = usePersistLanguage();
	// Derived from i18n on every render, never held in state: the selection must name the language
	// the interface is actually shown in, whoever changed it.
	const current = languages.find(language => language.isoCode === i18n.language)?.isoCode ?? null;

	const handleChange = (code: string) => {
		if (code === current) return;
		setLanguageCode(code);
		void persistLanguage(code);
	};

	return (
		<Radio.Group
			value={current}
			onChange={handleChange}
			label={t('profile.languagePick')}
			description={t('profile.languagePickHint')}
		>
			<Stack pt='md' gap='xs'>
				{languages.map(language => (
					<Radio.Card
						className={classes.root}
						radius='md'
						value={language.isoCode}
						key={language.isoCode}
						{...testAttrs(TEST_ID, 'option', language.isoCode)}
					>
						<Flex wrap='nowrap' align='center' justify='flex-start'>
							<Box mr='md' fz={24} lh='24px'>{FLAGS[language.isoCode] ?? ''}</Box>
							<Text w='100%' className={classes.label}>{language.name}</Text>
							<Radio.Indicator />
						</Flex>
					</Radio.Card>
				))}
			</Stack>
		</Radio.Group>
	);
}

/**
 * Saves the choice as the user's `essential.language`, so it follows them to the next sign-in.
 *
 * The local choice is applied first and kept when the save fails -- for instance when a tenant
 * policy forbids a user override -- exactly as the theme choice is.
 */
function usePersistLanguage(): (code: string) => Promise<void> {
	const t = useTranslate('common');
	const isAuthenticated = useIsAuthenticated();
	const { notification } = useUIState();
	const { publish } = useShellCommand(SETTINGS_SET_COMMAND);

	return useCallback(async (code: string) => {
		if (!isAuthenticated) return;
		const response = await publish({
			level: 'user',
			moduleKey: 'essential',
			items: [{ name: 'language', value: code }],
		});
		if (response.error != null || response.result?.clientErrors?.length) {
			notification.showError(t('language.saveFailed'), t('messages.error'));
		}
	}, [isAuthenticated, notification, publish, t]);
}
