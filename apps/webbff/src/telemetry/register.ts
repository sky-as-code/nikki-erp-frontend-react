/**
 * Telemetry bootstrap. Must be the first import of `src/main.ts`: CommonJS loads it, and so registers the provider,
 * context manager and propagator, before `express` or `node:http` is required (BFF-01).
 */
import { initTelemetry } from './provider';
import { loadEnvFiles, loadTelemetryConfig } from '../common/config/env';


loadEnvFiles();
initTelemetry(loadTelemetryConfig());
