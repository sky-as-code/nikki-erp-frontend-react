import { describe, expect, it, vi } from 'vitest';

import { translateClientError } from './clientErrorTranslate';


describe('translateClientError', () => {
	it('passes the key, the vars and the server message as default value', () => {
		const t = vi.fn(() => 'translated');
		const item = { key: 'iam:err_x', message: 'Server text', vars: { name: 'Bob' } };

		expect(translateClientError(t, item)).toBe('translated');
		expect(t).toHaveBeenCalledWith('iam:err_x', { name: 'Bob', defaultValue: 'Server text' });
	});

	it('joins array vars with a comma', () => {
		const t = vi.fn((_key: string, opts: Record<string, unknown>) => String(opts.used_by));
		const item = { key: 'common:x', message: '', vars: { used_by: ['inventory', 'sales'] } };

		expect(translateClientError(t, item)).toBe('inventory, sales');
	});

	it('returns the message when there is no key', () => {
		const t = vi.fn(() => 'never');

		expect(translateClientError(t, { key: '', message: 'Raw', vars: undefined })).toBe('Raw');
		expect(t).not.toHaveBeenCalled();
	});
});
