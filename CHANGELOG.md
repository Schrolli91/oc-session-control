# Changelog

## [0.5.0](https://github.com/Schrolli91/oc-session-control/compare/v0.4.2...v0.5.0) (2026-11-23)


### Features

* show update availability in dashboard ([#31](https://github.com/Schrolli91/oc-session-control/issues/31)) ([8f4bbdf](https://github.com/Schrolli91/oc-session-control/commit/8f4bbdf0e48f39916643baa726aa66b50f4a86c8))

## [0.4.2](https://github.com/Schrolli91/oc-session-control/compare/v0.4.1...v0.4.2) (2026-11-23)


### Bug Fixes

* keep context current after compaction ([#38](https://github.com/Schrolli91/oc-session-control/issues/38)) ([118d3c3](https://github.com/Schrolli91/oc-session-control/commit/118d3c324ba0ef87842b19e72288d8c2180e0774))
* revert context after compaction ([#39](https://github.com/Schrolli91/oc-session-control/issues/39)) ([920f39c](https://github.com/Schrolli91/oc-session-control/commit/920f39c532ad1d09f4019a473598d753dc1f2db1))
* underline clickable model names ([#36](https://github.com/Schrolli91/oc-session-control/issues/36)) ([e3a3761](https://github.com/Schrolli91/oc-session-control/commit/e3a37615651252a58bab0bb18d36b0b94c81ce87))
* use trailing ellipsis for cache section titles ([#35](https://github.com/Schrolli91/oc-session-control/issues/35)) ([3764190](https://github.com/Schrolli91/oc-session-control/commit/37641900c2d3bd055cc999d721dca975b763f808))


### Documentation

* **openspec:** sync and archive issue 29 change ([#37](https://github.com/Schrolli91/oc-session-control/issues/37)) ([2f57695](https://github.com/Schrolli91/oc-session-control/commit/2f57695fd583bbf3a645d80111a513fbba65e91d))
* streamline README ([#32](https://github.com/Schrolli91/oc-session-control/issues/32)) ([6055572](https://github.com/Schrolli91/oc-session-control/commit/6055572a800760e194880ead00c8ceaa30dee7a4))

## [0.4.1](https://github.com/Schrolli91/oc-session-control/compare/v0.4.0...v0.4.1) (2026-11-23)


### Bug Fixes

* avoid redundant transcript refreshes ([#26](https://github.com/Schrolli91/oc-session-control/issues/26)) ([775cfe8](https://github.com/Schrolli91/oc-session-control/commit/775cfe8a1b588e079d239b2bc9c182bb67c947f4))

## [0.4.0](https://github.com/Schrolli91/oc-session-control/compare/v0.3.0...v0.4.0) (2026-11-23)


### Features

* **dashboard:** show per-agent cache stats ([#24](https://github.com/Schrolli91/oc-session-control/issues/24)) ([8b4c15b](https://github.com/Schrolli91/oc-session-control/commit/8b4c15b116a5534a2bbca8c21542da3070830452))


### CI

* run PR checks and metadata independently ([#23](https://github.com/Schrolli91/oc-session-control/issues/23)) ([1a2edbc](https://github.com/Schrolli91/oc-session-control/commit/1a2edbcd2b88e80f888b4172cdc26162f00009d0))

## [0.3.0](https://github.com/Schrolli91/oc-session-control/compare/v0.2.0...v0.3.0) (2026-11-22)


### Features

* show main and subagent costs in blue accent ([#10](https://github.com/Schrolli91/oc-session-control/issues/10)) ([e2d8219](https://github.com/Schrolli91/oc-session-control/commit/e2d82197e95d11a46fc0a08735d0b4b2a25c8d3c))


### Bug Fixes

* align cache rate and savings estimate with the spec ([#18](https://github.com/Schrolli91/oc-session-control/issues/18)) ([5baf36f](https://github.com/Schrolli91/oc-session-control/commit/5baf36fb195d6b7c3ff43fe376624f63b42cda57))
* count each agent's cost exactly once ([#16](https://github.com/Schrolli91/oc-session-control/issues/16)) ([fdbeab5](https://github.com/Schrolli91/oc-session-control/commit/fdbeab5cef11b7df804b83dd4183a43e19afbe5e))
* fall back to host muted for faint text ([#13](https://github.com/Schrolli91/oc-session-control/issues/13)) ([3849c7c](https://github.com/Schrolli91/oc-session-control/commit/3849c7ca7b390daed64da988d0bf3e9f3a78b0ca))
* hide Subagents cost row when the session has no subagents ([#20](https://github.com/Schrolli91/oc-session-control/issues/20)) ([e30f198](https://github.com/Schrolli91/oc-session-control/commit/e30f19887b64e8a45485fb4811e7f550c682f812))
* price cache savings per assistant call ([#14](https://github.com/Schrolli91/oc-session-control/issues/14)) ([2afedf2](https://github.com/Schrolli91/oc-session-control/commit/2afedf27eb7f388fa0f11818775ef60afd33d918))
* read the whole session transcript for message-derived values ([#17](https://github.com/Schrolli91/oc-session-control/issues/17)) ([73175f0](https://github.com/Schrolli91/oc-session-control/commit/73175f02077b8c028c37cb4db7285ed9265cc514))
* show the session's selected model in the agent row ([#15](https://github.com/Schrolli91/oc-session-control/issues/15)) ([ddd8322](https://github.com/Schrolli91/oc-session-control/commit/ddd8322fa380e1609eab4bba81e163c6afcde77d))
* use muted color for TTL dot fallback ([#12](https://github.com/Schrolli91/oc-session-control/issues/12)) ([48a1ba2](https://github.com/Schrolli91/oc-session-control/commit/48a1ba25962d94ae7bf4c480c98ec9d78e2288c2))


### Tests

* cover the audit test gaps ([#19](https://github.com/Schrolli91/oc-session-control/issues/19)) ([49e0aea](https://github.com/Schrolli91/oc-session-control/commit/49e0aea3e2fe4d64750bb81ea1673cca613e9233))

## [0.2.0](https://github.com/Schrolli91/oc-session-control/compare/v0.1.2...v0.2.0) (2026-11-22)


### Features

* OpenCode TUI plugin for session costs and context usage ([49332b6](https://github.com/Schrolli91/oc-session-control/commit/49332b6c5f5d302e2154b4196bb4a1634e0098c2))


### Documentation

* mention hiding the built-in Context panel ([#5](https://github.com/Schrolli91/oc-session-control/issues/5)) ([e12990f](https://github.com/Schrolli91/oc-session-control/commit/e12990fde4c8c9e0b4f422d511ab9cc59a8e042c))


### CI

* automate releases with release-please ([#4](https://github.com/Schrolli91/oc-session-control/issues/4)) ([659c188](https://github.com/Schrolli91/oc-session-control/commit/659c188bfcd96f6192e63889baddc329d8352b5d))
* consolidate release workflows into release.yml ([#8](https://github.com/Schrolli91/oc-session-control/issues/8)) ([7126599](https://github.com/Schrolli91/oc-session-control/commit/7126599bc3f3129d8d58a151251518026e91c2d1))
* enforce conventional commit PR titles ([#2](https://github.com/Schrolli91/oc-session-control/issues/2)) ([7a6425c](https://github.com/Schrolli91/oc-session-control/commit/7a6425cdc026dced9293ff470b741d41dbebe488))
* rename release labels and fix type-label removal ([#7](https://github.com/Schrolli91/oc-session-control/issues/7)) ([7a85414](https://github.com/Schrolli91/oc-session-control/commit/7a85414a204b7da1abbf4a04a889516d1ca15299))


### Miscellaneous

* **main:** release oc-session-control 0.2.0 ([#6](https://github.com/Schrolli91/oc-session-control/issues/6)) ([112af7f](https://github.com/Schrolli91/oc-session-control/commit/112af7f7f1a2eefe811fc54403c6c78a7d503840))
* release 0.1.2 ([8a00232](https://github.com/Schrolli91/oc-session-control/commit/8a00232b384cea96f49d85c4b3866ea1649d4335))
