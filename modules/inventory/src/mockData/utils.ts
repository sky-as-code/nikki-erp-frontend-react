export const MOCK_DELAY_MS = 240;

export const waitMock = (duration = MOCK_DELAY_MS) => new Promise((resolve) => {
	setTimeout(resolve, duration);
});

export const nowIso = () => new Date().toISOString();

export const nextId = (prefix: string, collection: Array<{ id: string }>) => {
	const currentMax = collection
		.map((item) => Number(item.id.replace(`${prefix}-`, '')))
		.filter((value) => Number.isFinite(value))
		.reduce((max, value) => Math.max(max, value), 0);
	return `${prefix}-${currentMax + 1}`;
};

export const nextEtag = () => `etag-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
