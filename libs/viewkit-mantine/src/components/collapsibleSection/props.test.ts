import { describe, expect, it } from 'vitest';

import { collapsibleSectionPropsSchema } from './props';


describe('collapsibleSectionPropsSchema', () => {
	it('makes a titled block collapsible by default', () => {
		const props = collapsibleSectionPropsSchema.parse({ header: 'a.b', translationNs: 'iam' });

		expect(props.collapsible).toBe(true);
	});

	it('makes an untitled block collapsible too, by its bare caret', () => {
		expect(collapsibleSectionPropsSchema.parse({}).collapsible).toBe(true);
	});

	it('allows a title that cannot be collapsed', () => {
		const props = collapsibleSectionPropsSchema.parse({
			header: 'a.b', translationNs: 'iam', collapsible: false,
		});

		expect(props.collapsible).toBe(false);
	});

	it('rejects a header without the namespace that resolves it', () => {
		expect(() => collapsibleSectionPropsSchema.parse({ header: 'a.b' })).toThrow();
		expect(() => collapsibleSectionPropsSchema.parse({ translationNs: 'iam' })).toThrow();
	});

	it('allows a toggle with no header, as a bare caret', () => {
		const props = collapsibleSectionPropsSchema.parse({ collapsible: true });

		expect(props.collapsible).toBe(true);
		expect(props.header).toBeUndefined();
	});

	// The builder parses at authoring time and the renderer parses again at render time, so a
	// round trip through `.strict()` has to survive the defaults the first parse filled in.
	it('is idempotent, as the render-time re-parse requires', () => {
		const once = collapsibleSectionPropsSchema.parse({ header: 'a.b', translationNs: 'iam' });

		expect(collapsibleSectionPropsSchema.parse(once)).toEqual(once);
	});

	// A section holding a table or a custom widget must keep flowing normally; only one holding
	// `resource_form__column`s opts into the block grid.
	it('defaults `layout` to a plain stack', () => {
		expect(collapsibleSectionPropsSchema.parse({ collapsible: false }).layout).toBe('stack');
	});

	it('accepts the form-block grid opt-in', () => {
		const props = collapsibleSectionPropsSchema.parse({
			header: 'a.b', translationNs: 'iam', layout: 'formBlocks',
		});

		expect(props.layout).toBe('formBlocks');
		// The render-time re-parse must survive it, like every other default.
		expect(collapsibleSectionPropsSchema.parse(props)).toEqual(props);
	});

	it('rejects an unknown layout', () => {
		expect(() => collapsibleSectionPropsSchema.parse({ layout: 'grid' })).toThrow();
	});

	it('validates through the Standard Schema interface the engine uses', () => {
		const result = collapsibleSectionPropsSchema['~standard'].validate({ collapsible: false });

		expect(result).not.toBeInstanceOf(Promise);
		expect((result as { issues?: unknown }).issues).toBeUndefined();
	});
});
