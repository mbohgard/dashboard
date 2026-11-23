# dashboard

Use Node.js 26 and pnpm 12.21.0 (pinned in `package.json`). With Corepack
installed, run `corepack enable` to make the pinned pnpm version available.

```sh
pnpm install --frozen-lockfile
cp config.example.js config.js
```

Fill in `config.js` with your integration settings. It is ignored by Git.

Sonos runs inside this Node backend using the [`sonos`](https://github.com/bencevans/node-sonos)
library. It discovers speakers, reads an initial snapshot, and uses local UPnP
subscriptions to push playback, track, volume and group changes to the browser.
Bursts of notifications trigger one refresh of the affected group. A one-minute
recovery check reconciles state and renews or repairs subscriptions; no separate
Sonos process, configured webhook, account or API key is needed.
The Sonos tab supports play/pause, previous/next and speaker volume. Playback
commands go to the room's current group coordinator; volume targets that room.
The backend must be able to reach the speakers on your LAN, and speakers must be
able to reach its subscription callback listener. The listener runs inside the
same Node process on an automatically allocated port and closes on shutdown.
If multicast discovery is unavailable, set the optional `sonos.host` to one
speaker's IP address. `no-poll` reads a single snapshot without subscriptions or
the recovery timer.
The old `sonos.api` and `sonos.feed` settings are ignored.

Run all tests with `pnpm test`. Integration tests stay in their respective
integration folders; the Sonos tests use simulated speakers.

Start the backend watcher and Vite client together:

```sh
pnpm run dev
```

Open `http://localhost:8080`. Vite forwards `/socket.io` (HTTP and WebSocket)
and `/reloadAll` to the backend on port 8081. The browser uses the same-origin
socket connection in development and production. Ctrl-C stops both processes.

To run them in separate terminals:

```sh
pnpm run dev:server   # backend on port 8081
pnpm run dev:client   # Vite client on port 8080
```

Use `pnpm run dev:no-poll` for both processes, or
`pnpm run dev:server:no-poll` for the backend alone, to fetch each enabled service
once without scheduling further polling. Run `pnpm run tsc` to check the browser,
Vite configuration, and server types. Browser code uses `tsconfig.json`; the
native ESM server uses `tsconfig.server.json`.

Node 26 runs the server's TypeScript directly. The server dev commands use
`node --watch`, which restarts when the entry point or imported files change,
including `config.js`. Node strips types but does not check them; run
`pnpm run tsc` separately to check with TypeScript 7.

For TypeScript 7 diagnostics in VS Code, install Microsoft's
[TypeScript 7 extension](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview)
and run `TypeScript: Enable TypeScript 7` from the Command Palette.

`src/package.json` marks source files as ESM. The root `config.js` remains
CommonJS (`module.exports`), so existing configuration files keep working.
Server imports use explicit file extensions and `import type` for types;
the server TypeScript configuration checks these native Node requirements.

To open the dev client from another device, use `pnpm run dev:client --host`
alongside `pnpm run dev:server`, then open the Mac's network address on port 8080.

For production:

```sh
pnpm run build
pnpm run serve
```

Express serves the built client at `/` on port 8081. `pnpm run host` builds and
starts it in one command. Installation is a separate step; the build does not
install or update dependencies. After building the client with dev dependencies
installed, production only needs Node 26, the source/configuration files, `dist`,
and production dependencies (`pnpm install --prod --frozen-lockfile`).

Vite builds `src/index.html` into the root `dist` directory. Icons are React
components loaded with `import.meta.glob` and `?react`; SVG images, PNGs, and WebM
videos remain asset URLs. SVG icon optimization and `viewBox` preservation are
configured in `vite.config.mts`. Vite copies image/video assets without Parcel's
image optimization, so some assets are larger than before.

The optional `serve-forever` and `host-forever` scripts require `forever` to be
installed separately and available on `PATH`.

Commit `pnpm-lock.yaml` when changing dependencies. Use
`pnpm install --frozen-lockfile` in CI and deployment to reproduce the locked
installation.
