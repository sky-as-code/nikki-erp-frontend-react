import { Box, Text } from '@mantine/core';


export function FilePreview({ streamUrl, mime, name }: { streamUrl: string; mime: string; name: string; }) {
	const renderPreview = () => {
		if (mime.startsWith('image/')) {
			return <img src={streamUrl} alt={name} style={{ width: '100%' }} />;
		}
		if (mime.startsWith('video/')) {
			return (
				<video controls style={{ width: '100%' }}>
					<source src={streamUrl} type={mime} />
				</video>
			);
		}
		if (mime.startsWith('audio/')) {
			return (
				<audio controls style={{ width: '100%' }}>
					<source src={streamUrl} type={mime} />
				</audio>
			);
		}
		if (mime === 'application/pdf') {
			return <iframe src={streamUrl} style={{ width: '100%', height: '600px', border: 'none' }} />;
		}
		return null;
	};

	const preview = renderPreview();

	return <Box miw={'600px'}>
		{preview ?? <Text>Không hỗ trợ xem trước</Text>}
	</Box>;
}
