export type { IComponentRenderer, ComponentRenderContext } from './IComponentRenderer';
export { registerComponentRenderer, getComponentRenderer } from './registry';
export { renderComponent, RenderComponentTree } from './renderComponent';
import './registerComponentRenderers';
