# Feedback Bookmarklet

Outil de feedback visuel universel pour n'importe quelle app web.
Cliquer sur un élément → commenter → copier → coller dans votre agent IA.

## Build

```bash
npm run build
```

Génère `feedback.bookmarklet.txt`.

## Installation dans le navigateur

1. Ouvrir la barre des favoris (`Cmd+Shift+B`)
2. Clic droit → **Nouveau favori**
3. **Nom** : `Feedback`
4. **URL** : coller le contenu de `feedback.bookmarklet.txt`

## Utilisation

1. Aller sur la page à commenter
2. Cliquer sur le favori → toolbar apparaît en bas à droite
3. Cliquer **"🎯 Sélectionner"**
4. Survoler un élément → il se surligne
5. Cliquer → modale avec composant détecté + champ commentaire
6. Écrire le feedback → **"📋 Copier"**
7. Coller dans Claude Code ou votre outil IA

## Format de sortie

```
## Feedback

**Composant** : `app-kpi-card`
**Sélecteur**  : `app-dashboard > app-kpi-card.card`
**Contenu**    : "Loyers perçus"
**Page**       : /dashboard

**Commentaire** :
La couleur du badge ne correspond pas à la charte.
```

## Fichiers

- `feedback.js` — source lisible, modifiez ce fichier
- `build.js` — script de minification/build
- `feedback.bookmarklet.txt` — généré par le build (ignoré par git)
