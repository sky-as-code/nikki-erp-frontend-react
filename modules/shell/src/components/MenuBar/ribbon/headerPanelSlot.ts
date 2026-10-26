import React from 'react';


/**
 * The element under the header row a ribbon portals its panel into: the tabs live inside the row,
 * the panel spans the whole header below it. `null` until the header has mounted it.
 */
export const HeaderPanelSlotContext = React.createContext<HTMLElement | null>(null);
