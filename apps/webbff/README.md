# webbff — Web Backend-for-Frontend

Express (TypeScript) service standing between the React frontend and the business service (the Go application).
It replaces `shellbff` for the React tree (`shellbff` stays for the Vue tree) and does three things:

1. **Hosts the frontend** — same behaviour as `shellbff`: env chain, Vite middleware when `NODE_ENV=local`, static
   files + compression otherwise, and an SPA fallback serving `index.html` with `$$CLIENT_CONFIG$$` replaced by
   `window.__CLIENT_CONFIG__ = {...}` (every `NIKKI_PUBLIC_*` variable without its prefix, plus `APP_ENV`).
2. **Proxies the business API** — every `/api/v{n}/**` (n ≥ 1) request is forwarded verbatim to the upstream
   (`/api/v1/iam/iam_user?x=1` → `{UPSTREAM}/v1/iam/iam_user?x=1`), bodies streamed both ways (NDJSON, multipart,
   xlsx downloads work unbuffered). The upstream call is aborted when the browser disconnects.
3. **Owns the session cookies** — the browser never sees a token. The access token travels in the httpOnly
   `nikki_at` cookie and is sent upstream as `X-NIKKI-ACCESSTOKEN`.

## API layout

| Prefix | Meaning |
|---|---|
| `/api/v0/**` | **Frontend-coupled, versionless** BFF APIs. The BFF and its frontend consumer always change together in the same release, so they carry no version. Never forwarded upstream. Today: `GET /api/v0/config`. |
| `/api/v{n}/**` (n ≥ 1) | Business APIs, **mirroring the business service paths**. Either plain proxy (the default) or a module router (accumulation of several upstream calls, or changed behaviour such as the signin cookie endpoints). The frontend cannot tell which. |
| other `/api/**` | 404 with the backend error array `[{type:'business',key:'common:err_not_found',message}]`. |
| anything else | Frontend hosting (assets, then `index.html`). |

Errors produced by the BFF itself use the business service's error-array shape. Upstream unreachable, or no
response headers within `NIKKI_BFF_UPSTREAM_TIMEOUT_MS` →
`502 [{type:'business',key:'common:err_upstream_unavailable',message}]`.

## Header policy

| Direction | Forwarded | Never forwarded |
|---|---|---|
| Browser → upstream | `content-type`, `content-length`, `transfer-encoding`, `accept`, `accept-language`, `range`, `if-none-match`, `user-agent`, every `x-nikki-*`; the BFF adds `X-Forwarded-For/Proto/Host`, `Host` (below) and `X-NIKKI-ACCESSTOKEN` from the cookie | browser-sent `x-nikki-accesstoken`, `authorization`, `cookie`, hop-by-hop headers, everything else |
| Upstream → browser | status, `content-type`, `content-length`, `transfer-encoding`, `content-disposition`, `cache-control`, `etag`, `accept-ranges`, `content-range`, `x-accel-buffering`, every `x-nikki-*` | `set-cookie`, hop-by-hop headers, everything else |

No `Authorization` header is sent upstream: there is no service-to-service token yet (logged as a problem).

Upstream `Host`: the incoming `Host` when `NIKKI_BFF_UPSTREAM_FORWARD_HOST=true` (production — the tenant subdomain
reaches the backend), else the host of `NIKKI_BFF_UPSTREAM_BASE_URL`. TLS SNI and certificate checks always use the
base URL's hostname. The proxy only ever connects to the configured upstream; the browser cannot influence host,
port or scheme, and paths with `.`/`..` segments are refused.

## Session cookies

| Cookie | Path | Attributes |
|---|---|---|
| `nikki_at` (access token) | `/api` | `HttpOnly; SameSite=Strict; Expires=<access_token_expires_at>`, `Secure` per `NIKKI_BFF_COOKIE_SECURE` |
| `nikki_rt` (refresh token) | `/api/v1/iam/signin` | same, `Expires=<refresh_token_expires_at>` |

No `Domain` attribute (host-only). **Deviation from plan D6:** `nikki_rt` is scoped to the whole `signin` group
instead of only `/api/v1/iam/signin/refresh`, so that `POST /api/v1/iam/signin/signout` also receives it and one
cookie can be cleared on one path. It is still never sent to any other API. Helpers: `src/common/session/cookies.ts`.

## Auth endpoints

Module router `src/modules/iam/` (`iamRouterFactory`, base path `/api/v1/iam`). Only these four paths are handled;
every other `/api/v1/iam/**` path, `signin/start` included, falls through to the generic proxy. All four answer
`Cache-Control: no-store`; only `signin/continue` parses a JSON body (malformed body → 400
`[{type:'validation',key:'common:err_malformed_request',...}]`).

| Endpoint | Behaviour |
|---|---|
| `POST /api/v1/iam/signin/continue` | Forwards the body to upstream `/v1/iam/signin/continue`. On `2xx` with `done && data`: sets `nikki_at`/`nikki_rt` and rewrites `data` to `{access_token_expires_at, refresh_token_expires_at}`. Any other answer passes through unchanged. |
| `POST /api/v1/iam/signin/refresh` | Body ignored. No `nikki_rt` → 401 `[{type:'authorization',key:'common:err_unauthenticated',message}]`. Upstream `2xx` → both cookies rotated, 200 with the two expiries. Upstream `4xx` → both cookies cleared, 401 `err_unauthenticated`. Upstream `5xx` → status and body passed through, cookies kept. |
| `POST /api/v1/iam/signin/signout` | Clears both cookies, 204. No upstream call (the business service has no logout). |
| `GET /api/v1/iam/me/bootstrap` | In parallel: `/v1/iam/me/context`, `/v1/essential/essential_language/enabled`, `/v1/essential/essential_module_metadata?fields=*&page=0&size=500` → 200 `{context, languages, modules: items}`. The first failing call (in that order) is returned with its status and body as-is. |

A `2xx` signin/refresh answer without the four token fields is never passed through (it could carry a token): it
becomes 502 `common:err_upstream_unavailable`. The browser `User-Agent` reaches the upstream (the business service
uses it as the session's device name). Upstream unreachable → 502 as everywhere else.

## CSRF

`src/common/session/csrf.ts`, mounted on `/api` before every other API handler — a backstop behind
`SameSite=Strict`. A request is rejected with 403 `[{type:'authorization',key:'common:err_csrf_rejected',message}]`
when **all** of these hold:

- the method is not `GET`, `HEAD` or `OPTIONS`;
- it carries a session cookie (`nikki_at` or `nikki_rt`) — without one it cannot act as the user;
- `Sec-Fetch-Site` is not `same-origin`/`none`, **and** `Origin` is missing, `null` or its host (with port) differs
  from the request `Host`.

Non-browser clients holding a session cookie must therefore send `Origin` matching `Host`.

## Environment variables

Resolution order (first value wins): process env → `{NIKKI_BFF_CLIENT_ROOT_PATH}/.env.local` → `./.env.local` →
`./.env.default`. Copy `.env.sample` to `.env.local` for personal settings.

| Variable | Default | Meaning |
|---|---|---|
| `NIKKI_PUBLIC_*` | `ROOT_DOMAIN`, `ROOT_PATH`, `MAPLIBRE_GL_API_KEY` | Sent to the browser (`/api/v0/config`, `window.__CLIENT_CONFIG__`) without the prefix. `BASE_API_URL` is not read from the environment: it is the hard-coded `/api`, because session cookies only reach the BFF |
| `NODE_ENV` | `local` | `local` = Vite middleware; anything else = static files |
| `NIKKI_BFF_CLIENT_ROOT_PATH` | set by the `dev` scripts | Folder holding the frontend `index.html` (sources locally, `dist` otherwise) |
| `NIKKI_BFF_HTTP_PORT` / `NIKKI_BFF_HTTP_HOST` | `3000` / all interfaces | HTTP listener |
| `NIKKI_BFF_HTTPS_ENABLED`, `_HTTPS_PORT`, `_HTTPS_CERTIFICATE_FILE`, `_HTTPS_PRIVATE_KEY_FILE` | `false` | HTTPS listener; relative files resolve against the client root (as in `shellbff`) |
| `NIKKI_BFF_UPSTREAM_BASE_URL` | `https://cityboi.extapi-local.coremart.local:4433` | Business service base URL (may carry a path prefix). Required |
| `NIKKI_BFF_UPSTREAM_FORWARD_HOST` | `false` | Forward the browser `Host` upstream |
| `NIKKI_BFF_UPSTREAM_TIMEOUT_MS` | `30000` | Max wait for upstream response headers (a stream may last longer) |
| `NIKKI_BFF_UPSTREAM_CA_FILE` | empty | Comma-separated PEM files trusted for the upstream; relative paths resolve against the client root |
| `NIKKI_BFF_UPSTREAM_CLIENT_CERT_FILE` / `_KEY_FILE` | empty | Client certificate for upstream mTLS; relative paths resolve against the client root |
| `NIKKI_BFF_UPSTREAM_TLS_INSECURE` | `true` in `.env.default`, unset in Docker | Skip upstream certificate verification (logs a warning). Never in production |
| `NIKKI_BFF_COOKIE_SECURE` | `auto` | `auto` = `Secure` when `NIKKI_BFF_HTTPS_ENABLED=true`; or `true`/`false` |
| `NIKKI_BFF_CORS_ORIGINS` | empty | Comma-separated origins allowed cross-origin with credentials (dev only). Empty = same-origin only |

**Local CA.** The backend's local certificate (`extapi-local.coremart.local`, SAN `*.extapi-local.coremart.local`)
is signed by the intermediate `coremart-server-ca-nonprod`, itself signed by `coremart-root-ca-nonprod`, both in the
backend repo under `scripts/cert/pki/{server-ca,root-ca}/`. That repo is a separate checkout with no fixed location
relative to this one, so the default is `NIKKI_BFF_UPSTREAM_TLS_INSECURE=true`. To verify instead, list both CA files
(Node needs the whole chain) with absolute paths, or paths relative to the client root, in `.env.local` — see `.env.sample`.

## Scripts

```bash
pnpm --filter webbff dev        # serves nikkierp/apps/webapp on :3000 (Git Bash on Windows)
pnpm --filter webbff test       # vitest, src/**/*.test.ts
pnpm --filter webbff typecheck
pnpm --filter webbff build      # tsc -p tsconfig.build.json → dist/ (tests excluded); run with `start`
pnpm exec eslint nikkierp/apps/webbff -c nikkierp/apps/webbff/eslint.config.mjs   # from the frontend root
```

Every React package's `dev` script boots this BFF with `ts-node .../webbff/src/main.ts`, its own
`NIKKI_BFF_CLIENT_ROOT_PATH` and its own `NIKKI_BFF_HTTP_PORT`.

## Code layout

```
src/main.ts                     bootstrap: config → container → app → listen
src/app.ts                      assembly: CSRF guard, /api/v0, module routers (extension point), generic proxy, hosting
src/common/config/              env chain and typed AppConfig
src/common/ioc/container.ts     Container: config, logger, upstream client, session cookies
src/common/http/                UpstreamClient (forward + requestJson), header allowlists, error-array helpers
src/common/proxy/               generic streaming proxy
src/common/session/             session cookies, CSRF guard
src/hosting/                    Vite middleware, static files, index.html
src/api/v0/                     versionless frontend-coupled APIs
src/modules/<module>/           module routers, named after the business service module
```

Inversion of control without a library: `createContainer(config)` builds every shared dependency once behind an
interface; modules receive the `Container` in their router factory. Relative imports only, no path aliases.

## Adding a module router

1. Create `src/modules/<module>/router.ts` exporting a `ModuleRouterFactory`:
   ```ts
   export function createIamRouter(container: Container): ModuleRouter {
   	const router = express.Router();
   	router.post('/signin/refresh', express.json(), (req, res) => { /* container.upstream.requestJson(...) */ });
   	return { basePath: '/api/v1/iam', router };
   }
   ```
2. Append it to `moduleRouterFactories` in `src/modules/index.ts`. `registerModuleRouters()` in `src/app.ts` mounts
   it before the generic proxy, so it wins for the paths it handles; anything it does not handle falls through to
   the proxy.
3. Parse bodies per route (`express.json()`), never app-wide — the proxy streams raw request bodies.
4. Call the upstream with `container.upstream.requestJson()` — pass `incomingReq: req` to carry the allowlisted
   headers and Host, and `accessToken: container.sessionCookies.readAccessToken(req)`. Return an upstream failure
   with its status and body; answer `UpstreamUnavailableError` with `sendUpstreamUnavailable(res)`.

## Module `dynamicresource` — schema graph

`GET /api/v1/:module/:schema/meta/schema_graph` (`src/modules/dynamicresource/`, factory
`dynamicResourceRouterFactory`) answers a resource schema together with the schemas of every resource it relates to,
so a list or detail page needs one request instead of one per edge.

1. `:module` and `:schema` must match `^[a-z0-9_]+$`, else 404 `common:err_not_found`.
2. Upstream `GET /v1/{module}/{schema}/meta/schema` with the browser's query string (`?org_id=` etc.), the cookie
   access token and the allowlisted headers. A non-2xx answer is returned with its status and body as-is;
   unreachable → 502 `common:err_upstream_unavailable`.
3. The distinct `dest_schema_name` of every entry in `to_relations` and `from_relations`, the root itself excluded,
   are fetched the same way in parallel (at most 6 at once).
4. `200 {schema, edges: {<dest_schema_name>: <schema>}, failed_edges: string[]}`, `Cache-Control: no-store`
   (schemas carry their own `etag` and the client caches them).

**Addition to the plan contract:** `failed_edges` (always present, sorted) names the edge targets whose fetch failed
for any reason (non-2xx, unreachable, non-object body, no resolvable module key). They are absent from `edges`; one
failing edge never fails the whole response, and the client falls back to its per-schema lookup for them.

**Edge shape of `meta/schema`** (backend, verified in code): the body is the bare schema object of
`ModelSchema.ToSimplized()` (`nikkierp/common/dynamicmodel/model/model_schema.go:520`, served by
`CrudRestBase.GetSchema`, `nikkierp/modules/dynamicresource/composable/rest_base.go:118`). Relations are
`to_relations` and `from_relations` (`model_schema.go:539-540`, both `omitempty`), each entry
`{edge, src_field, dest_schema_name, relation_type}` (`ModelRelation.ToSimplized`, `model_schema.go:632-644`;
`relation_type` is `one:one | one:many | many:one | many:many`, many-to-many entries have no `src_field`). The
target schema name is `dest_schema_name`. **No module key is serialized** for a schema or a relation.

**Module key resolution** (`module_key_resolver.ts`), first match wins:

1. An explicit `module_key` on the relation entry — not sent by the backend today; honoured if it ever is.
2. The root's own `:module` when the target shares the root schema's prefix (same module, whatever its key).
3. The static prefix map `{vdmc: 'vendingmachine'}` — the frontend's rule: `MicroAppManager.findOwnerSlug`
   matches the prefix before the first `_` against each micro-app's `schemaPrefix ?? slug`, and only
   `vendingmachine` declares a `schemaPrefix` (`vdmc`). Backend `ModelPrefix()` agrees: every module returns its
   name except `vendingmachine` (`"vdmc"`).
4. The prefix before the first `_` (`iam_users` → `iam`). A name with no prefix is unresolvable → `failed_edges`.

A new module whose schema prefix differs from its module key needs an entry in `PREFIX_MODULE_KEYS`.
