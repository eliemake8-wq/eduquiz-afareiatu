/**
 * app.js — Lecteur QCM interactif
 * SPC Afareiatu — Collège de Afareiatu
 * Stockage anonyme via localStorage
 */

// ==============================
// ÉTAT DE L'APPLICATION
// ==============================
const App = {
  qcm: null,
  questions: [],
  indexCourant: 0,
  score: 0,
  sessionId: null,
  reponsesDonnees: [],

  init() {
    this.sessionId = this.getOuCreerSession();
    const params = new URLSearchParams(window.location.search);
    const fichier = params.get('qcm');

    if (!fichier) {
      this.afficherErreur('Aucun QCM sélectionné. <a href="index.html">Retour à l\'accueil</a>');
      return;
    }

    this.chargerQCM(fichier);
  },

  getOuCreerSession() {
    let sid = localStorage.getItem('spc_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('spc_session_id', sid);
    }
    return sid;
  },

  // ==============================
  // MÉLANGE (Fisher-Yates)
  // ==============================
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  async chargerQCM(fichier) {
    try {
      const resp = await fetch('data/' + fichier);
      if (!resp.ok) throw new Error('Fichier introuvable');
      this.qcm = await resp.json();
      this.questions = this.shuffleArray(this.qcm.questions);
      this.indexCourant = 0;
      this.score = 0;
      this.reponsesDonnees = [];
      this.afficherInfoQCM();
      this.afficherQuestion();
    } catch (e) {
      this.afficherErreur('Impossible de charger le QCM : ' + e.message);
    }
  },

  afficherInfoQCM() {
    const el = document.getElementById('qcm-titre');
    if (el) el.textContent = this.qcm.titre;
    const el2 = document.getElementById('qcm-classe');
    if (el2) el2.textContent = this.qcm.classe + ' — ' + this.qcm.chapitre;
  },

  // ==============================
  // AFFICHAGE QUESTION
  // ==============================
  afficherQuestion() {
    if (this.indexCourant >= this.questions.length) {
      this.afficherScore();
      return;
    }

    const q = this.questions[this.indexCourant];
    const total = this.questions.length;
    const numero = this.indexCourant + 1;

    // Barre de progression
    const pct = ((numero - 1) / total) * 100;
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('question-numero').textContent =
      'Question ' + numero + ' sur ' + total;

    // Énoncé
    document.getElementById('question-enonce').textContent = q.enonce;

    // Options
    const liste = document.getElementById('options-liste');
    liste.innerHTML = '';
    const lettres = ['A', 'B', 'C', 'D'];

    q.options.forEach((opt, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="lettre">${lettres[i]}</span>
        <span class="texte">${opt}</span>
      `;
      btn.addEventListener('click', () => this.traiterReponse(i, q));
      li.appendChild(btn);
      liste.appendChild(li);
    });

    // Réinitialiser feedback
    const feedback = document.getElementById('feedback-zone');
    feedback.className = 'feedback-zone';
    feedback.innerHTML = '';

    // Cacher bouton suivant
    document.getElementById('btn-suivant').style.display = 'none';

    // Zone question visible
    document.getElementById('zone-question').style.display = 'block';
    document.getElementById('zone-score').style.display = 'none';
  },

  // ==============================
  // TRAITEMENT RÉPONSE
  // ==============================
  traiterReponse(indexChoisi, question) {
    // Désactiver tous les boutons
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    const correct = indexChoisi === question.reponse;

    // Colorier les options
    btns.forEach((btn, i) => {
      if (i === question.reponse) {
        btn.classList.add('correcte');
      } else if (i === indexChoisi && !correct) {
        btn.classList.add('incorrecte');
      }
    });

    // Afficher feedback
    const feedback = document.getElementById('feedback-zone');
    feedback.className = 'feedback-zone visible ' + (correct ? 'correct' : 'incorrect');
    feedback.innerHTML = `
      <div class="feedback-icone">${correct ? '✅' : '❌'}</div>
      <div>${correct ? question.feedback_correct : question.feedback_incorrect}</div>
    `;

    // Mettre à jour le score
    if (correct) this.score++;

    // Enregistrer la réponse
    this.reponsesDonnees.push({
      questionId: question.id,
      choix: indexChoisi,
      correct: correct
    });

    // Sauvegarder dans localStorage
    this.sauvegarderProgression();

    // Afficher bouton suivant
    document.getElementById('btn-suivant').style.display = 'flex';
  },

  // ==============================
  // QUESTION SUIVANTE
  // ==============================
  questionSuivante() {
    this.indexCourant++;
    this.afficherQuestion();
  },

  // ==============================
  // SCORE FINAL
  // ==============================
  afficherScore() {
    document.getElementById('zone-question').style.display = 'none';
    document.getElementById('zone-score').style.display = 'block';
    document.getElementById('progress-bar').style.width = '100%';

    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);

    document.getElementById('score-chiffre').textContent = this.score;
    document.getElementById('score-total-txt').textContent = '/ ' + total;
    document.getElementById('score-pct').textContent = pct + '%';

    // Message selon score
    let msg = '';
    if (pct >= 80) msg = '🎉 Excellent travail ! Tu maîtrises ce chapitre.';
    else if (pct >= 60) msg = '👍 Bon travail ! Relis les questions ratées.';
    else if (pct >= 40) msg = '📚 Continue ! Revois le cours sur ce chapitre.';
    else msg = '💪 Ne lâche pas ! Relis le cours et réessaie.';

    document.getElementById('score-message').textContent = msg;

    // Détail des réponses
    this.afficherDetailScore();

    // Sauvegarder résultat final
    this.sauvegarderResultatFinal(pct);
  },

  afficherDetailScore() {
    const conteneur = document.getElementById('detail-reponses');
    conteneur.innerHTML = '';

    this.reponsesDonnees.forEach((rep, i) => {
      const q = this.questions[i];
      const div = document.createElement('div');
      div.className = 'question-admin-item';
      div.innerHTML = `
        <div class="question-admin-texte">
          <strong>Q${i + 1}.</strong> ${q.enonce.substring(0, 60)}...
        </div>
        <span class="badge ${rep.correct ? 'vert' : 'rouge'}">${rep.correct ? '✓' : '✗'}</span>
      `;
      conteneur.appendChild(div);
    });
  },

  // ==============================
  // SAUVEGARDE LOCALE
  // ==============================
  sauvegarderProgression() {
    const cle = 'spc_prog_' + this.qcm.id;
    const data = {
      sessionId: this.sessionId,
      qcmId: this.qcm.id,
      indexCourant: this.indexCourant,
      score: this.score,
      reponsesDonnees: this.reponsesDonnees,
      date: new Date().toISOString()
    };
    localStorage.setItem(cle, JSON.stringify(data));
  },

  sauvegarderResultatFinal(pct) {
    // Historique des résultats (pour export CSV prof)
    const cle = 'spc_resultats';
    let resultats = JSON.parse(localStorage.getItem(cle) || '[]');
    resultats.push({
      sessionId: this.sessionId,
      qcmId: this.qcm.id,
      qcmTitre: this.qcm.titre,
      classe: this.qcm.classe,
      score: this.score,
      total: this.questions.length,
      pct: pct,
      date: new Date().toISOString()
    });
    // Garder max 500 résultats
    if (resultats.length > 500) resultats = resultats.slice(-500);
    localStorage.setItem(cle, JSON.stringify(resultats));
  },

  // ==============================
  // ERREUR
  // ==============================
  afficherErreur(msg) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="card">
          <div class="vide">
            <div class="icone">⚠️</div>
            <p>${msg}</p>
          </div>
        </div>`;
    }
  },

  // ==============================
  // RECOMMENCER LE QCM
  // ==============================
  recommencer() {
    this.indexCourant = 0;
    this.score = 0;
    this.reponsesDonnees = [];
    this.afficherQuestion();
  }
};

// ==============================
// INIT AU CHARGEMENT
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Bouton "Question suivante"
  const btnSuivant = document.getElementById('btn-suivant');
  if (btnSuivant) {
    btnSuivant.addEventListener('click', () => App.questionSuivante());
  }

  // Bouton "Recommencer"
  const btnRecom = document.getElementById('btn-recommencer');
  if (btnRecom) {
    btnRecom.addEventListener('click', () => App.recommencer());
  }
});
