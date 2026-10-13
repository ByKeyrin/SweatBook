/**
 * ============================================================
 *  Tests E2E — 📓 Journal des séances (tests/e2e/journal.spec.js)
 * ============================================================
 *
 *  🎓 C'est quoi un test E2E ?
 *  « E2E » = End-To-End (« de bout en bout »). Playwright ouvre un vrai
 *  navigateur Chromium et simule un utilisateur : il lit la page, clique
 *  sur les boutons, remplit les formulaires… puis on vérifie le résultat
 *  avec `expect(...)`.
 *
 *  Anatomie d'un test :
 *    test('description claire', async ({ page }) => {
 *      await page.goto('/');                 // 1. aller sur une page
 *      await page.getByRole(...).click();    // 2. faire quelque chose
 *      await expect(page.getByText(...))     // 3. vérifier le résultat
 *        .toBeVisible();
 *    });
 *
 *  📖 Lire aussi : tests/README.md
 */
import { test, expect } from '@playwright/test';
import {
  navigateTo,
  openSessionForm,
  fillSessionForm,
  makeSession,
} from '../helpers/test-utils.js';

// `describe` regroupe les tests liés au même écran / la même fonctionnalité.
test.describe('📓 Journal des séances', () => {
  /**
   * Test 1 — Chargement de la page.
   * Quand j'ouvre l'app, je dois voir le Journal : le titre de l'app,
   * la navigation et le bouton pour ajouter une séance.
   */
  test('affiche le journal au chargement', async ({ page }) => {
    await page.goto('/');

    // Le titre de l'app est visible
    await expect(page.getByText('SweatBook').first()).toBeVisible();

    // La navigation principale est là (liens vers les 3 pages)
    await expect(page.getByRole('link', { name: /journal/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /graphiques/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /planning/i }).first()).toBeVisible();

    // Le bouton d'ajout est présent (parcours « Je note ma sortie du jour »)
    await expect(page.getByRole('button', { name: /nouvelle séance/i })).toBeVisible();
  });

  /**
   * Test 2 — Ajout d'une séance.
   * Parcours complet : ouvrir le formulaire, remplir les champs
   * obligatoires (date, type, distance, durée) puis enregistrer.
   * La séance doit apparaître immédiatement dans le journal.
   */
  test('ajoute une séance depuis le formulaire', async ({ page }) => {
    await page.goto('/');

    const session = makeSession(); // 15,5 km en 82 min (sortie longue)

    await openSessionForm(page);       // clique sur « + Nouvelle séance »
    await fillSessionForm(page, session); // remplit + clique sur « Enregistrer »

    // La nouvelle séance apparaît dans la liste (distance affichée à 1 décimale)
    await expect(page.getByText(/15[,.]5\s*km/).first()).toBeVisible();

    // Le type de sortie est affiché dans la liste (libellé français de l'UI).
    // `.filter({ visible: true })` ignore les éléments cachés — par exemple
    // les <option> du formulaire replié qui contiennent aussi « Sortie longue ».
    await expect(
      page.getByText(/sortie longue/i).filter({ visible: true }).first()
    ).toBeVisible();
  });

  /**
   * Test 3 — Affichage de la liste.
   * Après deux ajouts, la liste contient bien les séances, de la plus
   * récente à la plus ancienne (voir docs/TECHNICAL.md §5.1).
   */
  test('affiche la liste des séances (plus récente d\'abord)', async ({ page }) => {
    await page.goto('/');

    // 1ʳᵉ séance : 5 km faciles le 10/10/2026
    await openSessionForm(page);
    await fillSessionForm(page, makeSession({
      date: '2026-10-10',
      type: 'easy',
      distance_km: 5,
      duration_min: 30,
      notes: 'Première sortie',
    }));

    // 2ᵉ séance : 12 km tempo le 12/10/2026
    await openSessionForm(page);
    await fillSessionForm(page, makeSession({
      date: '2026-10-12',
      type: 'tempo',
      distance_km: 12,
      duration_min: 60,
      notes: 'Deuxième sortie',
    }));

    // Les deux séances sont visibles dans le journal
    await expect(page.getByText('Première sortie')).toBeVisible();
    await expect(page.getByText('Deuxième sortie')).toBeVisible();

    // Vérifions l'ordre : la plus récente (12/10) AVANT la plus ancienne (10/10)
    const recent = page.getByText('Deuxième sortie');
    const old = page.getByText('Première sortie');
    const boxRecent = await recent.boundingBox();
    const boxOld = await old.boundingBox();
    expect(boxRecent.y).toBeLessThan(boxOld.y);
  });

  /**
   * Test 4 — Validation du formulaire (côté client).
   * Une distance <= 0 est refusée avec un message clair en français
   * (voir docs/FUNCTIONAL.md §5.2).
   */
  test('refuse une distance invalide avec un message clair', async ({ page }) => {
    await page.goto('/');

    await openSessionForm(page);
    // On remplit tout sauf la distance (qu'on met à 0)
    await fillSessionForm(page, makeSession({ distance_km: 0 }));

    // Un message d'erreur en français est affiché
    await expect(page.getByText(/distance doit être supérieure à 0/i)).toBeVisible();
  });

  /**
   * Test 5 — Navigation entre les pages.
   * La Navbar permet d'aller de Journal → Graphiques → Planning → Journal.
   */
  test('navigue entre Journal, Graphiques et Planning', async ({ page }) => {
    await page.goto('/');

    // Journal → Graphiques
    await navigateTo(page, 'progression');
    await expect(page.getByRole('link', { name: /graphiques/i }).first()).toBeVisible();

    // Graphiques → Planning
    await navigateTo(page, 'planning');
    await expect(page.getByRole('link', { name: /planning/i }).first()).toBeVisible();

    // Planning → Journal
    await navigateTo(page, 'journal');
    await expect(page.getByRole('button', { name: /nouvelle séance/i })).toBeVisible();
  });
});
