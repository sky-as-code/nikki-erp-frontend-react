export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//* Tính toán delay với backoff + jitter
export const exponentialBackoff = (attempt: number, baseDelay = 5000) => {
	const maxJitter = baseDelay / 2;
	const jitter = Math.random() * maxJitter;
	return Math.min(baseDelay * 2 ** (attempt - 1) + jitter, 30000); // Giới hạn tối đa 30s
};
