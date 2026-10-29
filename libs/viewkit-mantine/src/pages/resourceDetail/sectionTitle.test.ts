import { describe, expect, it } from 'vitest';

import { isGeneralInformationKey } from './sectionTitle';


describe('isGeneralInformationKey', () => {
	it.each(['form.generalInformation', 'common:form.generalInformation', 'inventory:form.generalInformation'])(
		'matches %s', key => expect(isGeneralInformationKey(key)).toBe(true),
	);

	it.each([undefined, 'form.audit', 'form.generalInformationExtra'])('ignores %s', key => {
		expect(isGeneralInformationKey(key)).toBe(false);
	});
});
