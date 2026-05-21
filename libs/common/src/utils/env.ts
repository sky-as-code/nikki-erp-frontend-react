
let isLocal = false;

export function setIsLocalEnv(value: boolean) {
	isLocal = value;
}

export function isLocalEnv() {
	return isLocal;
}