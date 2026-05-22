# EduQuiz — ROADMAP
> Mis à jour : 2026-05-21

## ÉTAT ACTUEL
- Site live : eliemake8-wq.github.io/eduquiz-afareiatu/
- Fichiers : SPMAN/eduquiz-afareiatu/ (cloné ✅)
- Structure : index.html + admin.html + player.html + exo.html
- Data : 29 QCM JSON (8 questions/ch) · catalogue.json
- JS : app.js (296L) · admin.js (408L) · localStorage only

## 🔴 PRIORITÉ 1 — Faire maintenant
- [ ] **Mélange questions** : shuffle dans app.js (anti-triche)
- [ ] **Flashcards Ch01 4e** : page flashcards.html + data JSON (modèle)

## 🟠 PRIORITÉ 2 — Sessions suivantes
- [ ] **+Questions** : passer de 8 → 20+ questions par chapitre (29 fichiers JSON)
- [ ] **Flashcards** : déployer sur les 29 chapitres (copier le modèle)
- [ ] **Cours** : créer cours.html pour chaque chapitre (29 × contenu)

## 🟡 PRIORITÉ 3 — Session dédiée
- [ ] **Session prof live** : intégrer Firebase (remplacer localStorage)
  - Voir élèves connectés en temps réel
  - Voir leurs scores en live
  - Lancer un QCM pour toute la classe

## COMMANDES GIT (après chaque session)
```
cd ~/Desktop/School/SPMAN/eduquiz-afareiatu
git add .
git commit -m "feat: description"
git push
```
Site mis à jour en 1-3 min après push.
