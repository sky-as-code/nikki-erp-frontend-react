/* eslint-disable max-lines-per-function */
import { Box, Button, Modal, Stack, Text } from '@mantine/core';
import { IconPlayerPlay, IconRefresh } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Game, GameVersion } from '../../types';


export interface GamePreviewProps {
	game: Game | undefined;
	version?: GameVersion;
}

export const GamePreview: React.FC<GamePreviewProps> = ({ game, version }) => {
	const { t: translate } = useTranslation();
	const [opened, setOpened] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	if (!game) {
		return null;
	}

	const gameVersion = version || game.versions.find((v) => v.code === game.latestVersion) || game.versions[0];

	if (!gameVersion) {
		return (
			<Box p='md'>
				<Text c='dimmed'>{translate('nikki.vendingMachine.games.messages.no_version')}</Text>
			</Box>
		);
	}

	const handleOpenPreview = () => {
		setOpened(true);
	};

	const handleClosePreview = () => {
		setOpened(false);
	};

	const handleReloadGame = () => {
		if (iframeRef.current && gameVersion && gameVersion.source) {
			try {
				// Clear and reload the game source
				iframeRef.current.srcdoc = '';
				requestAnimationFrame(() => {
					if (iframeRef.current && gameVersion.source) {
						iframeRef.current.srcdoc = gameVersion.source;
					}
				});
			}
			catch (error) {
				console.error('Error reloading game:', error);
			}
		}
	};

	React.useEffect(() => {
		if (opened && gameVersion && gameVersion.source) {
			let cancelled = false;
			// Use requestAnimationFrame to ensure iframe is mounted before setting srcdoc
			const rafId1 = requestAnimationFrame(() => {
				// Double RAF to ensure DOM is fully rendered
				requestAnimationFrame(() => {
					if (!cancelled && iframeRef.current) {
						try {
							// Use srcdoc to directly inject HTML, which works better with sandbox
							iframeRef.current.srcdoc = gameVersion.source;
						}
						catch (error) {
							console.error('Error loading game:', error);
							if (iframeRef.current) {
								iframeRef.current.srcdoc = `
									<html>
										<body style="padding: 20px; font-family: Arial;">
											<h2 style="color: red;">Error loading game</h2>
											<p>Please check the game source code.</p>
											<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error instanceof Error ? error.message : String(error)}</pre>
										</body>
									</html>
								`;
							}
						}
					}
				});
			});

			return () => {
				cancelled = true;
				cancelAnimationFrame(rafId1);
			};
		}
		else if (!opened && iframeRef.current) {
			// Clear iframe when modal is closed
			iframeRef.current.srcdoc = '';
		}
	}, [opened, gameVersion]);

	return (
		<>
			<Stack gap='sm'>
				<Button
					leftSection={<IconPlayerPlay size={16} />}
					onClick={handleOpenPreview}
					variant='light'
					color='blue'
					fullWidth
				>
					{translate('nikki.vendingMachine.games.actions.play')}
				</Button>
				<Text size='xs' c='dimmed' ta='center'>
					{translate('nikki.vendingMachine.games.messages.preview_hint')}
				</Text>
			</Stack>

			<Modal
				opened={opened}
				onClose={handleClosePreview}
				title={game.name + ' ' + gameVersion.code}
				fullScreen
				styles={{
					body: {
						padding: 0,
						height: '100%',
						maxHeight: 800,
					},
				}}
			>
				<Box
					style={{
						width: '100%',
						height: '100%',
						position: 'relative',
					}}
				>
					<Button
						onClick={handleReloadGame}
						variant='filled'
						color='blue'
						size='sm'
						leftSection={<IconRefresh size={16} />}
						style={{
							position: 'absolute',
							top: 16,
							right: 16,
							zIndex: 10,
						}}
					>
						{translate('nikki.vendingMachine.games.actions.reload')}
					</Button>
					<iframe
						ref={iframeRef}
						style={{
							width: '100%',
							height: '100%',
							border: 'none',
							display: 'block',
						}}
						title={game.name}
						sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
					/>
				</Box>
			</Modal>
		</>
	);
};
