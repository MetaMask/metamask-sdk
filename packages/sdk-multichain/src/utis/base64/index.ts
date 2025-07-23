/**
 * Base64 encode string for URL params
 */
export function base64Encode(str: string): string {
	let base64string: string;

	if (typeof Buffer !== 'undefined') {
		base64string = Buffer.from(str, 'utf8').toString('base64');
	} else if (typeof btoa === 'function') {
		base64string = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/gu, (_match, p1) => String.fromCharCode(parseInt(p1, 16))));
	} else if (typeof global === 'object' && 'Buffer' in global) {
		base64string = global.Buffer.from(str, 'utf8').toString('base64');
	} else {
		throw new Error('Unable to base64 encode: No available method.');
	}
	return base64string;
}

export const getBase64FromUrl = async (url: string): Promise<string> => {
	const data = await fetch(url);
	const blob = await data.blob();
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = () => {
			const base64data = reader.result as string;
			resolve(base64data);
		};
	});
};
