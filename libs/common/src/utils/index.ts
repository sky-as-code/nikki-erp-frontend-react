
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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
