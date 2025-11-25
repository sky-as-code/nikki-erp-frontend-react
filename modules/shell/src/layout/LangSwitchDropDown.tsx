import { Button, Menu } from '@mantine/core';
import { useTranslation } from 'react-i18next';


export const LangSwitchDropdown: React.FC = () => {
	const { i18n } = useTranslation();
	const changeLang = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	return (
		<Menu shadow='md' width={200}>
			<Menu.Target>
				<Button w={35} h={35} p={0} variant='outline'>
					{i18n.language}
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Item onClick={() => changeLang('vi')} leftSection={'🍎'}> Tiếng Việt</Menu.Item>
				<Menu.Item  onClick={() => changeLang('en')} leftSection={'🍌'}> English</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};