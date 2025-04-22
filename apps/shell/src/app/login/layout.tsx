import authOptions from '@app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import React from 'react';

export default async function LoginLayout({children}: React.PropsWithChildren) {
	const data = await getData();

	if (data.session?.user) {
		return redirect('/');
	}

	return <>{children}</>;
}

async function getData() {
	const session = await getServerSession(authOptions);

	return {session};
}
