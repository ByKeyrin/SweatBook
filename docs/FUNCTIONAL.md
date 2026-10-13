# 🎯 SweatBook — Description métier (Fonctionnel)

> Ce document explique **à quoi sert** SweatBook, **pour qui**, et **quelles sont les règles
> de gestion**. Aucun prérequis technique ici : c'est le document « produit » du projet.

---

## Table des matières

1. [Vision du produit](#1-vision-du-produit)
2. [Utilisateur cible](#2-utilisateur-cible)
3. [Parcours utilisateur](#3-parcours-utilisateur)
4. [Fonctionnalités détaillées](#4-fonctionnalités-détaillées)
5. [Règles métier](#5-règles-métier)
6. [Scénarios de test](#6-scénarios-de-test)

---

## 1. Vision du produit

**SweatBook** = le carnet d'entraînement du coureur, en mieux. 📓🏃

Le constat : un coureur amateur veut suivre ses progrès, mais les carnets papier sont
illisibles à long terme et les apps du marché sont lourdes, publicitaires ou payantes.
SweatBook propose **l'essentiel** :

- **Enregistrer** ses sorties rapidement (moins de 30 secondes).
- **Voir** ses progrès en un coup d'œil (graphiques).
- **Planifier** sa semaine pour rester régulier.

Pour le moment, SweatBook est **dédié au running**. Le powerlifting et d'autres sports
arriveront plus tard (la base de données est déjà prévue pour l'extension).

---

## 2. Utilisateur cible

### Persona principal : Kevin, le coureur régulier 🏃‍♂️

| Caractéristique | Détail |
|---|---|
| **Profil** | Coureur amateur, 2 à 4 sorties par semaine |
| **Objectif** | Progresser (améliorer son allure, préparer un semi-marathon…) |
| **Niveau technique** | Débutant en dev web — l'app doit être **simple et sans jargon** |
| **Besoins** | Noter ses sorties sans friction, comprendre s'il progresse, s'organiser |
| **Freins actuels** | Applications trop complexes, données dispersées, pas de vue d'ensemble |

### Cas d'usage secondaires

- **La débutante** (Léa) : commence le running, veut simplement tracer ses sorties et rester motivée.
- **Le préparateur** (Marc) : vise un marathon dans 4 mois, veut planifier chaque semaine.

---

## 3. Parcours utilisateur

### 3.1 Parcours principal : « Je note ma sortie du jour »

```
1. Je reviens de ma sortie et j'ouvre SweatBook (page Journal)
2. Je clique sur « + Nouvelle séance »
3. Je remplis : date (aujourd'hui par défaut), type (ex. sortie longue),
   distance (15,5 km), durée (1 h 22), ressenti (4/5), commentaire facultatif
4. Je clique sur « Enregistrer »
5. ✅ Ma séance apparaît immédiatement dans le journal
   → Les graphiques et statistiques se mettent à jour automatiquement
```

### 3.2 Parcours « Je prépare ma semaine »

```
1. J'ouvre la page Planning
2. Je choisis la semaine (lundi → dimanche)
3. Pour chaque jour, je clique sur la case et je choisis :
   un type de séance (sortie facile, longue, fractionné…), une distance prévue, ou « Repos »
4. Pendant la semaine, je vois d'un coup d'œil :
   🟢 ce qui est fait · 🟡 ce qui reste à faire · ⚪ jour de repos
```

### 3.3 Parcours « Je vérifie mes progrès »

```
1. J'ouvre la page Graphiques
2. Je consulte :
   - l'évolution de ma distance hebdomadaire (courbe)
   - mon allure moyenne dans le temps
   - le nombre de séances par semaine
3. Je constate mes progrès 🎉 et j'ajuste mon planning en conséquence
```

---

## 4. Fonctionnalités détaillées

### 4.1 📓 Journal des séances

| Élément | Obligatoire ? | Description |
|---|---|---|
| Date | ✅ | Date de la sortie (par défaut : aujourd'hui) |
| Type de sortie | ✅ | `Sortie facile` · `Sortie longue` · `Fractionné` · `Tempo` · `Récupération` |
| Distance (km) | ✅ | Nombre décimal, > 0 |
| Durée (min) | ✅ | En minutes (décimales acceptées : 82,5) |
| Fréquence cardiaque moyenne | ❌ | Battements par minute (bpm) |
| Ressenti | ❌ | Note de 1 (très dur) à 5 (très facile) |
| Notes | ❌ | Commentaire libre (météo, parcours, douleurs…) |

**Actions possibles** : ajouter, modifier, supprimer une séance ; filtrer par type ou par période.

### 4.2 📈 Graphiques de progression

Trois graphiques principaux (période : 4 dernières semaines / 3 mois / tout) :

1. **Volume hebdomadaire** — barres ou courbe : kilomètres par semaine.
2. **Allure moyenne** — courbe : minutes par kilomètre au fil du temps (plus c'est bas, mieux c'est !).
3. **Régularité** — nombre de séances réalisées par semaine.

Chaque graphique affiche aussi une **moyenne glissante** pour lisser les fluctuations.

### 4.3 📅 Planning hebdomadaire

- Grille **lundi → dimanche**.
- Chaque jour peut recevoir : un **type de séance prévue**, une **distance prévue**, ou **« Repos »**.
- Statut visuel :
  - 🟢 **Fait** — une séance correspondante a été enregistrée ;
  - 🟡 **À faire** — prévu mais pas encore réalisé ;
  - ⚪ **Repos** — jour de récupération.
- Navigation entre les semaines (précédente / suivante / semaine courante).

### 4.4 🏃 Suivi running (statistiques)

- **Total** : kilomètres cumulés, temps total, nombre de sorties.
- **Allure moyenne globale** (min/km) et par type de sortie.
- **VMA estimée** (voir règles ci-dessous) pour caler les allures d'entraînement.
- **Meilleures performances** : plus longue sortie, meilleure allure sur sortie longue.

---

## 5. Règles métier

### 5.1 Calculs

#### Allure (minutes par kilomètre)

```
allure (min/km) = durée (minutes) ÷ distance (km)
```

*Exemple* : 15,5 km en 82 min → 82 ÷ 15,5 ≈ **5,29 min/km** (affiché « 5:17 /km » — voir format 5.2).

#### Format d'affichage de l'allure

`allure décimale` → `M:SS`. La partie décimale est convertie en secondes (× 60), arrondie.

*Exemple* : 5,29 min/km → 5 min + 0,29 × 60 ≈ 17 s → **5:17 /km**.

#### Vitesse moyenne (km/h)

```
vitesse (km/h) = distance (km) ÷ durée (heures) = distance_km ÷ (duration_min ÷ 60)
```

#### Volume hebdomadaire

```
volume_semaine = Σ distance_km des séances dont la date tombe dans la semaine (lundi → dimanche)
```

#### Allure moyenne sur une période

⚠️ On ne fait **pas** la moyenne des allures : on calcule une **allure globale** (pondérée par la distance) :

```
allure_globale = durée_totale (min) ÷ distance_totale (km)
```

#### VMA estimée (à partir du fractionné)

```
VMA_estimée ≈ vitesse_max_sur_fractionné × 1,05
```

*Exemple* : meilleure vitesse sur intervalle = 15,2 km/h → VMA estimée ≈ **16,0 km/h**.
_(Estimation indicative, à afficher avec un avertissement « valeur approximative ».)_

### 5.2 Validations (formulaires)

| Champ | Règle | Message d'erreur |
|---|---|---|
| Date | Obligatoire, ne peut pas être dans le futur | « La date ne peut pas être dans le futur » |
| Type | Obligatoire, dans la liste autorisée | « Type de séance invalide » |
| Distance | Obligatoire, nombre > 0, max **500 km** | « La distance doit être supérieure à 0 » |
| Durée | Obligatoire, nombre > 0, max **24 h** (1440 min) | « La durée doit être supérieure à 0 » |
| FC moyenne | Facultative, entier entre **30 et 230** bpm | « Fréquence cardiaque invalide » |
| Ressenti | Facultatif, entier entre **1 et 5** | « Le ressenti doit être entre 1 et 5 » |
| Notes | Facultatif, **500 caractères max** | « Commentaire trop long (500 caractères max) » |

### 5.3 Règles du planning

1. Une entrée de planning est rattachée à une **semaine** identifiée par sa **date de lundi**.
2. Une case « Repos » **exclut** la planification d'une séance le même jour (une seule entrée par jour).
3. Une entrée est marquée **🟢 Fait** lorsqu'une séance du journal est liée à cette entrée
   (`session_id` renseigné) — le rapprochement peut être manuel ou automatique
   (même jour + même type).
4. Supprimer une séance du journal **dé-lie** l'entrée de planning correspondante
   (elle repasse 🟡 « À faire ») mais **ne supprime pas** l'entrée de planning.
5. On peut planifier une semaine **future ou passée** (utile pour remplir son historique).

### 5.4 Règles d'affichage

- Les distances s'affichent avec **1 décimale** (ex. : `15,5 km`).
- Les durées s'affichent en **`H:MM`** (ex. : `1:22`).
- Les allures s'affichent en **`M:SS /km`** (ex. : `5:17 /km`).
- Semaine = **du lundi au dimanche** (convention européenne).
- Dates au format **JJ/MM/AAAA** dans l'interface, **AAAA-MM-JJ** en base.

### 5.5 Gestion des erreurs (côté utilisateur)

- Toute action impossible affiche un **message clair en français**, sans jargon technique.
- Une suppression demande **toujours une confirmation** (« Supprimer cette séance ? Cette action est irréversible. »).
- Si l'API est injoignable : « Impossible de contacter le serveur. Vérifiez qu'il est lancé, puis réessayez. »

---

## 6. Scénarios de test

> 🧪 **Section anticipée** : elle décrit les scénarios de test **prévus** pour SweatBook
> (voir la [stratégie technique](TECHNICAL.md#8-stratégie-de-tests) : Playwright pour les
> parcours E2E, Vitest pour l'API). Les tests ne sont pas encore créés — cette section
> sert de cahier de recette avant leur implémentation.

### 6.1 Principaux parcours à tester (E2E)

| # | Parcours | Étapes clés | Résultat attendu |
|---|---|---|---|
| 1 | **« Je note ma sortie du jour »** | Ouvrir le Journal → « + Nouvelle séance » → remplir date, type, distance, durée → Enregistrer | La séance apparaît dans le journal, les graphiques/stats se mettent à jour |
| 2 | **« Je prépare ma semaine »** | Ouvrir le Planning → choisir la semaine → planifier un type de séance ou « Repos » pour un jour | La case affiche le statut 🟡 « À faire » / ⚪ « Repos » |
| 3 | **« Je vérifie mes progrès »** | Ouvrir les Graphiques → consulter volume, allure, régularité | Les courbes reflètent les séances enregistrées |
| 4 | **Modifier une séance** | Éditer une séance existante (ex. corriger la distance) | Les calculs (allure, volume) sont recalculés partout |
| 5 | **Supprimer une séance** | Supprimer une séance → confirmer la dialog | La séance disparaît ; l'entrée de planning liée repasse 🟡 « À faire » (règle 5.3.4) |
| 6 | **Lier une séance au planning** | Enregistrer une séance correspondant à une entrée prévue (même jour + même type) | L'entrée passe 🟢 « Fait » |

### 6.2 Validations métier à couvrir

**Formulaires (cf. règle 5.2)** — chaque règle doit être vérifiée côté UI *et* API :

- Date obligatoire, **pas de date future** ;
- Type dans la liste autorisée (`easy`, `long`, `interval`, `tempo`, `recovery`) ;
- Distance > 0, **max 500 km** ;
- Durée > 0, **max 1440 min (24 h)** ;
- FC moyenne facultative : entier **30–230 bpm** ;
- Ressenti facultatif : entier **1–5** ;
- Notes facultatives : **500 caractères max**.

**Calculs (cf. règle 5.1)** :

- Allure = durée ÷ distance, affichée en `M:SS /km` ;
- Allure globale **pondérée par la distance** (jamais la moyenne des allures) ;
- Volume hebdomadaire = somme des distances de la semaine **lundi → dimanche** ;
- VMA estimée ≈ vitesse max sur fractionné × 1,05 (avec mention « valeur approximative »).

**Planning (cf. règle 5.3)** :

- Une seule entrée par jour (« Repos » exclut une séance) ;
- Semaine identifiée par sa date de lundi (`week_start`) ;
- Suppression d'une séance → dé-liaison mais conservation de l'entrée de planning ;
- Planification possible sur une semaine future **ou** passée.

### 6.3 Cas d'erreur à anticiper

| Cas d'erreur | Comportement attendu |
|---|---|
| Formulaire soumis avec des champs obligatoires manquants | Message d'erreur clair en français sous le champ concerné, aucune requête envoyée |
| Données invalides envoyées à l'API (distance ≤ 0, date future…) | Réponse `400` avec `{ "error": "…" }`, affichage du message côté UI |
| Séance/entrée de planning inexistante (id inconnu) | Réponse `404`, message « introuvable » sans crash |
| Suppression sans confirmation | La suppression n'a pas lieu (dialog de confirmation obligatoire) |
| API injoignable / serveur arrêté | « Impossible de contacter le serveur. Vérifiez qu'il est lancé, puis réessayez. » |
| Double soumission rapide d'un formulaire | Une seule séance créée (pas de doublon) |
| Séance supprimée alors qu'elle était liée au planning | L'entrée reste, repasse 🟡 « À faire » (jamais de suppression en cascade) |
| Note > 500 caractères | Message « Commentaire trop long (500 caractères max) » |

---

*Ce document évolue avec le produit. Dernière mise à jour : octobre 2026.*
