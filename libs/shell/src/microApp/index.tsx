export * from './MicroAppHostProvider';

// The micro-app loading machinery now lives in `@nikkierp/ui` so that any micro-app can mount
// another module's widget without depending on the Shell. Re-exported here by name -- never
// `export *` -- because a name exported by both sides would be silently dropped rather than
// reported as a conflict.
export { LazyMicroApp, LazyMicroWidget, MicroAppManager } from '@nikkierp/ui/microApp';
export type {
	LazyMicroAppProps, LazyMicroWidgetProps, MicroAppManagerOptions, MicroAppPack, RetryOptions,
} from '@nikkierp/ui/microApp';
