import type React from 'react';


/**
 * The single React seam of the view engine. Swapping the rendering engine
 * (React -> Vue, etc.) means changing this alias and the concrete templates /
 * component renderers, never the metadata JSON, the registries, `MetaPage`,
 * or `MetaComponent`.
 */
export type RenderResult = React.ReactNode;
