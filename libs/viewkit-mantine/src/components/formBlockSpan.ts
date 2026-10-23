import layoutClasses from './formBlockLayout.module.css';


/** Class that stretches a `resource_form__column` across every column of the field-block grid. */
export function formBlockSpanClass(block: { span?: 'full' }): string | undefined {
	return block.span === 'full' ? layoutClasses.formBlockFullRow : undefined;
}
