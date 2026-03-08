# 💬 Feedback Tool — Manuel complet

Outil de feedback visuel universel pour n'importe quelle application web.
Annotez des composants, ajoutez des commentaires, exportez en Markdown vers Claude Code ou un ticket.

---

## Sommaire

1. [Prérequis](#prérequis)
2. [Installation](#installation)
   - [Serveur local](#1-serveur-local)
   - [Extension Chrome](#2-extension-chrome-recommandé)
   - [Bookmarklet](#3-bookmarklet-alternatif)
   - [UserScript (Tampermonkey)](#4-userscript-tampermonkey)
3. [Démarrage rapide](#démarrage-rapide)
4. [Manuel d'utilisation](#manuel-dutilisation)
   - [La toolbar](#la-toolbar)
   - [Mode Composant](#mode-composant-)
   - [Mode Libre](#mode-libre-)
   - [Le formulaire de feedback](#le-formulaire-de-feedback)
   - [Le draft (réduire)](#le-draft-réduire)
   - [L'historique](#lhistorique-)
   - [Marqueurs visuels](#marqueurs-visuels)
   - [Raccourcis clavier](#raccourcis-clavier)
5. [Format d'export Markdown](#format-dexport-markdown)
6. [Structure des fichiers](#structure-des-fichiers)
7. [Build](#build)

---

## Prérequis

- Node.js ≥ 18
- Google Chrome (ou navigateur Chromium)
- L'extension Chrome **ou** les favoris activés dans la barre du navigateur

---

## Installation

### 1. Serveur local

Le serveur sert `feedback.js` à chaud — chaque rechargement de l'outil récupère la dernière version sans rebuild.

```bash
# Installer les dépendances
npm install

# Démarrer le serveur (port 8877)
npm run serve
```

Le serveur tourne sur `http://localhost:8877/feedback.js`.
Laissez-le actif pendant vos sessions de feedback.

---

### 2. Extension Chrome *(recommandé)*

L'extension injecte l'outil via un raccourci clavier sans toucher à la barre des favoris.

**Installation :**

1. Ouvrir Chrome → `chrome://extensions/`
2. Activer le **Mode développeur** (toggle en haut à droite)
3. Cliquer **"Charger l'extension non empaquetée"**
4. Sélectionner le dossier `chrome-extension/`
5. L'extension apparaît dans la liste

**Raccourci clavier :**

Le raccourci par défaut est `⌥ F` (Option + F sur Mac / Alt + F sur Windows/Linux).

> Sur Mac, la touche **Option** est la touche `⌥` (à gauche de la barre d'espace, à côté de `Cmd`).

Pour personnaliser le raccourci :
1. Aller sur `chrome://extensions/shortcuts`
2. Trouver **"Feedback Tool"**
3. Modifier le raccourci selon vos préférences

**Fonctionnement :**

- Premier appui → injecte et affiche la toolbar
- Appuis suivants → affiche / masque la toolbar (l'état est préservé)
- Le serveur local doit être actif (`npm run serve`)

---

### 3. Bookmarklet *(alternatif)*

Si vous ne souhaitez pas installer l'extension, utilisez le bookmarklet.

**Build :**

```bash
npm run build
```

Génère `feedback.bookmarklet.txt`.

**Installation dans Chrome :**

1. Afficher la barre des favoris : `Cmd+Shift+B` (Mac) / `Ctrl+Shift+B` (Windows)
2. Clic droit dans la barre → **Ajouter une page**
3. **Nom** : `💬 Feedback`
4. **URL** : coller le contenu de `feedback.bookmarklet.txt`
5. Valider

**Utilisation :** cliquer le favori sur n'importe quelle page.

> Le bookmarklet charge le script depuis `http://localhost:8877` — le serveur doit être actif.

---

### 4. UserScript (Tampermonkey)

Pour un chargement automatique sur vos pages de développement local.

**Installation :**

1. Installer l'extension [Tampermonkey](https://www.tampermonkey.net/) dans Chrome
2. Ouvrir le tableau de bord Tampermonkey → **Créer un nouveau script**
3. Remplacer le contenu par celui du fichier `feedback.user.js`
4. Sauvegarder (`Ctrl+S`)

**Comportement :** l'outil se charge automatiquement sur `http://localhost:*` et `http://127.0.0.1:*` au chargement de chaque page.

---

## Démarrage rapide

```
1. npm run serve          ← démarrer le serveur
2. Ouvrir votre app web
3. Appuyer sur ⌥F         ← activer la toolbar
4. Cliquer 🎯 Composant   ← entrer en mode sélection
5. Cliquer un élément     ← le cibler
6. Cliquer ✏️ Feedback    ← ouvrir le formulaire
7. Remplir et sauvegarder ← le feedback apparaît dans l'historique
8. Copier → coller dans Claude Code ou un ticket
```

---

## Manuel d'utilisation

### La toolbar

La toolbar apparaît en **bas à droite** de la page.

| Bouton | Rôle |
|--------|------|
| 🎯 **Composant** | Mode sélection de composants |
| ✏️ **Libre** | Mode annotation libre (position X/Y) |
| 📋 **Historique** | Ouvre/ferme le panneau d'annotations |
| **?** | Affiche l'aide intégrée |
| **✕** | Ferme et retire complètement l'outil |

---

### Mode Composant 🎯

Permet de cibler précisément un ou plusieurs éléments de la page.

1. Cliquer **🎯 Composant** — la toolbar passe en rouge (✋ Stop)
2. **Survoler** la page — les éléments se surlignent en violet
3. **Cliquer** un élément → il est ajouté au panier (contour bleu)
4. Recliquer un élément déjà sélectionné → il est retiré du panier
5. **Continuer à cliquer** pour sélectionner plusieurs composants
6. Le panier apparaît **en bas au centre** avec le nombre de composants sélectionnés
7. Cliquer **✏️ Feedback** dans le panier → ouvre le formulaire
8. Cliquer **✕** dans le panier → vide la sélection

> Le composant Angular est automatiquement détecté (ex : `app-kpi-card`).
> Si aucun composant Angular n'est trouvé, le tag HTML est utilisé.

---

### Mode Libre ✏️

Permet d'annoter un endroit précis de la page sans cibler un composant.

1. Cliquer **✏️ Libre** — curseur en croix sur toute la page
2. **Cliquer n'importe où** → ouvre le formulaire avec les coordonnées X/Y
3. Les coordonnées sont sauvegardées avec l'annotation

---

### Le formulaire de feedback

| Champ | Options |
|-------|---------|
| **Type** | 🐛 Bug · 💡 Suggestion · 🎨 Design · ❓ Question |
| **Priorité** | 🔴 Haute · 🟡 Moyenne · 🟢 Basse |
| **Commentaire** | Texte libre (obligatoire pour sauvegarder) |

**Gestion des composants dans le formulaire :**

- Chaque composant ciblé apparaît avec son nom et son sélecteur CSS
- Cliquer **✕** à côté d'un composant pour le retirer de l'annotation
- Cliquer **➕ Ajouter des composants** pour retourner en mode sélection et enrichir la liste sans perdre le formulaire

**Actions :**

| Bouton | Comportement |
|--------|--------------|
| **💾 Sauvegarder** | Enregistre l'annotation (localStorage) |
| **⬇ Réduire** | Met en draft — puce orange en haut de page |
| **Annuler** | Ferme le formulaire sans sauvegarder |
| Clic hors modal | Équivalent de ⬇ Réduire |

---

### Le draft (réduire)

Quand un formulaire est réduit, une **puce orange** apparaît en haut au centre.

- **Cliquer la puce** → rouvre le formulaire avec toutes les données saisies
- **Cliquer ✕** sur la puce → annule définitivement le draft
- Le draft permet de naviguer sur la page (pour inspecter d'autres zones) sans perdre le formulaire en cours

---

### L'historique 📋

Le panneau s'ouvre en **bas à droite** (au-dessus de la toolbar).
Il se ferme en cliquant hors de son périmètre ou en recliquant 📋.

**Vue liste :**

Chaque annotation affiche :
- Pastille colorée avec son numéro
- Nom du composant ou de la page
- Badge de priorité
- Extrait du commentaire

**Actions par annotation :**

| Icône | Action |
|-------|--------|
| ✏️ | Modifier l'annotation (formulaire pré-rempli) |
| 📋 | Copier en Markdown |
| ✕ | Supprimer (confirmation inline) |

**Sélection multiple :**

1. Cocher les cases à gauche de chaque annotation
2. Utiliser la barre de sélection pour :
   - **Tout sélectionner / désélectionner**
   - **📋 Copier** — copie toutes les sélectionnées en Markdown
   - **🗑️ Supprimer** — supprime avec confirmation inline

**Actions globales :**

| Bouton | Action |
|--------|--------|
| **Copier tout** | Copie toutes les annotations en Markdown |
| **Effacer** | Supprime toutes les annotations (confirmation inline) |

> Après toute suppression, les numéros sont réassignés automatiquement (1, 2, 3…).

---

### Marqueurs visuels

Des **pastilles numérotées** apparaissent sur la page à la position de chaque annotation.

| Couleur | Type |
|---------|------|
| 🔴 Rouge | Bug |
| 🟣 Violet | Suggestion |
| 🟠 Orange | Design |
| 🔵 Bleu | Question |

Les pastilles disparaissent quand l'outil est fermé (✕) et réapparaissent au prochain chargement si les annotations sont en localStorage.

---

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `⌥ F` | Afficher / masquer la toolbar (extension Chrome) |
| `Échap` | Réduire le formulaire en draft |
| `⌘ Entrée` / `Ctrl Entrée` | Sauvegarder depuis le formulaire |

---

## Format d'export Markdown

Chaque annotation est exportée en Markdown compatible Claude Code / GitHub / Notion.

**Annotation composant :**

```markdown
## 🐛 Feedback #1 — Bug (priorité haute)

**Composant** : `app-kpi-card`
**Sélecteur**  : `app-dashboard > app-kpi-card.card--loyers`
**Contenu**    : "Loyers perçus"
**Page**       : /dashboard

**Commentaire** :
La couleur du badge ne correspond pas à la charte graphique.
```

**Annotation multi-composants :**

```markdown
## 🎨 Feedback #2 — Design (priorité moyenne)

**Composant 1** : `app-header` — `app-root > app-header`
**Composant 2** : `app-sidebar` — `app-root > app-sidebar`
**Page**       : /dashboard

**Commentaire** :
L'espacement entre le header et la sidebar est incohérent.
```

**Annotation libre :**

```markdown
## 💡 Feedback #3 — Suggestion (priorité basse)

**Page**       : /contrats
**Position**   : (342, 218)

**Commentaire** :
Ajouter un bouton de tri rapide dans cette zone.
```

---

## Structure des fichiers

```
feedback-bookmarklet/
├── feedback.js              ← Source principale (modifiez ce fichier)
├── server.js                ← Serveur local Node.js (port 8877)
├── build.js                 ← Script de minification (terser)
├── feedback.user.js         ← UserScript pour Tampermonkey
├── feedback.bookmarklet.txt ← Généré par `npm run build`
├── package.json
└── chrome-extension/
    ├── manifest.json        ← Config extension (Manifest V3)
    └── background.js        ← Service worker (injection du script)
```

---

## Build

```bash
# Minifier feedback.js en bookmarklet
npm run build

# Démarrer le serveur de développement
npm run serve
```

> `feedback.bookmarklet.txt` est généré automatiquement et ignoré par git.
> Ne modifiez jamais ce fichier directement — modifiez `feedback.js` puis rebuildez.
