#!/usr/bin/env node
/**
 * ============================================================
 *  generate-test-report.js — Rapport de tests SweatBook
 * ============================================================
 *  Génère `test-report.md` à partir des résultats JSON produits
 *  par les deux suites de tests :
 *
 *    - test-report-api.json → Vitest    (tests/api/*.test.js)
 *    - test-report-e2e.json → Playwright (tests/e2e/*.spec.js)
 *
 *  Utilisé par le workflow GitHub Actions `.github/workflows/test-report.yml`
 *  après chaque push, mais peut être lancé localement :
 *
 *      npm run test -- --run --reporter=json --outputFile=test-report-api.json
 *      PLAYWRIGHT_JSON_OUTPUT_NAME=test-report-e2e.json \
 *        npm run test:e2e -- --reporter=json
 *      node scripts/generate-test-report.js
 *
 *  Le script tolère l'absence d'un (ou des) rapport(s) : le rapport
 *  indique alors « résultats introuvables » au lieu de planter — utile
 *  quand une suite n'a pas pu s'exécuter du tout.
 *
 *  Variables d'environnement (toutes optionnelles) :
 *    API_REPORT      chemin du rapport Vitest      (déf. test-report-api.json)
 *    E2E_REPORT      chemin du rapport Playwright  (déf. test-report-e2e.json)
 *    REPORT_OUTPUT   fichier Markdown généré        (déf. test-report.md)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const API_REPORT = process.env.API_REPORT ?? 'test-report-api.json';
const E2E_REPORT = process.env.E2E_REPORT ?? 'test-report-e2e.json';
const REPORT_OUTPUT = process.env.REPORT_OUTPUT ?? 'test-report.md';

// ------------------------------------------------------------
// Lecture des rapports JSON
// ------------------------------------------------------------

/** Lit un fichier JSON ; retourne null s'il est absent ou illisible. */
function readJson(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.warn(`⚠️  Rapport illisible (${file}) : ${err.message}`);
    return null;
  }
}

/** Normalise un statut de test en 'pass' | 'fail' | 'skip'. */
function normalizeStatus(status) {
  if (status === 'passed' || status === 'expected') return 'pass';
  if (status === 'failed' || status === 'unexpected') return 'fail';
  return 'skip'; // pending, todo, skipped, disabled, flaky…
}

const EMOJI = { pass: '✅', fail: '❌', skip: '⏭️' };
const LABEL = { pass: 'Passé', fail: 'Échoué', skip: 'Ignoré' };

// Un échec dû à l'absence de serveur (backend Sprint 5 pas encore écrit)
// n'est pas un vrai échec : on le bascule en « ignoré — backend pending ».
const SERVER_DOWN_RE = /ECONNREFUSED|fetch failed|ENOTFOUND|network error/i;

// ------------------------------------------------------------
// Rapport API — format JSON de Vitest (compatible Jest)
//   { testResults: [ { name, status, assertionResults: [ … ] } ], … }
// ------------------------------------------------------------

function parseApiReport(json) {
  if (!json) return null;
  const files = [];
  for (const fileResult of json.testResults ?? []) {
    const tests = (fileResult.assertionResults ?? []).map((assertion) => {
      const error = (assertion.failureMessages ?? [])[0] ?? null;
      let status = normalizeStatus(assertion.status);
      // Serveur absent (ECONNREFUSED…) → "skipped (backend pending)".
      if (status === 'fail' && error && SERVER_DOWN_RE.test(error)) {
        status = 'skip';
      }
      return {
        name: assertion.fullName ?? assertion.title ?? '(test)',
        status,
        error: status === 'fail' ? error : null,
      };
    });
    files.push({
      name: path.relative(process.cwd(), fileResult.name ?? '(fichier inconnu)'),
      tests,
    });
  }

  const summary = summarize(files);
  // Tous les tests API ignorés → note « backend pending » (Sprint 5).
  if (summary.total > 0 && summary.passed === 0 && summary.failed === 0) {
    summary.note =
      '⏭️ **skipped (backend pending)** — le serveur API (Sprint 5) n\'existe pas encore :' +
      ' ces tests sont ignorés au lieu d\'échouer. Ils s\'exécuteront automatiquement' +
      ' dès que le backend sera disponible (`npm run test:api`).';
  }
  return summary;
}

// ------------------------------------------------------------
// Rapport E2E — format JSON de Playwright
//   { suites: [ { file, specs: [ { file, ok, tests: [ { status } ] } ] } ], … }
// ------------------------------------------------------------

/** Parcourt récursivement l'arbre de suites Playwright et collecte les specs. */
function collectSpecs(suite, acc = []) {
  for (const spec of suite.specs ?? []) acc.push(spec);
  for (const child of suite.suites ?? []) collectSpecs(child, acc);
  return acc;
}

function parseE2eReport(json) {
  if (!json) return null;

  const byFile = new Map();
  for (const rootSuite of json.suites ?? []) {
    for (const spec of collectSpecs(rootSuite)) {
      const file = spec.file ?? rootSuite.file ?? '(fichier inconnu)';
      if (!byFile.has(file)) byFile.set(file, []);

      // Un spec = un test (un seul project Playwright : chromium).
      // Statut le plus défavorable parmi les exécutions du spec.
      const statuses = (spec.tests ?? []).map((t) => normalizeStatus(t.status));
      let status = 'skip';
      if (statuses.includes('fail')) status = 'fail';
      else if (statuses.includes('pass')) status = 'pass';

      const firstError = (spec.tests ?? [])
        .flatMap((t) => t.results ?? [])
        .map((r) => r.error?.message)
        .find(Boolean);

      byFile.get(file).push({
        name: spec.title ?? '(test)',
        status,
        error: firstError ?? null,
      });
    }
  }

  return summarize([...byFile].map(([name, tests]) => ({ name, tests })));
}

/** Calcule les totaux par fichier et globaux à partir des tests. */
function summarize(files) {
  const counts = { pass: 0, fail: 0, skip: 0 };
  for (const file of files) {
    file.counts = { pass: 0, fail: 0, skip: 0 };
    for (const test of file.tests) {
      file.counts[test.status] += 1;
      counts[test.status] += 1;
    }
  }
  return {
    files,
    total: counts.pass + counts.fail + counts.skip,
    passed: counts.pass,
    failed: counts.fail,
    skipped: counts.skip,
  };
}

// ------------------------------------------------------------
// Génération du Markdown
// ------------------------------------------------------------

const STATUS_ICON = { pass: '✅', fail: '❌', skip: '⏭️' };

function renderSuite(title, report, missingMessage) {
  const lines = [`## ${title}`, ''];

  if (!report) {
    lines.push(`> ⚠️ ${missingMessage}`, '');
    return lines;
  }

  if (report.note) {
    lines.push(`> ${report.note}`, '');
  }

  lines.push('| Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |');
  lines.push('|---:|---:|---:|---:|');
  lines.push(`| ${report.total} | ${report.passed} | ${report.failed} | ${report.skipped} |`);
  lines.push('');
  lines.push('### Détail par fichier de test', '');

  for (const file of report.files) {
    lines.push(
      `**\`${file.name}\`** — ${file.tests.length} test(s) : ` +
        `✅ ${file.counts.pass} · ❌ ${file.counts.fail} · ⏭️ ${file.counts.skip}`,
    );
    lines.push('');
    lines.push('| Test | Statut |');
    lines.push('|---|---|');
    for (const test of file.tests) {
      // Quand tout est ignoré en attente du backend, on l'indique explicitement.
      const label =
        report.note && test.status === 'skip'
          ? 'Ignoré — skipped (backend pending)'
          : LABEL[test.status];
      lines.push(`| ${test.name} | ${STATUS_ICON[test.status]} ${label} |`);
    }
    lines.push('');

    const failures = file.tests.filter((t) => t.status === 'fail' && t.error);
    if (failures.length > 0) {
      lines.push('<details><summary>🚨 Erreurs</summary>', '');
      for (const test of failures) {
        lines.push(`- **${test.name}** : \`${test.error.split('\n')[0]}\``);
      }
      lines.push('', '</details>', '');
    }
  }
  return lines;
}

function render(api, e2e) {
  const now = new Date();
  const total = (api?.total ?? 0) + (e2e?.total ?? 0);
  const failed = (api?.failed ?? 0) + (e2e?.failed ?? 0);
  const passed = (api?.passed ?? 0) + (e2e?.passed ?? 0);
  const skipped = (api?.skipped ?? 0) + (e2e?.skipped ?? 0);

  let globalStatus;
  if (!api && !e2e) {
    globalStatus = '⚠️ **AUCUN RÉSULTAT** — aucune suite de tests n\'a produit de rapport.';
  } else if (failed > 0) {
    globalStatus = `❌ **ÉCHEC** — ${failed} test(s) en échec sur ${total} exécuté(s).`;
  } else if (total === 0) {
    globalStatus = '⚠️ **AUCUN TEST EXÉCUTÉ** — rapports présents mais vides.';
  } else if (passed === 0 && skipped > 0) {
    globalStatus =
      `⏭️ **EN ATTENTE (backend pending)** — ${skipped} test(s) ignoré(s) en attendant` +
      ' le backend (Sprint 5). Aucun échec.';
  } else {
    globalStatus = `✅ **SUCCÈS** — les ${passed} test(s) exécuté(s) passent tous.`;
  }

  const lines = [
    '# 📊 Rapport de tests — SweatBook',
    '',
    '> Fichier généré automatiquement par `scripts/generate-test-report.js`.',
    '> Le workflow GitHub Actions **Test Report** le met à jour et le commit',
    '> à chaque push sur `main`. **Ne pas modifier à la main.**',
    '',
    '## 📅 Exécution',
    '',
    '| | |',
    '|---|---|',
    `| Date | ${now.toISOString()} |`,
    `| Commit | \`${process.env.GITHUB_SHA ?? 'local'}\` |`,
    `| Branche | \`${process.env.GITHUB_REF_NAME ?? 'locale'}\` |`,
    '',
    '## 📈 Résumé',
    '',
    '| Suite | Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |',
    '|---|---:|---:|---:|---:|',
    `| API (Vitest) | ${api?.total ?? '—'} | ${api?.passed ?? '—'} | ${api?.failed ?? '—'} | ${api?.skipped ?? '—'} |`,
    `| E2E (Playwright) | ${e2e?.total ?? '—'} | ${e2e?.passed ?? '—'} | ${e2e?.failed ?? '—'} | ${e2e?.skipped ?? '—'} |`,
    `| **Total** | **${total}** | **${passed}** | **${failed}** | **${skipped}** |`,
    '',
    ...renderSuite(
      '🧪 Tests API (Vitest)',
      api,
      `Résultats introuvables (\`${API_REPORT}\`). La suite API ne s'est pas exécutée ou le rapport n'a pas été produit.`,
    ),
    ...renderSuite(
      '🌐 Tests E2E (Playwright)',
      e2e,
      `Résultats introuvables (\`${E2E_REPORT}\`). La suite E2E ne s'est pas exécutée ou le rapport n'a pas été produit.`,
    ),
    '## 🏁 Statut global',
    '',
    globalStatus,
    '',
  ];

  return lines.join('\n');
}

// ------------------------------------------------------------
// Point d'entrée
// ------------------------------------------------------------

const api = parseApiReport(readJson(API_REPORT));
const e2e = parseE2eReport(readJson(E2E_REPORT));

writeFileSync(REPORT_OUTPUT, render(api, e2e), 'utf8');

const fmt = (report) =>
  report ? `${report.passed}/${report.total} passés (${report.failed} échoués)` : 'rapport absent';
console.log(`✅ Rapport écrit dans ${REPORT_OUTPUT}`);
console.log(`   - API : ${fmt(api)}`);
console.log(`   - E2E : ${fmt(e2e)}`);
