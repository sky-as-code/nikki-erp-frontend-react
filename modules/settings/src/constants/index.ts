export const SETTINGS_MODULE = 'settings';

/**
 * The widget name every feature module exposes for its settings pane.
 *
 * This string is the entire contract between this module and the modules it renders: they
 * declare `<WidgetRoute name='pages.settings' ... />`, this module mounts that name. Neither
 * side imports the other, so the name must match verbatim on both -- it is resolved at render
 * time, not at build time, and a typo produces an empty pane rather than a compile error.
 */
export const SETTINGS_WIDGET_NAME = 'pages.settings';
