# Tasks

## 1. Prozentformatierung (F5)

- [x] 1.1 `formatPercentage` in `src/usage.mjs` von `Math.round` auf `Math.trunc`
      umstellen und den Test „formats cache percentages and TTL thresholds" in
      `src/usage.test.mjs` auf `42.26%` drehen — Verifikation: `npm test` grün,
      `42.268` ergibt exakt `42.26%`

## 2. Saved-Schätzung: Context-Tier und Write-Premium (F7.2/F7.3/F7.4)

- [x] 2.1 Context-Tier-Auswahl in `sessionSavings` (`src/usage.mjs`) implementieren
      (genutztes Fenster `input + cache.read + cache.write` gegen
      `pricing.tier?.size`) — Verifikation: neuer Test in `src/usage.test.mjs`, ein
      Call über der Schwelle wird mit Tier-Preisen statt Basis-Preisen bewertet
- [x] 2.2 Write-Premium `write*(cacheWrite − input)` in die Formel einbauen und das
      Ergebnis mit `Math.max(0, …)` klemmen — Verifikation: Tests in
      `src/usage.test.mjs`, die (a) Writes > 0 die Schätzung senken und (b) ein
      Premium über dem Savings die Schätzung auf 0 statt negativ setzen
- [x] 2.3 Gesamtverifikation der Schätzung — Verifikation: `npm test` grün, alle
      bestehenden `known`/`missing`-Szenarien unverändert

## 3. Cache-Trefferquote (F7.5)

- [x] 3.1 `cacheHitRate` um den Parameter `cacheWrite` erweitern (Nenner
      `input + cacheRead + cacheWrite`) und beide Aufrufer (`dashboard.tsx:262`,
      `lastCacheCallStats` in `src/usage.mjs`) mit `tokens.cache?.write` füttern —
      Verifikation: Test in `src/usage.test.mjs` mit Writes > 0 zeigt die tiefere
      Rate, bestehende Writes-0-Tests bleiben stabil
- [x] 3.2 Delta-Spec gegen den Code prüfen — Verifikation:
      `openspec validate --specs` läuft ohne neue Fehler durch, die geänderte
      Formel steht identisch in `specs/oc-session-control/spec.md`

## 4. Modell-Label (F7.6)

- [x] 4.1 F7.6 als nicht reproduzierbar dokumentieren und den Befund im
      FINDINGS-File korrigieren — Verifikation: design.md (Entscheidung 6),
      proposal.md und FINDINGS-subagent-audit.md enthalten die Korrektur,
      `src/view-model.mjs` bleibt unverändert

## 5. Platzhalter-Harmonisierung (F7.8)

- [x] 5.1 Helfer in `src/usage.mjs` ergänzen (gültig → `"<wert> tok"`, ungültig →
      `—`) und in `src/dashboard.tsx` an den drei `— tok`-Stellen (Session-Total-
      Summary, ↓ Input, ↑ Output) verwenden; Skills-Header und Skill-Zeilen
      bleiben unberührt — Verifikation: Unit-Test des Helfers in
      `src/usage.test.mjs` plus `npx tsc --noEmit`

## 6. Integrationsprüfung

- [x] 6.1 Kompletter Lauf — Verifikation: `npm test`, `npx tsc --noEmit` und
      `openspec validate --specs` alle ohne Fehler (nur die bekannte
      vorbestehende >500z-Warnung)
