export const $and = (arr: any[]): boolean => {
	return arr.reduce((accumulator, currentValue) => accumulator && currentValue, true);
};

export const $or = (arr: any[]): boolean => {
	return arr.reduce((accumulator, currentValue) => accumulator || currentValue, false);
};

export const $in = (arr: any[], value: any): boolean => {
	return arr.includes(value);
};

export const $eqArr = (arr1: any[], arr2: any[]): boolean => {
	if (arr1.length !== arr2.length) return false;
	return arr1.every((value, index) => value === arr2[index]);
};
