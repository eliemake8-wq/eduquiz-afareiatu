# SPC Afareiatu — QCM Interactifs
Alternatif gratuit à Socrative · Collège de Afareiatu, Moorea, Polynésie française

---

## Structure des fichiers

```
socrative-spc/
├── index.html          ← Page d'accueil (liste des QCM)
├── player.html         ← Lecteur QCM interactif
├── admin.html          ← Panneau créateur/admin
├── css/
│   └── style.css       ← Design mobile-first
├── js/
│   ├── app.js          ← Logique lecteur QCM
│   └── admin.js        ← Logique admin CRUD
├── data/
│   └── qcm-exemple.json ← QCM exemple (masse volumique 4e)
└── README.md
```

---

## Déploiement Netlify (gratuit, URL permanente)

### Étape 1 — Installe Node.js (si pas encore fait)
Télécharge sur : **https://nodejs.org** → version LTS → installe

Vérifie : `node --version` (doit afficher v18 ou plus)

### Étape 2 — Installe Netlify CLI
```bash
npm install -g netlify-cli
```

### Étape 3 — Va dans le dossier du site
```bash
cd chemin/vers/socrative-spc
```
Exemple Windows : `cd C:\Users\TonNom\Desktop\socrative-spc`
Exemple Mac : `cd ~/Desktop/socrative-spc`

### Étape 4 — Déploie en production
```bash
netlify deploy --prod --dir=.
```

La première fois : le navigateur s'ouvre pour connecter ton compte Netlify (gratuit).
Résultat : une URL du type `https://mon-spc-afareiatu.netlify.app`

### Étape 5 — Personnalise l'URL (optionnel)
Dans le dashboard Netlify → Settings → Domain → Custom subdomain

---

## Ajouter un nouveau QCM

### 1. Crée le fichier JSON
- Ouvre `admin.html` dans le navigateur
- Crée les questions → Exporte en JSON
- Copie le fichier dans `data/`

### 2. Ajoute-le au catalogue
Dans `index.html`, trouve le tableau `CATALOGUE` et ajoute :
```javascript
{
  fichier: 'nom-du-fichier.json',
  titre: 'Titre du QCM',
  classe: '4e',
  chapitre: 'Nom du chapitre',
  nbQuestions: 5,
  difficulte: '⭐⭐'
}
```

### 3. Redéploie
```bash
netlify deploy --prod --dir=.
```

---

## Format JSON des QCM

```json
{
  "id": "qcm-4e-chapitre-01",
  "titre": "Titre du QCM",
  "classe": "4e",
  "chapitre": "Nom du chapitre",
  "auteur": "Collège Afareiatu — SPC",
  "date": "2026-05-20",
  "version": 1,
  "questions": [
    {
      "id": 1,
      "enonce": "Texte de la question ?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "reponse": 1,
      "feedback_correct": "✅ Explication quand correct (3-5 lignes).",
      "feedback_incorrect": "❌ Explication quand incorrect (3-5 lignes).",
      "code_socle": "D4-1",
      "difficulte": 2
    }
  ]
}
```

**Notes :**
- `reponse` : index de l'option correcte (0 = A, 1 = B, 2 = C, 3 = D)
- `code_socle` : D1.3-x (lire/écrire), D4-x (mathématiques/sciences)
- `difficulte` : 1 à 4 étoiles
- **JAMAIS Vrai/Faux** → toujours 4 options minimum

---

## Règles pédagogiques REP+

| Règle | Obligation |
|-------|-----------|
| Options par question | ≥ 4 |
| Longueur énoncé | ≤ 15 mots |
| Vrai/Faux | INTERDIT |
| Feedback | 3-5 lignes minimum |
| Données nominatives | INTERDITES (RGPD) |
| Contexte polynésien | Encouragé (lagon, mer, coco...) |

---

## Récupérer les résultats élèves

Les résultats sont stockés anonymement dans le `localStorage` du navigateur.

1. Ouvre `admin.html`
2. Onglet **Résultats**
3. Clique **Exporter CSV**
4. Ouvre le CSV dans LibreOffice Calc ou Excel

---

## Mise à jour rapide (workflow de production)

```bash
# Ajouter un QCM et redéployer en 3 commandes
cp nouveau-qcm.json socrative-spc/data/
# Éditer index.html pour ajouter au CATALOGUE
netlify deploy --prod --dir=.
```

---

## Support technique

- Netlify docs : https://docs.netlify.com
- Dépôt du projet : voir dossier SPMAN
- Contact : Collège de Afareiatu, département SPC
