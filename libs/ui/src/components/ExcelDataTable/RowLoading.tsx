import { Loader, Table as MantineTable } from '@mantine/core';
import React from 'react';

import { useColumnCount } from './tableLayout';


/** A body row standing in for a row form whose schema is still loading: a `<div>` cannot sit in `<tbody>`. */
export function RowLoading(): React.ReactElement {
	const columnCount = useColumnCount();
	return (
		<MantineTable.Tr>
			<MantineTable.Td colSpan={columnCount} className='align-middle'>
				<Loader size='xs' />
			</MantineTable.Td>
		</MantineTable.Tr>
	);
}
