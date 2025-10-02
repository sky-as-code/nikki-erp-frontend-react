import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/_tenant/$tenant/_vending-machine/vending-machine/')({
	component: () => <div>Vending Machine Page</div>,
})

