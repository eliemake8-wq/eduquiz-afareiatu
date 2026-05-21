# Déploiement EduQuiz Afareiatu sur GitHub Pages

## Prérequis
- Compte GitHub gratuit : https://github.com
- Git installé sur ton Mac (ou utiliser GitHub Desktop)

---

## Étape 1 — Créer un dépôt GitHub

1. Va sur https://github.com/new
2. Nom du dépôt : `eduquiz-afareiatu` (ou `spc-afareiatu`)
3. Visibilité : **Public** (requis pour GitHub Pages gratuit)
4. Ne coche rien (pas de README, pas de .gitignore)
5. Clique **Create repository**

---

## Étape 2 — Pousser le dossier socrative-spc

Dans le Terminal (depuis le dossier SPMAN) :

```bash
cd socrative-spc
git init
git add .
git commit -m "EduQuiz Afareiatu — 29 QCM Physique-Chimie 4e/5e"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/eduquiz-afareiatu.git
git push -u origin main
```

> Remplace `TON-PSEUDO` par ton nom d'utilisateur GitHub.

---

## Étape 3 — Activer GitHub Pages

1. Va dans ton dépôt sur GitHub
2. Clique **Settings** (⚙️)
3. Dans le menu gauche : **Pages**
4. Source : **Deploy from a branch**
5. Branch : `main` / `/ (root)`
6. Clique **Save**

⏳ Attends 1-2 minutes.

---

## Étape 4 — Accéder au site

Ton site sera accessible à :
```
https://TON-PSEUDO.github.io/eduquiz-afareiatu/
```

Partage ce lien à tes élèves ! 📱 Fonctionne sur mobile.

---

## Mettre à jour le site (ajouter des QCM)

Quand tu ajoutes de nouveaux fichiers JSON dans `data/` :

```bash
cd socrative-spc
git add .
git commit -m "Ajout QCM chapitre X"
git push
```

GitHub Pages se met à jour automatiquement en 1-2 minutes.

---

## Lien à donner aux élèves

```
https://TON-PSEUDO.github.io/eduquiz-afareiatu/
```

Tu peux aussi créer un QR code avec ce lien sur :
https://www.qr-code-generator.com/
