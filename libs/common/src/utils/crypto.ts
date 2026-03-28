export function encodeBase64(text: string): string {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(text);
	const base64 = btoa(String.fromCharCode(...bytes));
	return base64;
}

export function decodeBase64(base64: string): string {
	const binary = atob(base64);
	const decodedBytes = new Uint8Array([...binary].map(ch => ch.charCodeAt(0)));
	const decoded = new TextDecoder().decode(decodedBytes);
	return decoded;
}

export function encodeFileName(fileName: string): string {
	const decodedURIName = decodeURIComponent(fileName);

	const parts = decodedURIName.split('.');
	if (parts.length < 2) return encodeBase64(decodedURIName);

	const ext = parts.pop();
	const name = parts.join('.');

	return `${encodeBase64(name)}.${ext}`;
};
