
'use client';

import { Anchor, Paper, Space, Title } from '@mantine/core';
import { type MRT_ColumnDef, MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { useMemo } from 'react';

export type Person = {
	id: string,
	name: {
		firstName: string,
		lastName: string,
	},
	address: string,
	city: string,
	state: string,
};

export const data: Person[] = [
	{
		id: '0000001',
		name: { firstName: 'Emma', lastName: 'Thompson' },
		address: '742 Evergreen Terrace',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000002',
		name: { firstName: 'Marcus', lastName: 'Chen' },
		address: '123 Innovation Drive',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000003',
		name: { firstName: 'Isabella', lastName: 'Rodriguez' },
		address: '567 Maple Avenue',
		city: 'Austin',
		state: 'Texas',
	},
	{
		id: '0000004',
		name: { firstName: 'Aiden', lastName: 'Patel' },
		address: '890 Tech Boulevard',
		city: 'Boston',
		state: 'Massachusetts',
	},
	{
		id: '0000005',
		name: { firstName: 'Sofia', lastName: 'Kim' },
		address: '234 Harbor View',
		city: 'Miami',
		state: 'Florida',
	},
	{
		id: '0000006',
		name: { firstName: 'Lucas', lastName: 'Anderson' },
		address: '456 Mountain Road',
		city: 'Denver',
		state: 'Colorado',
	},
	{
		id: '0000007',
		name: { firstName: 'Olivia', lastName: 'Martinez' },
		address: '789 Sunset Drive',
		city: 'Phoenix',
		state: 'Arizona',
	},
	{
		id: '0000008',
		name: { firstName: 'Ethan', lastName: 'Wilson' },
		address: '321 Lake View',
		city: 'Chicago',
		state: 'Illinois',
	},
	{
		id: '0000009',
		name: { firstName: 'Ava', lastName: 'Nguyen' },
		address: '654 Ocean Avenue',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000010',
		name: { firstName: 'William', lastName: 'Taylor' },
		address: '987 Pine Street',
		city: 'Atlanta',
		state: 'Georgia',
	},
	{
		id: '0000011',
		name: { firstName: 'Mia', lastName: 'Garcia' },
		address: '147 Broadway',
		city: 'Nashville',
		state: 'Tennessee',
	},
	{
		id: '0000012',
		name: { firstName: 'Alexander', lastName: 'Brown' },
		address: '258 Market Street',
		city: 'Philadelphia',
		state: 'Pennsylvania',
	},
	{
		id: '0000013',
		name: { firstName: 'Charlotte', lastName: 'Lee' },
		address: '369 Highland Avenue',
		city: 'Las Vegas',
		state: 'Nevada',
	},
	{
		id: '0000014',
		name: { firstName: 'James', lastName: 'Wright' },
		address: '741 River Road',
		city: 'Minneapolis',
		state: 'Minnesota',
	},
	{
		id: '0000015',
		name: { firstName: 'Sophia', lastName: 'Cohen' },
		address: '852 Park Place',
		city: 'Detroit',
		state: 'Michigan',
	},
	{
		id: '0000016',
		name: { firstName: 'Daniel', lastName: 'Park' },
		address: '963 Oak Street',
		city: 'Houston',
		state: 'Texas',
	},
	{
		id: '0000017',
		name: { firstName: 'Victoria', lastName: 'Adams' },
		address: '147 Elm Court',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000018',
		name: { firstName: 'Benjamin', lastName: 'Lopez' },
		address: '258 Cedar Lane',
		city: 'Miami',
		state: 'Florida',
	},
	{
		id: '0000019',
		name: { firstName: 'Zoe', lastName: 'Campbell' },
		address: '369 Birch Road',
		city: 'Denver',
		state: 'Colorado',
	},
	{
		id: '0000020',
		name: { firstName: 'Christopher', lastName: 'Rivera' },
		address: '741 Willow Drive',
		city: 'Phoenix',
		state: 'Arizona',
	},
	{
		id: '0000021',
		name: { firstName: 'Lily', lastName: 'Morgan' },
		address: '852 Pine Avenue',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000022',
		name: { firstName: 'Andrew', lastName: 'Cooper' },
		address: '963 Maple Street',
		city: 'Chicago',
		state: 'Illinois',
	},
	{
		id: '0000023',
		name: { firstName: 'Grace', lastName: 'Reed' },
		address: '159 Oak Road',
		city: 'Boston',
		state: 'Massachusetts',
	},
	{
		id: '0000024',
		name: { firstName: 'David', lastName: 'Bell' },
		address: '267 Cedar Avenue',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000025',
		name: { firstName: 'Chloe', lastName: 'Murphy' },
		address: '378 Birch Lane',
		city: 'Austin',
		state: 'Texas',
	},
	{
		id: '0000026',
		name: { firstName: 'Joseph', lastName: 'Bailey' },
		address: '489 Elm Street',
		city: 'Nashville',
		state: 'Tennessee',
	},
	{
		id: '0000027',
		name: { firstName: 'Natalie', lastName: 'Rivera' },
		address: '591 Willow Road',
		city: 'Atlanta',
		state: 'Georgia',
	},
	{
		id: '0000028',
		name: { firstName: 'Samuel', lastName: 'Cox' },
		address: '612 Pine Court',
		city: 'Las Vegas',
		state: 'Nevada',
	},
	{
		id: '0000029',
		name: { firstName: 'Audrey', lastName: 'Ward' },
		address: '734 Maple Drive',
		city: 'Philadelphia',
		state: 'Pennsylvania',
	},
	{
		id: '0000030',
		name: { firstName: 'John', lastName: 'Torres' },
		address: '845 Oak Lane',
		city: 'Detroit',
		state: 'Michigan',
	},
	{
		id: '0000031',
		name: { firstName: 'Hannah', lastName: 'Peterson' },
		address: '956 Cedar Street',
		city: 'Minneapolis',
		state: 'Minnesota',
	},
	{
		id: '0000032',
		name: { firstName: 'Ryan', lastName: 'Gray' },
		address: '167 Birch Avenue',
		city: 'Houston',
		state: 'Texas',
	},
	{
		id: '0000033',
		name: { firstName: 'Evelyn', lastName: 'Ramirez' },
		address: '278 Elm Road',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000034',
		name: { firstName: 'Nathan', lastName: 'James' },
		address: '389 Willow Court',
		city: 'Miami',
		state: 'Florida',
	},
	{
		id: '0000035',
		name: { firstName: 'Leah', lastName: 'Watson' },
		address: '491 Pine Lane',
		city: 'Denver',
		state: 'Colorado',
	},
	{
		id: '0000036',
		name: { firstName: 'Tyler', lastName: 'Brooks' },
		address: '512 Maple Street',
		city: 'Phoenix',
		state: 'Arizona',
	},
	{
		id: '0000037',
		name: { firstName: 'Anna', lastName: 'Kelly' },
		address: '623 Oak Drive',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000038',
		name: { firstName: 'Christian', lastName: 'Sanders' },
		address: '734 Cedar Road',
		city: 'Chicago',
		state: 'Illinois',
	},
	{
		id: '0000039',
		name: { firstName: 'Victoria', lastName: 'Price' },
		address: '845 Birch Avenue',
		city: 'Boston',
		state: 'Massachusetts',
	},
	{
		id: '0000040',
		name: { firstName: 'Thomas', lastName: 'Bennett' },
		address: '956 Elm Lane',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000041',
		name: { firstName: 'Samantha', lastName: 'Wood' },
		address: '167 Willow Street',
		city: 'Austin',
		state: 'Texas',
	},
	{
		id: '0000042',
		name: { firstName: 'Christopher', lastName: 'Barnes' },
		address: '278 Pine Road',
		city: 'Nashville',
		state: 'Tennessee',
	},
	{
		id: '0000043',
		name: { firstName: 'Ashley', lastName: 'Ross' },
		address: '389 Maple Court',
		city: 'Atlanta',
		state: 'Georgia',
	},
	{
		id: '0000044',
		name: { firstName: 'Andrew', lastName: 'Henderson' },
		address: '491 Oak Drive',
		city: 'Las Vegas',
		state: 'Nevada',
	},
	{
		id: '0000045',
		name: { firstName: 'Sarah', lastName: 'Coleman' },
		address: '512 Cedar Avenue',
		city: 'Philadelphia',
		state: 'Pennsylvania',
	},
	{
		id: '0000046',
		name: { firstName: 'Joseph', lastName: 'Jenkins' },
		address: '623 Birch Lane',
		city: 'Detroit',
		state: 'Michigan',
	},
	{
		id: '0000047',
		name: { firstName: 'Elizabeth', lastName: 'Perry' },
		address: '734 Elm Street',
		city: 'Minneapolis',
		state: 'Minnesota',
	},
	{
		id: '0000048',
		name: { firstName: 'David', lastName: 'Powell' },
		address: '845 Willow Road',
		city: 'Houston',
		state: 'Texas',
	},
	{
		id: '0000049',
		name: { firstName: 'Lauren', lastName: 'Long' },
		address: '956 Pine Court',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000050',
		name: { firstName: 'Michael', lastName: 'Patterson' },
		address: '167 Maple Drive',
		city: 'Miami',
		state: 'Florida',
	},
	{
		id: '0000051',
		name: { firstName: 'Rachel', lastName: 'Hughes' },
		address: '278 Oak Lane',
		city: 'Denver',
		state: 'Colorado',
	},
	{
		id: '0000052',
		name: { firstName: 'Kevin', lastName: 'Washington' },
		address: '389 Cedar Street',
		city: 'Phoenix',
		state: 'Arizona',
	},
	{
		id: '0000053',
		name: { firstName: 'Nicole', lastName: 'Butler' },
		address: '491 Birch Avenue',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000054',
		name: { firstName: 'Steven', lastName: 'Simmons' },
		address: '512 Elm Road',
		city: 'Chicago',
		state: 'Illinois',
	},
	{
		id: '0000055',
		name: { firstName: 'Amanda', lastName: 'Foster' },
		address: '623 Willow Court',
		city: 'Boston',
		state: 'Massachusetts',
	},
	{
		id: '0000056',
		name: { firstName: 'Timothy', lastName: 'Gonzalez' },
		address: '734 Pine Lane',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000057',
		name: { firstName: 'Melissa', lastName: 'Bryant' },
		address: '845 Maple Street',
		city: 'Austin',
		state: 'Texas',
	},
	{
		id: '0000058',
		name: { firstName: 'Eric', lastName: 'Alexander' },
		address: '956 Oak Drive',
		city: 'Nashville',
		state: 'Tennessee',
	},
	{
		id: '0000059',
		name: { firstName: 'Laura', lastName: 'Russell' },
		address: '167 Cedar Road',
		city: 'Atlanta',
		state: 'Georgia',
	},
	{
		id: '0000060',
		name: { firstName: 'Stephen', lastName: 'Griffin' },
		address: '278 Birch Avenue',
		city: 'Las Vegas',
		state: 'Nevada',
	},
	{
		id: '0000061',
		name: { firstName: 'Rebecca', lastName: 'Diaz' },
		address: '389 Elm Lane',
		city: 'Philadelphia',
		state: 'Pennsylvania',
	},
	{
		id: '0000062',
		name: { firstName: 'Jacob', lastName: 'Hayes' },
		address: '491 Willow Street',
		city: 'Detroit',
		state: 'Michigan',
	},
	{
		id: '0000063',
		name: { firstName: 'Katherine', lastName: 'Myers' },
		address: '512 Pine Road',
		city: 'Minneapolis',
		state: 'Minnesota',
	},
	{
		id: '0000064',
		name: { firstName: 'Jonathan', lastName: 'Ford' },
		address: '623 Maple Court',
		city: 'Houston',
		state: 'Texas',
	},
	{
		id: '0000065',
		name: { firstName: 'Jennifer', lastName: 'Hamilton' },
		address: '734 Oak Drive',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000066',
		name: { firstName: 'Justin', lastName: 'Graham' },
		address: '845 Cedar Avenue',
		city: 'Miami',
		state: 'Florida',
	},
	{
		id: '0000067',
		name: { firstName: 'Michelle', lastName: 'Sullivan' },
		address: '956 Birch Lane',
		city: 'Denver',
		state: 'Colorado',
	},
	{
		id: '0000068',
		name: { firstName: 'Brandon', lastName: 'Wallace' },
		address: '167 Elm Street',
		city: 'Phoenix',
		state: 'Arizona',
	},
	{
		id: '0000069',
		name: { firstName: 'Stephanie', lastName: 'Woods' },
		address: '278 Willow Road',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000070',
		name: { firstName: 'Gregory', lastName: 'Cole' },
		address: '389 Pine Court',
		city: 'Chicago',
		state: 'Illinois',
	},
	{
		id: '0000071',
		name: { firstName: 'Christine', lastName: 'West' },
		address: '491 Maple Drive',
		city: 'Boston',
		state: 'Massachusetts',
	},
	{
		id: '0000072',
		name: { firstName: 'Brian', lastName: 'Jordan' },
		address: '512 Oak Lane',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000073',
		name: { firstName: 'Oliver', lastName: 'Kumar' },
		address: '753 Cedar Lane',
		city: 'Sacramento',
		state: 'California',
	},
	{
		id: '0000074',
		name: { firstName: 'Luna', lastName: 'Foster' },
		address: '951 Birch Street',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000075',
		name: { firstName: 'Henry', lastName: 'Ross' },
		address: '159 Maple Court',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000076',
		name: { firstName: 'Ella', lastName: 'Johnson' },
		address: '267 Willow Drive',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000077',
		name: { firstName: 'Noah', lastName: 'Smith' },
		address: '378 Oak Avenue',
		city: 'Austin',
		state: 'Texas',
	},
	{
		id: '0000078',
		name: { firstName: 'Avery', lastName: 'Brown' },
		address: '489 Pine Street',
		city: 'Nashville',
		state: 'Tennessee',
	},
	{
		id: '0000079',
		name: { firstName: 'Miles', lastName: 'Davis' },
		address: '591 Maple Court',
		city: 'Atlanta',
		state: 'Georgia',
	},
	{
		id: '0000080',
		name: { firstName: 'Sophie', lastName: 'Miller' },
		address: '612 Birch Road',
		city: 'Las Vegas',
		state: 'Nevada',
	},
	{
		id: '0000081',
		name: { firstName: 'Jameson', lastName: 'Wilson' },
		address: '734 Elm Lane',
		city: 'Philadelphia',
		state: 'Pennsylvania',
	},
	{
		id: '0000082',
		name: { firstName: 'Liam', lastName: 'Anderson' },
		address: '845 Oak Drive',
		city: 'Detroit',
		state: 'Michigan',
	},
	{
		id: '0000083',
		name: { firstName: 'Evelyn', lastName: 'Martinez' },
		address: '956 Willow Street',
		city: 'Minneapolis',
		state: 'Minnesota',
	},
	{
		id: '0000084',
		name: { firstName: 'Ava', lastName: 'Hernandez' },
		address: '167 Cedar Avenue',
		city: 'Houston',
		state: 'Texas',
	},
	{
		id: '0000085',
		name: { firstName: 'Isabella', lastName: 'Garcia' },
		address: '278 Elm Road',
		city: 'Seattle',
		state: 'Washington',
	},
	{
		id: '0000086',
		name: { firstName: 'Mia', lastName: 'Rodriguez' },
		address: '389 Willow Court',
		city: 'Miami',
		state: 'Florida',
	},
	{
		id: '0000087',
		name: { firstName: 'Alexander', lastName: 'Lee' },
		address: '491 Pine Lane',
		city: 'Denver',
		state: 'Colorado',
	},
	{
		id: '0000088',
		name: { firstName: 'Olivia', lastName: 'Chen' },
		address: '512 Oak Drive',
		city: 'Phoenix',
		state: 'Arizona',
	},
	{
		id: '0000089',
		name: { firstName: 'Ethan', lastName: 'Nguyen' },
		address: '623 Maple Street',
		city: 'Portland',
		state: 'Oregon',
	},
	{
		id: '0000090',
		name: { firstName: 'Aiden', lastName: 'Patel' },
		address: '734 Birch Avenue',
		city: 'Chicago',
		state: 'Illinois',
	},
	{
		id: '0000091',
		name: { firstName: 'Sofia', lastName: 'Kim' },
		address: '845 Elm Road',
		city: 'Boston',
		state: 'Massachusetts',
	},
	{
		id: '0000092',
		name: { firstName: 'Lucas', lastName: 'Anderson' },
		address: '956 Willow Court',
		city: 'San Francisco',
		state: 'California',
	},
	{
		id: '0000093',
		name: { firstName: 'Olivia', lastName: 'Martinez' },
		address: '167 Oak Drive',
		city: 'Austin',
		state: 'Texas',
	},
	{
		id: '0000094',
		name: { firstName: 'Ethan', lastName: 'Wilson' },
		address: '278 Cedar Lane',
		city: 'Nashville',
		state: 'Tennessee',
	},
	{
		id: '0000095',
		name: { firstName: 'Ava', lastName: 'Nguyen' },
		address: '389 Pine Street',
		city: 'Atlanta',
		state: 'Georgia',
	},
	{
		id: '0000096',
		name: { firstName: 'William', lastName: 'Taylor' },
		address: '491 Maple Court',
		city: 'Las Vegas',
		state: 'Nevada',
	},
	{
		id: '0000097',
		name: { firstName: 'Mia', lastName: 'Garcia' },
		address: '512 Oak Drive',
		city: 'Philadelphia',
		state: 'Pennsylvania',
	},
	{
		id: '0000098',
		name: { firstName: 'Alexander', lastName: 'Brown' },
		address: '623 Willow Street',
		city: 'Detroit',
		state: 'Michigan',
	},
	{
		id: '0000099',
		name: { firstName: 'Charlotte', lastName: 'Lee' },
		address: '734 Elm Road',
		city: 'Minneapolis',
		state: 'Minnesota',
	},
	{
		id: '0000100',
		name: { firstName: 'James', lastName: 'Wright' },
		address: '845 Cedar Avenue',
		city: 'Houston',
		state: 'Texas',
	},
	{
		id: '0000101',
		name: { firstName: 'Sophia', lastName: 'Cohen' },
		address: '956 Oak Drive',
		city: 'Seattle',
		state: 'Washington',
	},
];

export const columns: MRT_ColumnDef<Person>[] = [
	{
		accessorKey: 'name.firstName', //access nested data with dot notation
		header: 'First Name',
		Cell: ({ cell }) => {
			const model: Person = cell.row.original;
			return (
				<Anchor
					href={`/${model.id}`}
					// className='text-blue-500 underline'
				>
					{cell.getValue<string>()}
				</Anchor>
			);
		},
	},
	{
		accessorKey: 'name.lastName',
		header: 'Last Name',
	},
	{
		accessorKey: 'address', //normal accessorKey
		header: 'Address',
	},
	{
		accessorKey: 'city',
		header: 'City',
	},
	{
		accessorKey: 'state',
		header: 'State',
	},
];

export const SimpleTable = () => {
	//should be memoized or stable
	// const columns = useMemo<MRT_ColumnDef<Person>[]>(
	// 	() => columnsDef,
	// 	[],
	// );
	const table = useMantineReactTable({
		columns,
		data,
		mantinePaperProps: {
			shadow: '0', withBorder: false,
			radius: 0,
			// className: 'overflow-x-auto bg-transparent absolute inset-0',
			className: 'overflow-x-auto bg-transparent',
			style: {
				height: '100%',
			},
		},
		mantineTableContainerProps: {
			// className: 'absolute inset-0',
			style: {
				maxHeight: 'calc(100% - var(--table-top-toolbar-height) - var(--table-bottom-toolbar-height))',
			},
		},
		mantineTopToolbarProps: {
			style: { height: '91px' },
		},
		mantineBottomToolbarProps: {
			style: { height: '49px' },
		},
		enableSelectAll: true,
		enableRowSelection: true,
		enableStickyHeader: true,
		enableStickyFooter: true,
		enableRowNumbers: true,
		enableDensityToggle: false,
		enableFilters: false,
		enableFullScreenToggle: false,
		enableHiding: false,
		positionToolbarAlertBanner: 'none',

		enableTopToolbar: true,
		enableBottomToolbar: true,
		enablePagination: true,
		positionPagination: 'both',
	});

	return (
		<MantineReactTable
			table={table}
			// columns={columns}
			// data={data}
			// mantinePaperProps={{
			// 	shadow: '0', withBorder: false,
			// 	radius: 0,
			// 	// className: 'overflow-x-auto bg-transparent absolute inset-0',
			// 	className: 'overflow-x-auto bg-transparent',
			// 	style: {
			// 		height: '100%',
			// 	},
			// }}
			// mantineTableContainerProps={{
			// 	// className: 'absolute inset-0',
			// 	style: {
			// 		maxHeight: 'calc(100% - var(--table-top-toolbar-height) - var(--table-bottom-toolbar-height))',
			// 	},
			// }}
			// mantineTopToolbarProps={{
			// 	style: { height: '91px' },
			// }}
			// mantineBottomToolbarProps={{
			// 	style: { height: '49px' },
			// }}
			// enableSelectAll
			// enableRowSelection
			// enableStickyHeader
			// enableStickyFooter
			// enableRowNumbers
			// enableDensityToggle={false}
			// enableFilters={false}
			// enableFullScreenToggle={false}
			// enableHiding={false}
			// positionToolbarAlertBanner='none'


			// enableTopToolbar
			// enableBottomToolbar
			// enablePagination
			// positionPagination='both'
		/>
		// <Paper
		// 	withBorder radius='md' p='md'
		// 	className='overflow-x-auto'
		// >
		// 	<Title order={5}>Simple</Title>
		// 	<Space h='md' />
		// </Paper>
	);
};
