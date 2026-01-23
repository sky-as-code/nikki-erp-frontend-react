import { Box, Button, Image, Menu } from '@mantine/core';
import enIcon from '@nikkierp/ui/assets/icons/en.png';
import viIcon from '@nikkierp/ui/assets/icons/vi.png';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';



export const LangSwitchDropdown: React.FC = () => {
	const { i18n } = useTranslation();
	const changeLang = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	const languages = [
		{ label: 'Tiếng Việt', value: 'vi', icon: <Image width={20} height={20} fit='contain' src={viIcon} alt='vi' /> },
		{ label: 'English', value: 'en', icon: <Image width={20} height={20} fit='contain' src={enIcon} alt='en' /> },
	];

	const langItems = languages.map((language) => (
		<Menu.Item
			key={language.value}
			onClick={() => changeLang(language.value)}
			leftSection={language.icon}
		>
			{language.label}
		</Menu.Item>
	));

	const selectedLang = languages.find((language) => language.value === i18n.language);

	return (
		<Menu shadow='md' width={150} position='bottom-end'>
			<Menu.Target>
				<Button px={'xs'} variant='default' h={35}>
					<Box w={24} h={20} p={0} mx={3}>{ selectedLang?.icon }</Box>
					<IconChevronDown size={14} color='var(--mantine-color-gray-7)' />
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{langItems}
			</Menu.Dropdown>
		</Menu>
	);
};