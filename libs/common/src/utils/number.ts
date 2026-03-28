export enum Currency {
	VND = 'VND',
	USD = 'USD',
	POINT = 'POINT',
}

export const formatCurrency = {
	[Currency.VND]: (value: number = 0) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(value);
	},

	[Currency.USD]: (value: number = 0) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(value);
	},

	[Currency.POINT]: (value: number = 0) => {
		return (
			new Intl.NumberFormat('vi-VN', {
				style: 'decimal',
			}).format(value) +
            ' ' +
            '✪'
		);
	},
};
