import { test, expect } from '@playwright/test';
import { makeSession, openSessionForm, fillForm, daysAgo, toDisplayDate } from './helpers/session';

/**
 * Tests E2E — Sprint 2 : Journal des séances.
 *
 * Vérifie le parcours « Je note ma sortie du jour » (docs/FUNCTIONAL.md §3.1) :
 *  1. la page Journal se charge ;
 *  2. le bouton « + Nouvelle séance » est visible ;
 *  3. ce bouton ouvre le formulaire d'ajout ;
 *  4. le formulaire contient tous les champs du contrat
 *     (date, type, distance, durée, FC, ressenti, notes) ;
 *  5. soumettre un formulaire valide ajoute une carte séance ;
 *  6. la liste est triée par date décroissante (plus récente en premier) ;
 *  7. un état vide s'affiche quand il n'y a aucune séance.
 *
 * 📚 Convention : les tests utilisent les libellés français de l'UI
 * (cf. tests/README.md §5.1) via getByRole / getByLabel, et
 * `data-testid="session-card"` pour compter les cartes de séances.
 * Voir tests/helpers/session.ts pour le détail du contrat.
 */

test.describe('Journal des séances — Sprint 2', () => {
  /**
   * Test 1 — La page Journal se charge.
   * Vérifie que l'URL racine répond 200 et que le contenu du Journal
   * (titre de section) est affiché. Le Journal est l'onglet par défaut,
   * mais on clique sur le lien de navigation pour coller au parcours réel.
   */
  test('la page journal se charge', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status(), 'GET / doit répondre 200').toBe(200);

    // Aller au Journal via la navigation principale
    await page.getByRole('navigation').getByRole('link', { name: /journal/i }).click();

    // Le titre de la section « Journal des séances » est visible
    await expect(page.getByText(/journal des séances/i).first()).toBeVisible();
  });

  /**
   * Test 2 — Le bouton « + Nouvelle séance » est visible.
   * C'est le point d'entrée du parcours principal : sans lui, impossible
   * d'enregistrer une sortie (docs/FUNCTIONAL.md §3.1, étape 2).
   */
  test('le bouton « + Nouvelle séance » est visible', async ({ page }) => {
    await page.goto('/');

    const addButton = page.getByRole('button', { name: /nouvelle séance/i });
    await expect(addButton, 'bouton « + Nouvelle séance » présent').toBeVisible();
  });

  /**
   * Test 3 — Cliquer sur « + Nouvelle séance » affiche le formulaire.
   * Le formulaire doit apparaître avec son premier champ (Date)
   * et son bouton de soumission « Enregistrer » (tests/README.md §5.1).
   */
  test('cliquer sur « + Nouvelle séance » affiche le formulaire', async ({ page }) => {
    await page.goto('/');

    // Au départ, le formulaire est masqué
    await expect(page.getByLabel(/^date/i)).toBeHidden();

    // Après le clic, le formulaire s'ouvre
    await openSessionForm(page);
    await expect(page.getByLabel(/^date/i), 'champ Date visible').toBeVisible();
    await expect(
      page.getByRole('button', { name: /enregistrer/i }),
      'bouton « Enregistrer » visible',
    ).toBeVisible();
  });

  /**
   * Test 4 — Le formulaire contient tous les champs du contrat.
   * Les 7 champs obligatoires du formulaire de séance (tests/README.md §5.1) :
   * date, type de sortie, distance, durée, fréquence cardiaque, ressenti, notes.
   */
  test('le formulaire a tous les champs', async ({ page }) => {
    await page.goto('/');
    await openSessionForm(page);

    // Chaque champ est identifiable par son libellé français et visible
    const champs = [
      [/^date/i, 'Date'],
      [/type de sortie/i, 'Type de sortie'],
      [/distance/i, 'Distance (km)'],
      [/durée/i, 'Durée (min)'],
      [/fréquence cardiaque/i, 'Fréquence cardiaque moyenne'],
      [/ressenti/i, 'Ressenti'],
      [/notes/i, 'Notes'],
    ] as const;

    for (const [label, nom] of champs) {
      await expect(page.getByLabel(label), `champ « ${nom} » présent`).toBeVisible();
    }
  });

  /**
   * Test 5 — Soumettre un formulaire valide ajoute une carte séance.
   * Parcours principal « Je note ma sortie du jour » (docs/FUNCTIONAL.md §3.1) :
   * remplir le formulaire, cliquer sur « Enregistrer », la séance apparaît
   * immédiatement dans la liste. La distance s'affiche avec 1 décimale
   * et une virgule (15,5 km — docs/FUNCTIONAL.md §5.4).
   */
  test('soumettre un formulaire valide ajoute une carte séance', async ({ page }) => {
    await page.goto('/');
    await openSessionForm(page);

    // Remplir avec une séance valide (15,5 km, 82 min) puis enregistrer
    await fillForm(page, makeSession());
    await page.getByRole('button', { name: /enregistrer/i }).click();

    // La carte de la nouvelle séance est visible dans la liste
    const card = page.getByTestId('session-card');
    await expect(card, 'une carte séance est ajoutée').toHaveCount(1);
    await expect(card.first()).toContainText(/15,5\s*km/);
  });

  /**
   * Test 6 — La liste est triée par date décroissante.
   * La séance la plus récente doit apparaître en premier (« de la plus
   * récente à la plus ancienne » — docs/FUNCTIONAL.md §3.1).
   * On crée d'abord une séance d'il y a 7 jours, puis une d'hier :
   * la séance d'hier doit donc être AU-DESSUS de celle de la semaine dernière.
   */
  test('la liste est triée par date décroissante', async ({ page }) => {
    await page.goto('/');

    // Séance 1 : il y a 7 jours (la plus ancienne)
    const ancienne = makeSession({ date: daysAgo(7), distance_km: 5 });
    await openSessionForm(page);
    await fillForm(page, ancienne);
    await page.getByRole('button', { name: /enregistrer/i }).click();

    // Séance 2 : hier (la plus récente)
    const recente = makeSession({ date: daysAgo(1), distance_km: 20 });
    await openSessionForm(page);
    await fillForm(page, recente);
    await page.getByRole('button', { name: /enregistrer/i }).click();

    // Les deux cartes sont présentes, récente en premier
    const cards = page.getByTestId('session-card');
    await expect(cards, 'deux cartes séances').toHaveCount(2);
    await expect(cards.nth(0), 'la plus récente en premier').toContainText(
      toDisplayDate(recente.date),
    );
    await expect(cards.nth(1), 'la plus ancienne ensuite').toContainText(
      toDisplayDate(ancienne.date),
    );
  });

  /**
   * Test 7 — L'état vide s'affiche si aucune séance.
   * Sur un journal vierge (contexte neuf = aucune donnée), un message
   * d'état vide invite à ajouter la première séance — au lieu d'une
   * liste vide sans explication (docs/FUNCTIONAL.md §5.5 : messages clairs).
   */
  test("l'état vide s'affiche si aucune séance", async ({ page }) => {
    // Chaque test Playwright part d'un contexte vierge : aucune séance enregistrée
    await page.goto('/');

    // Un message d'état vide est affiché (ex. « Aucune séance enregistrée »)
    await expect(
      page.getByText(/aucune séance|première séance/i),
      "message d'état vide visible",
    ).toBeVisible();

    // Aucune carte séance n'est affichée
    await expect(page.getByTestId('session-card')).toHaveCount(0);
  });
});
