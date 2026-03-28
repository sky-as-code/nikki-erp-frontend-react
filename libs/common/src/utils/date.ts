
// * convert time "10:30" to decimal 10.5
export const timeToDecimal = (time: string): number => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours + minutes / 60;
};

