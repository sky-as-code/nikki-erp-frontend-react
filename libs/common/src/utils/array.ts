export const mergeArrayByKeys = <T = any>(
	arr1: T[],
	arr2: T[],
	overrideKeys: (keyof T)[],
	getId: (itm: T) => string = (itm: any) => itm?._id || '',
) => {
	const map = new Map<string, T>();
	const push = (item: T) => {
		const key = getId(item);
		const current = map.get(key);

		if (current) {
			const newItem = { ...current };
			overrideKeys.forEach((okey) => {
				newItem[okey] = item[okey] as any;
			});
			map.set(key, newItem);
		}
		else {
			//* Clone để tránh mutate input
			map.set(key, { ...item });
		}
	};

	arr1.forEach(push);
	arr2.forEach(push);

	return Array.from(map.values());
};
