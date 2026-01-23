import { Button, Flex, Modal, useMantineColorScheme, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrightnessFilled, IconMoonStars, IconSun } from '@tabler/icons-react';
import { forwardRef, useImperativeHandle } from 'react';


export const ThemeSwitchModal = forwardRef((props, ref) => {
	const [opened, { open, close }] = useDisclosure(false);

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
						<Text w={'100%'} size='xl' fw={700} ta='center'>Theme Mode</Text>
						<Modal.CloseButton />
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Flex justify='center' align='center' mih={150}>
						<ThemeSwitcher/>
					</Flex>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>


	);
});


const ThemeSwitcher = () => {
	const { colorScheme, setColorScheme } = useMantineColorScheme();

	const themes = [
		{ label: 'Light', value: 'light', icon: <IconSun size={30} /> },
		{ label: 'Dark', value: 'dark', icon: <IconMoonStars size={30} /> },
		{ label: 'Auto', value: 'auto', icon: <IconBrightnessFilled size={30} /> },
	];

	return (
		<Flex gap='md'>
			{themes.map((theme) => (
				<Button
					key={theme.value}
					variant='subtle'
					h={80} w={80} p={0}
					bd={'1px solid black'} radius='sm'
					bg={colorScheme === theme.value ? 'var(--mantine-color-gray-6)' : 'transparent'}
					color={colorScheme === theme.value ? 'var(--nikki-color-black)' : 'dark:var(--nikki-color-white) light:var(--nikki-color-black)'}
					onClick={() => setColorScheme(theme.value as any)}
				>
					<Flex direction='column' align='center' gap={4}>
						{theme.icon}
						<Text size='sm' fw={700} ta='center'>{theme.label}</Text>
					</Flex>
				</Button>
			))}
		</Flex>
	);
};
