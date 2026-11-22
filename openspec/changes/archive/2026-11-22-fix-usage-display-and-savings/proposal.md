# Proposal

## Why

Der Audit (F5, F7) zeigt, dass der Code an drei Stellen von der Spez abweicht oder
Schaetzungen systematisch leicht falsch rechnet: `formatPercentage` rundet statt
abzuschneiden, die Saved-Schaetzung ignoriert Context-Preistiers und Cache-Write-Kosten,
und die Cache-Trefferquote zaehlt Writes im Nenner nicht. Zusaetzlich erzeugt
`sameModel` ohne `variant`-Vergleich gelegentlich ein falsches Modell-Label.

## What Changes

- `formatPercentage` schneidet auf zwei Nachkommastellen ab statt zu runden
  (`42.268` → `42.26%`) — Code und Test folgen der bestehenden Spez.
- Die Saved-Schaetzung (`sessionSavings`) preist Calls ueber der Context-Schwelle des
  Modells mit dem Context-Tier statt nur mit dem Basistier.
- Die Saved-Schaetzung zieht die Cache-Write-Kosten (Ueberpreis gegenueber Input) ab,
  statt sie zu ignorieren, und wird bei negativem Ergebnis auf 0 geklemmt.
- `cacheHitRate` nimmt `cacheWrite` in den Nenner — Spez-Formel und Code werden
  gemeinsam angepasst (Delta-Spec).
- Fehlende Token-Werte im Session-Total werden als bare `—` statt `— tok` ausgegeben
  (Platzhalter-Harmonisierung mit dem Skills-Header).

Bewusst NICHT geaendert (dokumentiert in design.md): `sameModel`/`variant` (F7.6 —
nicht reproduzierbar, `findModel` matched nur provider/id, Host-Katalog hat einen
Eintrag pro provider/id ohne `variant`-Feld), getrennte Quellen bei
`Saved (est.)` vs. `Session Total` (F7.1), Praezision jenseits
`Number.MAX_SAFE_INTEGER` (F7.7), fail-closed Usage-Bars (F7.9), Einzelrundung in
`formatTokenTotal` (F7.10), Title-Generierung im Session-Total (F7.11), Context-Fill
waehrend laufendem Turn (F7.12).

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `oc-session-control`:
  - Requirement „Show cache hit rates and the latest call" — Trefferquote-Nenner
    ergaenzt um `cache write` (Delta-Spec).
  - Requirement „Estimate cache savings" — Preisauswahl mit Context-Tier und
    Abzug der Cache-Write-Kosten (Delta-Spec).

## Impact

- Code: `src/usage.mjs` (`formatPercentage`, `sessionSavings`, `cacheHitRate`),
  `src/view-model.mjs` (`sameModel`), `src/dashboard.tsx` (Platzhalter,
  `cacheHitRate`-Aufruf mit `cacheWrite`).
- Tests: `src/usage.test.mjs`, `src/view-model.test.mjs` (Formeln, Tier-Preise,
  Variant-Label, Platzhalter).
- Spez: zwei Delta-Specs unter `openspec/changes/fix-usage-display-and-savings/specs/oc-session-control/`.
- Keine Aenderungen an Host-Daten, Plugin-API oder Abhaengigkeiten.
