/**
 * admin.js — Panneau créateur QCM
 * SPC Afareiatu
 * Gestion CRUD QCM + export JSON/CSV
 */

// ==============================
// ÉTAT ADMIN
// ==============================
const Admin = {
  qcmCourant: null,
  questionEnCours: null, // null = nouveau, sinon index
  bibliotheque: [], // liste des QCMs sauvegardés

  // ==============================
  // INIT
  // ==============================
  init() {
    this.chargerBibliotheque();
    this.afficherBibliotheque();
    this.initFormulaire();
    this.initImport();
  },

  // ==============================
  // BIBLIOTHÈQUE QCM (localStorage)
  // ==============================
  chargerBibliotheque() {
    const data = localStorage.getItem('spc_admin_bibliotheque');
    this.bibliotheque = data ? JSON.parse(data) : [];
  },

  sauvegarderBibliotheque() {
    localStorage.setItem('spc_admin_bibliotheque', JSON.stringify(this.bibliotheque));
  },

  afficherBibliotheque() {
    const liste = document.getElementById('biblio-liste');
    if (!liste) return;

    if (this.bibliotheque.length === 0) {
      liste.innerHTML = `
        <div class="vide">
          <div class="icone">📂</div>
          <p>Aucun QCM créé. Commence par remplir le formulaire !</p>
        </div>`;
      return;
    }

    liste.innerHTML = '';
    this.bibliotheque.forEach((qcm, i) => {
      const div = document.createElement('div');
      div.className = 'qcm-item';
      div.innerHTML = `
        <div class="qcm-item-info">
          <h3>${qcm.titre}</h3>
          <p>${qcm.classe} — ${qcm.chapitre} — ${qcm.questions.length} question(s)</p>
        </div>
        <div class="flex">
          <button class="btn-icone" onclick="Admin.editerQCM(${i})" title="Modifier">✏️</button>
          <button class="btn-icone" onclick="Admin.exporterQCM(${i})" title="Exporter JSON">⬇️</button>
          <button class="btn-icone" onclick="Admin.supprimerQCM(${i})" title="Supprimer">🗑️</button>
        </div>
      `;
      liste.appendChild(div);
    });
  },

  // ==============================
  // FORMULAIRE MÉTA QCM
  // ==============================
  initFormulaire() {
    this.qcmCourant = this.qcmVide();
    this.afficherQuestions();

    const form = document.getElementById('form-meta');
    if (form) {
      form.addEventListener('input', () => this.mettreAJourMeta());
    }
  },

  qcmVide() {
    return {
      id: 'qcm-' + Date.now(),
      titre: '',
      classe: '4e',
      chapitre: '',
      auteur: 'Collège Afareiatu — SPC',
      date: new Date().toISOString().split('T')[0],
      version: 1,
      questions: []
    };
  },

  mettreAJourMeta() {
    this.qcmCourant.titre = document.getElementById('meta-titre').value.trim();
    this.qcmCourant.classe = document.getElementById('meta-classe').value;
    this.qcmCourant.chapitre = document.getElementById('meta-chapitre').value.trim();
    this.qcmCourant.auteur = document.getElementById('meta-auteur').value.trim();
  },

  // ==============================
  // GESTION QUESTIONS
  // ==============================
  afficherQuestions() {
    const liste = document.getElementById('questions-liste');
    if (!liste) return;

    if (!this.qcmCourant || this.qcmCourant.questions.length === 0) {
      liste.innerHTML = `
        <div class="vide">
          <div class="icone">❓</div>
          <p>Aucune question. Clique sur "Ajouter une question".</p>
        </div>`;
      return;
    }

    liste.innerHTML = '';
    this.qcmCourant.questions.forEach((q, i) => {
      const div = document.createElement('div');
      div.className = 'question-admin-item';
      div.innerHTML = `
        <div class="question-admin-texte">
          <strong>Q${i + 1}.</strong> ${q.enonce.substring(0, 70)}${q.enonce.length > 70 ? '...' : ''}
          <br><span class="text-petit" style="color:#888">${q.options.length} options — Réponse : ${['A','B','C','D'][q.reponse]}</span>
        </div>
        <div class="question-admin-actions">
          <button class="btn-icone" onclick="Admin.editerQuestion(${i})" title="Modifier">✏️</button>
          <button class="btn-icone" onclick="Admin.monterQuestion(${i})" title="Monter" ${i === 0 ? 'disabled' : ''}>⬆️</button>
          <button class="btn-icone" onclick="Admin.descendreQuestion(${i})" title="Descendre" ${i === this.qcmCourant.questions.length - 1 ? 'disabled' : ''}>⬇️</button>
          <button class="btn-icone" onclick="Admin.supprimerQuestion(${i})" title="Supprimer">🗑️</button>
        </div>
      `;
      liste.appendChild(div);
    });
  },

  ouvrirFormQuestion(indexEdit = null) {
    this.questionEnCours = indexEdit;
    const modal = document.getElementById('modal-question');
    if (!modal) return;

    // Préremplir si édition
    if (indexEdit !== null) {
      const q = this.qcmCourant.questions[indexEdit];
      document.getElementById('q-enonce').value = q.enonce;
      document.getElementById('q-feedback-correct').value = q.feedback_correct;
      document.getElementById('q-feedback-incorrect').value = q.feedback_incorrect;
      document.getElementById('q-code-socle').value = q.code_socle || '';
      document.getElementById('q-difficulte').value = q.difficulte || 1;
      q.options.forEach((opt, i) => {
        document.getElementById('q-option-' + i).value = opt;
      });
      // Cocher la bonne réponse
      document.querySelectorAll('input[name="q-reponse"]').forEach((r, i) => {
        r.checked = (i === q.reponse);
      });
      document.getElementById('modal-titre').textContent = 'Modifier la question';
    } else {
      // Vider le formulaire
      document.getElementById('form-question').reset();
      document.getElementById('modal-titre').textContent = 'Nouvelle question';
    }

    modal.style.display = 'flex';
  },

  fermerModal() {
    const modal = document.getElementById('modal-question');
    if (modal) modal.style.display = 'none';
    this.questionEnCours = null;
  },

  sauvegarderQuestion() {
    const enonce = document.getElementById('q-enonce').value.trim();
    if (!enonce) { alert('L\'énoncé est obligatoire.'); return; }

    const options = [0, 1, 2, 3].map(i => {
      return (document.getElementById('q-option-' + i).value || '').trim();
    });

    if (options.some(o => !o)) {
      alert('Toutes les options (A, B, C, D) sont obligatoires.');
      return;
    }

    const reponseEl = document.querySelector('input[name="q-reponse"]:checked');
    if (!reponseEl) {
      alert('Sélectionne la bonne réponse (A, B, C ou D).');
      return;
    }
    const reponse = parseInt(reponseEl.value);

    const feedbackCorrect = document.getElementById('q-feedback-correct').value.trim();
    const feedbackIncorrect = document.getElementById('q-feedback-incorrect').value.trim();
    if (!feedbackCorrect || !feedbackIncorrect) {
      alert('Les feedbacks correct et incorrect sont obligatoires.');
      return;
    }

    const question = {
      id: this.questionEnCours !== null
        ? this.qcmCourant.questions[this.questionEnCours].id
        : this.qcmCourant.questions.length + 1,
      enonce,
      options,
      reponse,
      feedback_correct: '✅ ' + feedbackCorrect,
      feedback_incorrect: '❌ ' + feedbackIncorrect,
      code_socle: document.getElementById('q-code-socle').value.trim() || '',
      difficulte: parseInt(document.getElementById('q-difficulte').value) || 1
    };

    if (this.questionEnCours !== null) {
      this.qcmCourant.questions[this.questionEnCours] = question;
    } else {
      this.qcmCourant.questions.push(question);
    }

    this.fermerModal();
    this.afficherQuestions();
  },

  editerQuestion(index) { this.ouvrirFormQuestion(index); },

  supprimerQuestion(index) {
    if (!confirm('Supprimer la question ' + (index + 1) + ' ?')) return;
    this.qcmCourant.questions.splice(index, 1);
    this.afficherQuestions();
  },

  monterQuestion(index) {
    if (index === 0) return;
    const tmp = this.qcmCourant.questions[index];
    this.qcmCourant.questions[index] = this.qcmCourant.questions[index - 1];
    this.qcmCourant.questions[index - 1] = tmp;
    this.afficherQuestions();
  },

  descendreQuestion(index) {
    const last = this.qcmCourant.questions.length - 1;
    if (index === last) return;
    const tmp = this.qcmCourant.questions[index];
    this.qcmCourant.questions[index] = this.qcmCourant.questions[index + 1];
    this.qcmCourant.questions[index + 1] = tmp;
    this.afficherQuestions();
  },

  // ==============================
  // SAUVEGARDER LE QCM
  // ==============================
  sauvegarderQCM() {
    this.mettreAJourMeta();

    if (!this.qcmCourant.titre) {
      alert('Le titre du QCM est obligatoire.'); return;
    }
    if (!this.qcmCourant.chapitre) {
      alert('Le chapitre est obligatoire.'); return;
    }
    if (this.qcmCourant.questions.length === 0) {
      alert('Ajoute au moins une question.'); return;
    }

    // Trouver si déjà dans bibliothèque (même id)
    const idx = this.bibliotheque.findIndex(q => q.id === this.qcmCourant.id);
    if (idx >= 0) {
      this.bibliotheque[idx] = JSON.parse(JSON.stringify(this.qcmCourant));
    } else {
      this.bibliotheque.push(JSON.parse(JSON.stringify(this.qcmCourant)));
    }

    this.sauvegarderBibliotheque();
    this.afficherBibliotheque();
    this.afficherAlerte('succes', '✅ QCM "' + this.qcmCourant.titre + '" sauvegardé !');
  },

  nouveauQCM() {
    if (this.qcmCourant && this.qcmCourant.questions.length > 0) {
      if (!confirm('Créer un nouveau QCM ? Les données non sauvegardées seront perdues.')) return;
    }
    this.qcmCourant = this.qcmVide();
    document.getElementById('form-meta').reset();
    this.afficherQuestions();
  },

  editerQCM(index) {
    this.qcmCourant = JSON.parse(JSON.stringify(this.bibliotheque[index]));
    document.getElementById('meta-titre').value = this.qcmCourant.titre;
    document.getElementById('meta-classe').value = this.qcmCourant.classe;
    document.getElementById('meta-chapitre').value = this.qcmCourant.chapitre;
    document.getElementById('meta-auteur').value = this.qcmCourant.auteur || '';
    this.afficherQuestions();
    document.getElementById('editeur').scrollIntoView({ behavior: 'smooth' });
  },

  supprimerQCM(index) {
    const qcm = this.bibliotheque[index];
    if (!confirm('Supprimer "' + qcm.titre + '" ?')) return;
    this.bibliotheque.splice(index, 1);
    this.sauvegarderBibliotheque();
    this.afficherBibliotheque();
  },

  // ==============================
  // EXPORT JSON
  // ==============================
  exporterQCM(index) {
    const qcm = this.bibliotheque[index];
    const json = JSON.stringify(qcm, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = qcm.id + '.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  exporterQCMCourant() {
    this.mettreAJourMeta();
    if (!this.qcmCourant.titre || this.qcmCourant.questions.length === 0) {
      alert('Sauvegarde le QCM d\'abord.'); return;
    }
    const json = JSON.stringify(this.qcmCourant, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.qcmCourant.id + '.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  // ==============================
  // IMPORT JSON
  // ==============================
  initImport() {
    const inputImport = document.getElementById('import-json');
    if (inputImport) {
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const qcm = JSON.parse(ev.target.result);
            if (!qcm.titre || !qcm.questions) throw new Error('Format invalide');
            this.qcmCourant = qcm;
            document.getElementById('meta-titre').value = qcm.titre;
            document.getElementById('meta-classe').value = qcm.classe || '4e';
            document.getElementById('meta-chapitre').value = qcm.chapitre || '';
            document.getElementById('meta-auteur').value = qcm.auteur || '';
            this.afficherQuestions();
            this.afficherAlerte('succes', '✅ QCM importé : ' + qcm.titre);
          } catch (err) {
            this.afficherAlerte('erreur', '❌ Fichier JSON invalide : ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  },

  // ==============================
  // EXPORT CSV RÉSULTATS (pour prof)
  // ==============================
  exporterResultatsCSV() {
    const resultats = JSON.parse(localStorage.getItem('spc_resultats') || '[]');
    if (resultats.length === 0) {
      alert('Aucun résultat enregistré.'); return;
    }

    const header = 'Session,QCM,Classe,Score,Total,Pourcentage,Date\n';
    const lignes = resultats.map(r =>
      `${r.sessionId},${r.qcmTitre},${r.classe},${r.score},${r.total},${r.pct}%,${r.date}`
    ).join('\n');

    const blob = new Blob([header + lignes], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultats-spc-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  effacerResultats() {
    if (!confirm('Effacer TOUS les résultats ? (action irréversible)')) return;
    localStorage.removeItem('spc_resultats');
    this.afficherAlerte('succes', '✅ Résultats effacés.');
  },

  // ==============================
  // ALERTE UI
  // ==============================
  afficherAlerte(type, msg) {
    const zone = document.getElementById('zone-alerte');
    if (!zone) return;
    zone.className = 'alerte alerte-' + type;
    zone.textContent = msg;
    zone.style.display = 'flex';
    setTimeout(() => { zone.style.display = 'none'; }, 4000);
  }
};

// Init
document.addEventListener('DOMContentLoaded', () => Admin.init());
