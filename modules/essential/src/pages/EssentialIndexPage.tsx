import { Alert } from '@mantine/core';
import React from 'react';
import { Link } from 'react-router';


/**
 * The former index page of the Essential micro-app. `/essential` now opens the first menu link
 * instead; this is kept, unrouted, as a developer jump page.
 */
export function EssentialIndexPage(): React.ReactNode {
	return (
		<>
			<Alert variant='filled' color='blue'><h1>Essential Module</h1></Alert>
			<Link to='authorized' data-testid='essential-link-authorized'>Authorized</Link><br />
			<Link to='org-home' data-testid='essential-link-org-home'>Org Home</Link><br />
			<Link to='module-management' data-testid='essential-link-module-management'>
				Module Management
			</Link><br />
			<Link to='essential_uom' data-testid='essential-link-uoms'>Units of Measure</Link><br />
			<Link to='essential_uomcat' data-testid='essential-link-uom-categories'>UoM Categories</Link>
		</>
	);
}
