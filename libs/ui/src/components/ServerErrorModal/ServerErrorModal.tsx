import { Group, List, Stack, Text } from '@mantine/core';
import { EventBus } from '@nikkierp/common/eventBus';
import { CLIENT_ERROR_MODAL_TOPIC } from '@nikkierp/common/service';
import { testAttrs } from '@nikkierp/common/utils';
import { IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';

import { useTranslate } from '../../i18n';
import { Button } from '../Button';
import { Modal } from '../Modal/Modal';

import type { ClientErrorModalEvent } from '@nikkierp/common/service';


export type ServerErrorModalProps = {
	opened: boolean,
	onClose: () => void,
	/** Translated messages; one is shown as a sentence, several as a list. */
	messages: string[],
};

function ServerErrorMessages({ messages }: { messages: string[] }): React.ReactElement {
	if (messages.length === 1) {
		return <Text {...testAttrs('ui.serverErrorModal', 'message')}>{messages[0]}</Text>;
	}
	return (
		<List spacing='xs' {...testAttrs('ui.serverErrorModal', 'messages')}>
			{messages.map(message => <List.Item key={message}>{message}</List.Item>)}
		</List>
	);
}

/** A rejection the server returned for no input on screen: a record-level rule, or a delete refused. */
export function ServerErrorModal({ opened, onClose, messages }: ServerErrorModalProps): React.ReactElement {
	const t = useTranslate('common');
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='xs'>
					<IconAlertTriangle size={20} />
					<Text fw={700} fz='lg'>
						{t('common:error.modalTitle', { defaultValue: 'The action could not be completed' })}
					</Text>
				</Group>
			}
			size='md'
			centered
			{...testAttrs('ui.serverErrorModal', 'modal')}
		>
			<Stack gap='md'>
				<ServerErrorMessages messages={messages} />
				<Group justify='flex-end'>
					<Button variant='outline' color='gray' onClick={onClose} {...testAttrs('ui.serverErrorModal', 'close')}>
						{t('common:action.close', { defaultValue: 'Close' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

function mergeMessages(current: string[], incoming: string[]): string[] {
	return [...new Set([...current, ...incoming])];
}

/**
 * The one error modal of the app, opened by `showClientErrorModal` (`@nikkierp/common/service`).
 * Rejections arriving while it is open join the list instead of replacing it.
 */
export function ServerErrorModalHost(): React.ReactElement {
	const [messages, setMessages] = React.useState<string[]>([]);
	React.useEffect(
		() => EventBus.instance?.subscribe(
			CLIENT_ERROR_MODAL_TOPIC,
			(event: ClientErrorModalEvent) => setMessages(current => mergeMessages(current, event.messages)),
		),
		[],
	);
	return <ServerErrorModal opened={messages.length > 0} onClose={() => setMessages([])} messages={messages} />;
}
