import { describe, expect, it, vi } from 'vitest';

import { ReservedVendorError, ViewEngineConflictError, VIEW_ENGINE_API_VERSION } from '../core';
import { createViewEngine } from './createViewEngine';
import { resolveRoutePath } from '../metadata/compilePage';

import type { IPageTemplate, IViewKit } from '../core';
import type { PageNode } from '../metadata/types';


const passThroughSchema = {
	'~standard': {
		version: 1 as const,
		vendor: 'test',
		validate: (value: unknown) => ({ value }),
	},
};

function template(id: string, extra: Partial<IPageTemplate> = {}): IPageTemplate {
	return { id, propsSchema: passThroughSchema, render: () => null, ...extra };
}

function kit(id: string, contribute: IViewKit['contribute']): IViewKit {
	return { id, version: '1.0.0', engineApiVersions: [VIEW_ENGINE_API_VERSION], contribute };
}

describe('ViewEngine conflict policy', () => {
	it('throws on a duplicate id instead of silently overwriting', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		engine.registerPageTemplate(template('acme.kit.pages.a.v1'));

		expect(() => engine.registerPageTemplate(template('acme.kit.pages.a.v1')))
			.toThrow(ViewEngineConflictError);
	});

	it('allows a deliberate override', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		engine.registerPageTemplate(template('acme.kit.pages.a.v1'));

		const replacement = template('acme.kit.pages.a.v1');
		engine.registerPageTemplate(replacement, { override: true });

		expect(engine.getPageTemplate('acme.kit.pages.a.v1')).toBe(replacement);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it('refuses to let a third-party kit create a reserved nikkierp.* id', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		const squatter = kit('acme.crm', registry => {
			registry.registerPageTemplate(template('nikkierp.mantine.pages.templates.future.v1'));
		});

		expect(() => engine.use(squatter)).toThrow(ReservedVendorError);
	});

	it('installs a kit only once', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		const contribute = vi.fn();

		engine.use(kit('acme.crm', contribute));
		engine.use(kit('acme.crm', contribute));

		expect(contribute).toHaveBeenCalledTimes(1);
	});

	it('rejects a kit built against a different engine API level', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		const future: IViewKit = {
			id: 'acme.crm', version: '1.0.0', engineApiVersions: [99], contribute: () => undefined,
		};

		expect(() => engine.use(future)).toThrow(/engine API/);
	});
});

describe('route shape', () => {
	const node: PageNode = { type: 'page', routePath: 'users', template: 'acme.kit.pages.split.v1' };

	it('uses the route path verbatim when the template contributes no pattern', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		engine.registerPageTemplate(template('acme.kit.pages.split.v1'));

		expect(resolveRoutePath(node, engine)).toBe('users');
	});

	it('lets the template contribute its own pattern', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		engine.registerPageTemplate(template('acme.kit.pages.split.v1', {
			routePattern: n => `${n.routePath}/:id?`,
		}));

		expect(resolveRoutePath(node, engine)).toBe('users/:id?');
	});

	it('falls back to the route path for an unknown template', () => {
		const engine = createViewEngine({ instanceId: 'test' });

		expect(resolveRoutePath(node, engine)).toBe('users');
	});
});

describe('field renderers', () => {
	it('resolves a serializable spec through the registered factory', () => {
		const engine = createViewEngine({ instanceId: 'test' });
		engine.registerFieldRenderer('badge', spec => ({
			render: () => null,
			translationKey: (value: string) => `${String(spec.prefix ?? '')}${value}`,
		}));

		const resolved = engine.resolveFieldRenderers({ status: { renderer: 'badge', prefix: 'status.' } });

		expect(resolved?.status?.translationKey?.('active')).toBe('status.active');
	});
});
