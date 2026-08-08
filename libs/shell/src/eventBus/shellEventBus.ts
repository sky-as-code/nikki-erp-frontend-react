import { createEventBus, EventBus, IEventBus } from '@nikkierp/common/eventBus';


/**
 * The application's single event bus, created at module scope.
 *
 * It cannot be created inside `MicroAppHostProvider` like the other host services: the
 * Shell's own chrome subscribes to routing and session events *above* that provider, and
 * before it renders at all — the sign-in redirect has to work before any micro-app host
 * exists. `MicroAppHostProvider` passes this same instance on as `HostServices.eventBus`,
 * so the Shell and every micro-app share one bus.
 *
 * `EventBus.setInstance` installs it as the fallback singleton for code running outside
 * React — `CrudServiceBase` reaches it that way to publish its events.
 */
export const shellEventBus: IEventBus = createEventBus();

EventBus.setInstance(shellEventBus);
