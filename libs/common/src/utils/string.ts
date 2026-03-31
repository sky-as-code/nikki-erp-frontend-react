export const camelToSnakeCase = (str: string): string => {
	return str
		// userID → user_ID
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		// USERName → USER_Name (fix edge case)
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.toLowerCase();
};

export const camelToUpperSnakeCase = (str: string): string => {
	return camelToSnakeCase(str).toUpperCase();
};

export const snakeToCamelCase = (str: string): string => {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const splitByFromEnd = (str: string, step: number = 3): string[] => {
	const reversed = str.split('').reverse().join('');
	const chunks = reversed.match(new RegExp(`.{1,${step}}`, 'g')) || [];
	return chunks.map((chunk) => chunk.split('').reverse().join('')).reverse();
};

export const moneyToVietnameseText = (amount: number): string => {
	if (isNaN(amount)) return '';

	const units = ['', 'nghìn', 'triệu', 'tỷ'];
	const num = amount.toFixed(0);
	const numArr = splitByFromEnd(num.toString(), 3);
	const numArrWithUnit = numArr.map((item, index) => {
		return item !== '000' ? `${item} ${units[numArr.length - 1 - index]}` : '';
	});
	return [...numArrWithUnit, 'đồng'].join(' ').trim().replace(/\s+/g, ' ');
};

export function randomString(length: number): string {
	return Math.random().toString(36).substring(2, 2 + length);
}
