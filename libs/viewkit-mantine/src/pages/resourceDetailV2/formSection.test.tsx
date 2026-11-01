// @vitest-environment jsdom
import { AdhocFormProvider, AutoField } from '@nikkierp/ui/components/form';
import { act, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderInDetailPage } from './audit/auditTestHarness';
import { entryKeys, FieldPair, FieldRuns, FormSection } from './formSection';
import classes from './ResourceDetail.module.css';
import panelClasses from '../../components/formPanel/FormPanel.module.css';

import type * as dyn from '@nikkierp/common/dynamicModel';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('./audit/auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock };
});

afterEach(cleanup);

const renderPair = (field: string, labelHidden: boolean): React.ReactNode => (
	<FieldPair asTerm={!labelHidden} label={labelHidden ? null : `label ${field}`}>{`value ${field}`}</FieldPair>
);

describe('form section fields', () => {
	it('renders read-mode fields and groups as dt/dd pairs of one dl', () => {
		const { container } = renderInDetailPage(<FieldRuns
			fields={['transfer_number', { fields: ['@@priority'] }, 'origin_reference']} semantic renderField={renderPair}
			labelOf={field => `schema ${field}`}
		/>);
		const lists = container.querySelectorAll('dl');
		expect(lists).toHaveLength(1);
		expect(lists[0].querySelector('dt')?.textContent).toBe('label transfer_number');
		expect(lists[0].querySelector('dd')?.textContent).toBe('value transfer_number');
		const group = screen.getByTestId('resourceForm.fieldGroup.@@priority');
		expect(group.closest('dl')).toBe(lists[0]);
		expect(group.querySelector('dt')?.textContent).toBe('schema priority');
	});

	it('keeps every field in its column, long text included', () => {
		const { container } = renderInDetailPage(
			<FieldRuns fields={['transfer_number', 'note']} semantic renderField={renderPair} />,
		);
		expect(container.querySelector('dl')?.textContent).toContain('value note');
	});
});

describe('form section layout', () => {
	const sectionOf = (block: { isFluid?: boolean }) => renderInDetailPage(
		<FormSection block={block} title={undefined}>{'fields'}</FormSection>,
	).container.querySelector('section');

	it('shares the row by default', () => {
		const section = sectionOf({ isFluid: true });
		expect(section?.classList.contains(panelClasses.section)).toBe(true);
		expect(section?.classList.contains(panelClasses.fullRow)).toBe(false);
	});

	it('takes a row of its own when not fluid', () => {
		expect(sectionOf({ isFluid: false })?.classList.contains(panelClasses.fullRow)).toBe(true);
	});
});

const price = { label: 'fields.list_price', fields: ['@@list_price', 'per', '@@uom_id'] };
const cost = { label: 'fields.cost', fields: ['@@cost', 'per', '@@uom_id'] };

describe('field group display', () => {
	it('renders its label over the inline row as a dt/dd pair of the read-mode dl', () => {
		const { container } = renderInDetailPage(
			<FieldRuns fields={['name', price]} semantic renderField={renderPair} />,
		);
		const object = screen.getByTestId('resourceForm.fieldGroup.fields.list_price');
		expect(object.closest('dl')).toBe(container.querySelector('dl'));
		expect(object.querySelector('dt')?.textContent).toBe('test:fields.list_price');
		expect(object.querySelector('dd')?.textContent).toBe('value list_priceper' + 'value uom_id');
	});

	it('renders its label over the row in edit mode, naming the group', () => {
		renderInDetailPage(<FieldRuns fields={[price]} semantic={false} renderField={renderPair} />);
		const group = screen.getByRole('group');
		expect(group.getAttribute('data-testid')).toBe('resourceForm.fieldGroup.fields.list_price');
		expect(document.getElementById(group.getAttribute('aria-labelledby') ?? '')?.textContent)
			.toBe('test:fields.list_price');
		expect(group.querySelector('[data-testid="resourceForm.inlineRow"]')?.textContent).toContain('value uom_id');
	});

	it('is dropped with its label when none of its fields renders', () => {
		renderInDetailPage(<FieldRuns fields={[price]} semantic={false} renderField={() => null} />);
		expect(screen.queryByTestId('resourceForm.fieldGroup.fields.list_price')).toBeNull();
	});

	it('sits in one grid track unless isFullRow', () => {
		const fields = [price, { ...cost, isFullRow: true }];
		renderInDetailPage(<FieldRuns fields={fields} semantic={false} renderField={renderPair} />);
		const [shared, full] = screen.getAllByRole('group');
		expect(shared.classList.contains(classes.fullRow)).toBe(false);
		expect(full.classList.contains(classes.fullRow)).toBe(true);
	});

	it('boxes a field to the width at its index', () => {
		const sized = { ...price, widths: ['7rem'] };
		renderInDetailPage(<FieldRuns fields={[sized]} semantic={false} renderField={renderPair} />);
		const box = screen.getByText('value list_price').closest(`.${classes.sizedGroupItem}`) as HTMLElement | null;
		expect(box?.style.width).toBe('7rem');
	});
});

describe('a field listed more than once', () => {
	it('keys each copy apart', () => {
		expect(entryKeys(['uom_id', price, 'uom_id', { fields: ['@@a'] }, 'uom_id'])).toEqual(
			['uom_id', 'row-1', 'uom_id#2', 'row-3', 'uom_id#3'],
		);
	});

	it('renders every copy without a duplicate-key warning', () => {
		const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		renderInDetailPage(<FieldRuns fields={['uom_id', 'uom_id']} semantic renderField={renderPair} />);
		expect(screen.getAllByText('value uom_id')).toHaveLength(2);
		expect(errors.mock.calls.flat().join(' ')).not.toContain('same key');
		errors.mockRestore();
	});
});

const productSchema = {
	name: 'inventory_product_template',
	fields: Object.fromEntries(['list_price', 'cost', 'uom_id'].map(name => [name, {
		name, label: { 'en-US': name }, data_type: { name: 'int32' }, is_required_for_create: name === 'uom_id',
	}])),
} as unknown as dyn.ModelSchema;

function renderProductForm() {
	const view = renderInDetailPage(
		<AdhocFormProvider formVariant='create' modelSchema={productSchema} localize={key => String(key ?? '')}>
			{({ handleSubmit }) => (
				<form onSubmit={handleSubmit(() => undefined)}>
					<FieldRuns
						fields={[price, cost]} semantic={false}
						renderField={(field, hidden) => <AutoField name={field} labelHidden={hidden || undefined} />}
					/>
				</form>
			)}
		</AdhocFormProvider>,
	);
	const input = (testId: string) => view.container.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
	return { view, input };
}

describe('a shared field in two field metadata objects', () => {
	it('gives the second copy its own test id and keeps both in sync', async () => {
		const { input } = renderProductForm();
		await act(async () => {
			fireEvent.change(input('form.field.uom_id.copy2'), { target: { value: '7' } });
		});
		expect(input('form.field.uom_id').value).toBe('7');
	});

	it('shows the error on the first copy only', async () => {
		const { view, input } = renderProductForm();
		await act(async () => {
			fireEvent.submit(view.container.querySelector('form') as HTMLFormElement);
		});
		await waitFor(() => expect(input('form.field.uom_id').getAttribute('aria-invalid')).toBe('true'));
		expect(input('form.field.uom_id.copy2').getAttribute('aria-invalid')).not.toBe('true');
	});
});
