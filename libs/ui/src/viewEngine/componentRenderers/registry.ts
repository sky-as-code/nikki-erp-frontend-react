import type { IComponentRenderer } from './IComponentRenderer';


const componentRendererRegistry = new Map<string, IComponentRenderer>();

export function registerComponentRenderer(renderer: IComponentRenderer): void {
	if (componentRendererRegistry.has(renderer.type)) {
		console.warn(`ComponentRenderer for "${renderer.type}" overridden.`);
	}
	componentRendererRegistry.set(renderer.type, renderer);
}

export function getComponentRenderer(type: string): IComponentRenderer | undefined {
	return componentRendererRegistry.get(type);
}
