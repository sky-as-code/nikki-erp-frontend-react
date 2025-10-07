import { Button } from '@mantine/core'

export const NotFoundPage = () => {
	return (
		<div className='flex items-center justify-center h-screen flex-col'>
			<h1 className='text-5xl font-bold mb-2'>404</h1>
			<h1 className='text-2xl font-bold'>Page Not Found</h1>
			<p className='text-gray-500 mt-2'>
				Trang bạn tìm không tồn tại
			</p>

			<Button
				className='bg-primary-300 text-white px-4 py-2 rounded-md mt-4'
				onClick={() => window.history.back()}
			>
				Quay lại
			</Button>
		</div>
	)
}