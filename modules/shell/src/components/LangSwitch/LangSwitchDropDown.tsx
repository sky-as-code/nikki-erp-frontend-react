import { Box, Button, Image, Menu } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useEnabledLanguages } from '@nikkierp/shell/languages';
import { useLanguageCode } from '@nikkierp/shell/userContext';
import enIcon from '@nikkierp/ui/assets/icons/en.png';
import viIcon from '@nikkierp/ui/assets/icons/vi.png';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


const TEST_ID = 'shell.langSwitch';

/** An icon for the languages shipped today; a language without one is listed by name only. */
const ICONS: Record<string, string> = {
	'en-US': enIcon,
	'vi-VN': viIcon,
};

/**
 * The language switch of the public pages (sign-in), before anyone has a session.
 *
 * Lists the enabled languages from Essential's public list, and marks the language the page is
 * shown in -- read from i18n on every render, so it follows whoever changed it. A choice is written
 * to the Shell's local settings, which `ApplyStoredLanguage` applies and which survive sign-in.
 */
export const LangSwitchDropdown: React.FC = () => {
	const { i18n } = useTranslation();
	const languages = useEnabledLanguages();
	const { setLanguageCode } = useLanguageCode();
	const current = i18n.language;

	return (
		<Menu shadow='md' width={170} position='bottom-end'>
			<Menu.Target>
				<Button px={'xs'} variant='default' h={35} {...testAttrs(TEST_ID, 'trigger')}>
					<Box w={24} h={20} p={0} mx={3}><LanguageIcon isoCode={current} /></Box>
					<IconChevronDown size={14} color='var(--mantine-color-dimmed)' />
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{languages.map(language => (
					<Menu.Item
						key={language.isoCode}
						onClick={() => setLanguageCode(language.isoCode)}
						leftSection={<LanguageIcon isoCode={language.isoCode} />}
						rightSection={language.isoCode === current ? <IconCheck size={16} /> : null}
						fw={language.isoCode === current ? 700 : undefined}
						aria-current={language.isoCode === current ? 'true' : undefined}
						data-selected={language.isoCode === current ? 'true' : undefined}
						{...testAttrs(TEST_ID, 'option', language.isoCode)}
					>
						{language.name}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};

function LanguageIcon({ isoCode }: { isoCode: string }): React.ReactNode {
	const icon = ICONS[isoCode];
	return icon ? <Image width={20} height={20} fit='contain' src={icon} alt={isoCode} /> : null;
}
