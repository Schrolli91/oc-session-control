# Design

## Context

Siehe proposal.md (Why). Betroffene Stellen: `sessionSavings`/`cacheHitRate`/
`formatPercentage` in `src/usage.mjs`, `sameModel` in `src/view-model.mjs`, die
Session-Total-Platzhalter in `src/dashboard.tsx`. `getModelBaseCost` liefert bereits
`input`, `cache.read`, `cache.write` und ein optionales `tier: { type: "context",
size }` (siehe `src/model-details.mjs`, das Context-Tier bereits anzeigt). Der
Host-DB-Stand: `cache.write` ist durchgehend 0, die Write-Formeln sind also
Vorbereitung auf echte Writes, sichtbar erst später.

## Goals / Non-Goals

**Goals:**
- Code und Spez decken sich bei Prozentformatierung und Trefferquote.
- Saved-Schätzung rechnet mit den Preisen, die tatsächlich gelten (Context-Tier,
  Write-Premium) und wird nie negativ.
- Platzhalter für fehlende Token-Werte sind überall gleich (`—`).

**Non-Goals:**
- Host-seitige Daten ändern (Title-Generierung im Total, `cache.write = 0`).
- Fail-closed-Verhalten der Usage-Bars, Einzelrundung von `formatTokenTotal`,
  Context-Fill-Timing während laufender Turns.
- Live-Läufe gegen den Host.

## Decisions

1. **`Math.trunc` statt `Math.round` in `formatPercentage`** — Die Spez verlangt
   „truncated to two decimal places"; Spez ist die Quelle, der Test wird auf
   `42.26%` gedreht. Alternative (Spez auf Runden umstellen) verworfen, weil dann
   der Rundungstext neu formuliert werden müsste und der Befund nicht behoben,
   sondern nur verschoben wäre.

2. **Context-Tier-Wahl in `sessionSavings` pro Call** — Für jeden Call das genutzte
   Fenster (`input + cache.read + cache.write` aus `info.tokens`) gegen
   `pricing.tier?.size` prüfen: darüber die Tier-Preise, darunter (oder ohne Tier)
   die Basis-Preise. Fehlt die Token-Summe oder der Tier, greift die bisherige
   Basis-Preis-Logik (Best-effort, `known: false` bleibt die Fallback-Kennzeichnung
   für komplett ungeprüfbare Calls). Alternative: pauschal für die Session —
   verworfen, weil ein Modell-Wechsel innerhalb der Session unterschiedliche
   Calls mischt.

3. **Write-Premium in der Saved-Formel** — `estimate = read*(input − cacheRead)
   − write*(cacheWrite − input)`, weiter durch 1e6 geteilt; danach
   `Math.max(0, …)` als Clamp (F7.2). Alternative: nur klemmen ohne Premium —
   verworfen, weil der Befund (Überzeichnung bei Writes) dann offen bleibt.

4. **`cacheHitRate` bekommt einen dritten Parameter `cacheWrite`** — Nenner wird
   `input + cacheRead + cacheWrite`. Beide Aufrufer (`dashboard.tsx:262` für die
   Familienrate, `lastCacheCallStats` pro Call) reichen `tokens.cache?.write` mit.
   Ungültige/fehlende Werte bleiben `undefined` wie bisher. Spez-Delta dazu in
   `specs/oc-session-control/spec.md`.

5. **`sameModel` vergleicht `variant` zusätzlich** — `providerID`, `id` UND
   `variant`. Fehlt `variant` auf beiden Seiten, bleibt das Ergebnis wie bisher.

6. **F7.6 `sameModel`/`variant` verworfen — nicht reproduzierbar** — Geprueft gegen
   `@opencode/schema`: `Model.Ref` traegt `variant?`, der Host-Katalog
   (`model.list`) liefert EINEN Eintrag pro provider/id mit `limit` am Eintrag und
   `variants[]` nur als Request-Overrides (headers/body/settings) — kein `variant`
   am Eintrag, keine Context-Limits pro Variante. `findModel` matched nur
   providerID + id, daher liefern `findModel(usageModelRef)` und
   `findModel(modelRef)` bei gleicher provider/id ohnehin denselben Eintrag: der
   Varianten-Vergleich in `sameModel` waere ein No-Op ohne beobachtbare Wirkung.
   Alternative (findModel variant-sensitiv machen) verworfen, weil der Katalog die
   Daten dortfuer nicht liefert.

7. **Platzhalter: Session-Total-Zeilen zeigen `—` statt `— tok`** — Der
   Skills-Header (`—`, spezifiziert) ist die Referenz. Die Skill-Listen-Zeilen
   (`— tok`) bleiben unberührt: die sind explizit als `— tok` spezifiziert und
   gehörten nicht zum Befund. Umsetzung über einen kleinen Helfer
   (`formatTokenCountWithUnit` o.ä. in `usage.mjs`), damit die ` tok`-Einheit nur
   bei gültigen Werten angehängt wird — nicht an jeder Call-Site eine
   Nebenbedingung.

## Risks / Trade-offs

- [Write-Premium und Context-Tier sind bei `cache.write = 0` und Basis-Modellen
  wirkungslose Pfade] → Tests mit künstlich nicht-null Werten schreiben, sonst
  stirbt der Code ungetestet.
- [Nenner-Änderung an `cacheHitRate` verschiebt sichtbare Raten, sobald Writes >
  0 gemeldet werden] → beabsichtigt (Spez-Delta), ein bestehender Test mit
  Writes 0 bleibt stabil.
- [Context-Tier-Schwelle aus `info.tokens` geschätzt, nicht aus dem Host-Billing]
  → Näherung; `known`/`missing`-Kennzeichnung der Saved-Schätzung bleibt
  unverändert, Fehlschläge fallen weiter auf `known: false` zurück.

## Migration Plan

Keine — reine Verhaltenskorrektur im Plugin, kein Daten- oder Schema-Wechsel.
Rollback = vorheriger Stand.

## Open Questions

Keine.
