export const camelToSnakeCase = (str: string): string => {
	return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
};

export const camelToUpperSnakeCase = (str: string): string => {
	return str.replace(/[A-Z]/g, (match) => `_${match}`).toUpperCase();
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
