/**
 * Milan Club Marmirolo - Gestione Form Socio & Invio Email
 * Responsive & Mobile/Tablet Optimized
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('socioForm');
  const submitBtn = document.getElementById('submitBtn');
  const mailtoBtn = document.getElementById('mailtoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const printBtn = document.getElementById('printBtn');
  const modalSummary = document.getElementById('modalSummary');
  const cfInput = document.getElementById('codice_fiscale');
  const cfCharCount = document.getElementById('cfCharCount');
  const provInput = document.getElementById('provincia');
  const capInput = document.getElementById('cap');
  const yearSpan = document.getElementById('currentYear');

  const DEST_EMAIL = 'milanclubmarmirolo@gmail.com';

  // Imposta anno corrente nel footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Auto-uppercase e contatore per Codice Fiscale
  if (cfInput && cfCharCount) {
    cfInput.addEventListener('input', () => {
      cfInput.value = cfInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const len = cfInput.value.length;
      cfCharCount.textContent = `${len}/16`;

      const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
      if (len === 16 && cfRegex.test(cfInput.value)) {
        cfCharCount.classList.add('valid');
        clearFieldError(cfInput);
      } else {
        cfCharCount.classList.remove('valid');
      }
    });
  }

  // Auto-uppercase per Provincia (sigla o testo)
  if (provInput) {
    provInput.addEventListener('input', () => {
      provInput.value = provInput.value.toUpperCase();
    });
  }

  // Solo cifre per CAP (max 5)
  if (capInput) {
    capInput.addEventListener('input', () => {
      capInput.value = capInput.value.replace(/\D/g, '').slice(0, 5);
    });
  }

  // --- AUTO-COMPILAZIONE CAP e PROVINCIA da Località ---
  const localitaInput = document.getElementById('localita');
  const localitaDatalist = document.getElementById('localitaList');

  // Popola datalist per il campo Località con i nomi dei comuni
  if (localitaDatalist && window.LOCALITA_NAMES && window.LOCALITA_NAMES.length > 0) {
    const frag = document.createDocumentFragment();
    window.LOCALITA_NAMES.forEach(lName => {
      const opt = document.createElement('option');
      opt.value = lName;
      frag.appendChild(opt);
    });
    localitaDatalist.appendChild(frag);
  }

  function resolveLocalitaCAP(localitaValue) {
    if (!localitaValue || !window.CAP_DB) return null;
    const raw = localitaValue.trim();
    // Rimuovi eventuale provincia tra parentesi: "Marmirolo (MN)" -> "MARMIROLO"
    const cleaned = raw.replace(/\s*\(.*?\)\s*/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

    // Lookup diretto
    if (window.CAP_DB[cleaned]) {
      return window.CAP_DB[cleaned];
    }

    // Fallback: cerca corrispondenza parziale
    for (const [comuneKey, info] of Object.entries(window.CAP_DB)) {
      if (comuneKey === cleaned || comuneKey.startsWith(cleaned) || cleaned.startsWith(comuneKey)) {
        return info;
      }
    }
    return null;
  }

  function autoFillCapProvincia() {
    if (!localitaInput) return;
    const localitaVal = localitaInput.value.trim();
    if (!localitaVal) return;

    const info = resolveLocalitaCAP(localitaVal);
    if (info) {
      // Auto-fill CAP
      if (capInput && (!capInput.value || capInput._autoFilled)) {
        capInput.value = info.c;
        capInput._autoFilled = true;
        clearFieldError(capInput);
        // Flash animation
        capInput.classList.remove('cf-computed-flash');
        void capInput.offsetWidth;
        capInput.classList.add('cf-computed-flash');
      }
      // Auto-fill Provincia
      if (provInput && (!provInput.value || provInput._autoFilled)) {
        provInput.value = info.p;
        provInput._autoFilled = true;
        clearFieldError(provInput);
        // Flash animation
        provInput.classList.remove('cf-computed-flash');
        void provInput.offsetWidth;
        provInput.classList.add('cf-computed-flash');
      }
    }
  }

  if (localitaInput) {
    // Resetta flag auto-fill quando l'utente modifica manualmente CAP o Provincia
    if (capInput) {
      capInput.addEventListener('input', () => {
        if (document.activeElement === capInput) {
          capInput._autoFilled = false;
        }
      });
    }
    if (provInput) {
      provInput.addEventListener('input', () => {
        if (document.activeElement === provInput) {
          provInput._autoFilled = false;
        }
      });
    }

    localitaInput.addEventListener('input', () => autoFillCapProvincia());
    localitaInput.addEventListener('change', () => autoFillCapProvincia());
  }

  // Gestione rimozione errori all'input dell'utente
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
    input.addEventListener('change', () => clearFieldError(input));
  });

  // --- MOTORE CALCOLO CODICE FISCALE ITALIANO ---
  const nomeInput = document.getElementById('nome');
  const cognomeInput = document.getElementById('cognome');
  const dataNascitaInput = document.getElementById('data_nascita');
  const luogoNascitaInput = document.getElementById('luogo_nascita');
  const autoCfBtn = document.getElementById('autoCfBtn');
  const comuniDatalist = document.getElementById('comuniList');

  // Popola datalist con i comuni italiani e stati esteri
  if (comuniDatalist && window.COMUNI_NAMES && window.COMUNI_NAMES.length > 0) {
    const frag = document.createDocumentFragment();
    window.COMUNI_NAMES.forEach(cName => {
      const opt = document.createElement('option');
      opt.value = cName;
      frag.appendChild(opt);
    });
    comuniDatalist.appendChild(frag);
  }

  function getSelectedSesso() {
    const checked = form.querySelector('input[name="sesso"]:checked');
    return checked ? checked.value : 'M';
  }

  function normalizeChars(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }

  function extractConsonantsAndVowels(str) {
    const norm = normalizeChars(str);
    const consonants = [];
    const vowels = [];
    const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
    for (const char of norm) {
      if (VOWELS.has(char)) vowels.push(char);
      else consonants.push(char);
    }
    return { consonants, vowels };
  }

  function getCognomeCode(cognome) {
    const { consonants, vowels } = extractConsonantsAndVowels(cognome);
    return (consonants.join('') + vowels.join('') + 'XXX').slice(0, 3);
  }

  function getNomeCode(nome) {
    const { consonants, vowels } = extractConsonantsAndVowels(nome);
    if (consonants.length >= 4) {
      return consonants[0] + consonants[2] + consonants[3];
    }
    return (consonants.join('') + vowels.join('') + 'XXX').slice(0, 3);
  }

  const CF_MONTHS = ['A','B','C','D','E','H','L','M','P','R','S','T'];
  const CF_ODD = {
    '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
    'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
    'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
    'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
  };
  const CF_EVEN = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
    'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
    'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
  };

  function getControlChar(first15) {
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      const char = first15[i];
      if (i % 2 === 0) {
        sum += CF_ODD[char] || 0;
      } else {
        sum += CF_EVEN[char] || 0;
      }
    }
    return String.fromCharCode(65 + (sum % 26));
  }

  function resolveCodiceCatastale(luogo) {
    if (!luogo) return null;
    const raw = luogo.trim();
    if (/^[A-Za-z]\d{3}$/.test(raw)) {
      return raw.toUpperCase();
    }
    const cleaned = raw.replace(/\s*\(.*?\)\s*/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

    if (window.COMUNI_DB && window.COMUNI_DB[cleaned]) {
      return window.COMUNI_DB[cleaned];
    }
    if (window.COMUNI_DB) {
      for (const [comuneKey, code] of Object.entries(window.COMUNI_DB)) {
        if (comuneKey === cleaned || comuneKey.startsWith(cleaned) || cleaned.startsWith(comuneKey)) {
          return code;
        }
      }
    }
    return null;
  }

  function calculateCF() {
    const nome = nomeInput ? nomeInput.value.trim() : '';
    const cognome = cognomeInput ? cognomeInput.value.trim() : '';
    const sesso = getSelectedSesso();
    const dataNascita = dataNascitaInput ? dataNascitaInput.value.trim() : '';
    const luogoNascita = luogoNascitaInput ? luogoNascitaInput.value.trim() : '';

    if (!nome || !cognome || !dataNascita || !luogoNascita) {
      return null;
    }

    const dateParts = dataNascita.split('-');
    if (dateParts.length !== 3) return null;
    const year = dateParts[0].slice(-2);
    const monthIndex = parseInt(dateParts[1], 10) - 1;
    if (monthIndex < 0 || monthIndex > 11) return null;
    const monthCode = CF_MONTHS[monthIndex];
    let day = parseInt(dateParts[2], 10);
    if (isNaN(day)) return null;
    if (sesso === 'F') day += 40;
    const dayStr = String(day).padStart(2, '0');

    const catCode = resolveCodiceCatastale(luogoNascita);
    if (!catCode) return null;

    const cogCode = getCognomeCode(cognome);
    const nomCode = getNomeCode(nome);
    const first15 = cogCode + nomCode + year + monthCode + dayStr + catCode;
    const cin = getControlChar(first15);
    return first15 + cin;
  }

  function autoComputeCodiceFiscale(isExplicitClick = false) {
    const cf = calculateCF();
    if (cf && cf.length === 16) {
      cfInput.value = cf;
      if (cfCharCount) {
        cfCharCount.textContent = '16/16';
        cfCharCount.classList.add('valid');
      }
      clearFieldError(cfInput);

      cfInput.classList.remove('cf-computed-flash');
      void cfInput.offsetWidth;
      cfInput.classList.add('cf-computed-flash');

      if (isExplicitClick) {
        showToast(`Codice Fiscale calcolato: ${cf}`);
      }
    } else if (isExplicitClick) {
      const missing = [];
      if (!nomeInput.value.trim()) missing.push('Nome');
      if (!cognomeInput.value.trim()) missing.push('Cognome');
      if (!dataNascitaInput.value) missing.push('Data di nascita');
      if (!luogoNascitaInput.value.trim()) missing.push('Luogo di nascita');

      if (missing.length > 0) {
        showToast(`Per calcolare il CF inserisci: ${missing.join(', ')}`, true);
      } else {
        showToast(`Comune non riconosciuto nel database catastale. Inserisci il Codice Fiscale a mano.`, true);
      }
    }
  }

  // Event listener per calcolo automatico su digitazione
  [nomeInput, cognomeInput, dataNascitaInput, luogoNascitaInput].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => autoComputeCodiceFiscale(false));
    el.addEventListener('change', () => autoComputeCodiceFiscale(false));
  });

  form.querySelectorAll('input[name="sesso"]').forEach(radio => {
    radio.addEventListener('change', () => autoComputeCodiceFiscale(false));
  });

  if (autoCfBtn) {
    autoCfBtn.addEventListener('click', () => autoComputeCodiceFiscale(true));
  }

  // Modalità Dinamica: Nuovo Socio vs Rinnovo
  const opRadios = form.querySelectorAll('input[name="tipo_operazione"]');
  const rinnovoNotice = document.getElementById('rinnovoNotice');
  const nonRinnovoFields = [
    'ruolo', 'data_nascita', 'luogo_nascita', 'codice_fiscale',
    'indirizzo', 'civico', 'cap', 'localita', 'provincia', 'email', 'cellulare'
  ];

  function getSelectedTipoOperazione() {
    const checkedRadio = form.querySelector('input[name="tipo_operazione"]:checked');
    return checkedRadio ? checkedRadio.value : 'Nuovo Socio';
  }

  function updateFormMode() {
    const isRinnovo = getSelectedTipoOperazione() === 'Rinnovo';

    if (isRinnovo) {
      form.classList.add('mode-rinnovo');
      if (rinnovoNotice) rinnovoNotice.style.display = 'flex';

      // Nel rinnovo, solo Nome e Cognome sono obbligatori
      nonRinnovoFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.required = false;
          clearFieldError(el);
        }
      });
    } else {
      form.classList.remove('mode-rinnovo');
      if (rinnovoNotice) rinnovoNotice.style.display = 'none';

      // Per nuovo socio tutti i campi anagrafici e recapiti sono obbligatori
      nonRinnovoFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = true;
      });
    }
  }

  opRadios.forEach(radio => {
    radio.addEventListener('change', updateFormMode);
  });
  updateFormMode();

  // Validazione campi
  function validateForm() {
    let isValid = true;
    let firstInvalidField = null;

    // Reset stati di errore
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    const isRinnovo = getSelectedTipoOperazione() === 'Rinnovo';

    if (isRinnovo) {
      // Per il RINNOVO: solo Nome e Cognome sono obbligatori
      const rinnovoRequired = [
        { id: 'nome', label: 'Nome' },
        { id: 'cognome', label: 'Cognome' }
      ];

      for (const item of rinnovoRequired) {
        const field = document.getElementById(item.id);
        if (!field) continue;
        const val = field.value.trim();
        if (val === '') {
          showFieldError(field);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = field;
        }
      }

      // Se l'utente compila campi opzionali, validiamo il formato
      const cfField = document.getElementById('codice_fiscale');
      if (cfField && cfField.value.trim() !== '') {
        const cfVal = cfField.value.trim();
        const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
        if (cfVal.length !== 16 || !cfRegex.test(cfVal)) {
          showFieldError(cfField);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = cfField;
        }
      }

      const capField = document.getElementById('cap');
      if (capField && capField.value.trim() !== '') {
        if (!/^\d{5}$/.test(capField.value.trim())) {
          showFieldError(capField);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = capField;
        }
      }

      const emailField = document.getElementById('email');
      if (emailField && emailField.value.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
          showFieldError(emailField);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = emailField;
        }
      }

      const cellField = document.getElementById('cellulare');
      if (cellField && cellField.value.trim() !== '') {
        if (cellField.value.trim().length < 6) {
          showFieldError(cellField);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = cellField;
        }
      }

    } else {
      // Per NUOVO SOCIO: tutti i campi sono obbligatori
      const requiredFields = [
        { id: 'ruolo', label: 'Ruolo' },
        { id: 'nome', label: 'Nome' },
        { id: 'cognome', label: 'Cognome' },
        { id: 'data_nascita', label: 'Data di nascita' },
        { id: 'luogo_nascita', label: 'Luogo di nascita' },
        { id: 'codice_fiscale', label: 'Codice Fiscale', customValidate: (val) => val.length === 16 },
        { id: 'indirizzo', label: 'Indirizzo' },
        { id: 'civico', label: 'Numero civico' },
        { id: 'cap', label: 'CAP', customValidate: (val) => /^\d{5}$/.test(val) },
        { id: 'localita', label: 'Località' },
        { id: 'provincia', label: 'Provincia' },
        { id: 'email', label: 'Email', customValidate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
        { id: 'cellulare', label: 'Cellulare', customValidate: (val) => val.trim().length >= 6 }
      ];

      for (const item of requiredFields) {
        const field = document.getElementById(item.id);
        if (!field) continue;

        const val = field.value.trim();
        let fieldValid = val !== '';

        if (fieldValid && item.customValidate) {
          fieldValid = item.customValidate(val);
        }

        if (!fieldValid) {
          showFieldError(field);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = field;
        }
      }
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  function showFieldError(field) {
    field.classList.add('is-invalid');
    const group = field.closest('.form-group');
    if (group) {
      const hint = group.querySelector('.field-hint');
      if (hint) hint.classList.add('error');
    }
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const group = field.closest('.form-group');
    if (group) {
      const hint = group.querySelector('.field-hint');
      if (hint) hint.classList.remove('error');
    }
    const container = field.closest('.checkbox-container');
    if (container) container.classList.remove('has-error');
  }

  // Raccoglie tutti i dati dal form in un oggetto
  function getFormData() {
    const rawData = new FormData(form);
    const data = {};
    for (const [key, value] of rawData.entries()) {
      data[key] = value;
    }
    return data;
  }

  // Genera il testo leggibile per il riepilogo e per l'invio via Mailto
  function formatDataText(data) {
    return `SCHEDA SOCIO - MILAN CLUB MARMIROLO
===================================================
Ruolo / Qualifica:   ${data.ruolo || '-'}
Nome:                ${data.nome || '-'}
Cognome:             ${data.cognome || '-'}
Sesso:               ${data.sesso || '-'}
Data di Nascita:     ${data.data_nascita || '-'}
Luogo di Nascita:    ${data.luogo_nascita || '-'}
Codice Fiscale:      ${data.codice_fiscale || '-'}

Indirizzo:           ${data.indirizzo || '-'} n. ${data.civico || '-'}
CAP:                 ${data.cap || '-'}
Località / Comune:   ${data.localita || '-'}
Provincia:           ${data.provincia || '-'}

Email Socio:         ${data.email || '-'}
Cellulare:           ${data.cellulare || '-'}

Operazione:          ${data.tipo_operazione || 'Nuovo Socio'}
Note Aggiuntive:     ${data.note ? data.note : 'Nessuna'}
Data Compilazione:   ${new Date().toLocaleString('it-IT')}
===================================================`;
  }

  // Mostra Toast di notifica
  function showToast(message, isError = false) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.className = `toast-notice ${isError ? 'error' : ''}`;
    toast.textContent = message;
    
    // Trigger visualizzazione
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  // Mostra la finestra modale con il riassunto dati inviati
  function showSuccessModal(data) {
    if (!modalSummary) return;

    modalSummary.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Tipo Richiesta:</span>
        <span class="summary-value">${data.tipo_operazione}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Socio:</span>
        <span class="summary-value">${data.nome} ${data.cognome}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Sesso:</span>
        <span class="summary-value">${data.sesso || '-'}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Ruolo:</span>
        <span class="summary-value">${data.ruolo || 'Socio Ordinario'}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Codice Fiscale:</span>
        <span class="summary-value">${data.codice_fiscale || '-'}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Data & Luogo di Nascita:</span>
        <span class="summary-value">${data.data_nascita ? `${data.data_nascita} (${data.luogo_nascita || ''})` : '-'}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Residenza:</span>
        <span class="summary-value">${data.indirizzo ? `${data.indirizzo} ${data.civico || ''}, ${data.cap || ''} ${data.localita || ''} (${data.provincia || ''})` : '-'}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Email:</span>
        <span class="summary-value">${data.email || '-'}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Cellulare:</span>
        <span class="summary-value">${data.cellulare || '-'}</span>
      </div>
      ${data.note ? `
      <div class="summary-row">
        <span class="summary-label">Note:</span>
        <span class="summary-value">${data.note}</span>
      </div>` : ''}
    `;

    successModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Chiusura modale
  function closeModal() {
    successModal.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      closeModal();
      form.reset();
      if (cfCharCount) cfCharCount.textContent = '0/16';
      setTimeout(updateFormMode, 50);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Invio Form Principale tramite AJAX (FormSubmit endpoint)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Compila tutti i campi obbligatori contrassegnati in rosso', true);
      return;
    }

    const data = getFormData();
    
    // Aggiorna l'oggetto dell'email con Nome e Ruolo
    const subject = `Scheda Socio: ${data.nome} ${data.cognome} (${data.ruolo}) - Milan Club Marmirolo`;
    const subjectField = document.getElementById('emailSubject');
    if (subjectField) subjectField.value = subject;

    // Attiva stato di caricamento su bottone
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Invio asincrono tramite FormSubmit AJAX API
      const response = await fetch(`https://formsubmit.co/ajax/${DEST_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: subject,
          'Ruolo_Club': data.ruolo,
          'Nome': data.nome,
          'Cognome': data.cognome,
          'Sesso': data.sesso || 'M',
          'Codice_Fiscale': data.codice_fiscale,
          'Data_Nascita': data.data_nascita,
          'Luogo_Nascita': data.luogo_nascita,
          'Indirizzo': `${data.indirizzo} ${data.civico}`,
          'CAP': data.cap,
          'Localita': data.localita,
          'Provincia': data.provincia,
          'Email_Socio': data.email,
          'Telefono_Cellulare': data.cellulare,
          'Tipo_Operazione': data.tipo_operazione,
          'Note': data.note || 'Nessuna'
        })
      });

      const result = await response.json();

      if (response.ok && (result.success === 'true' || result.success === true || result.message)) {
        showSuccessModal(data);
      } else {
        throw new Error(result.message || 'Errore nella risposta del server');
      }
    } catch (err) {
      console.warn('Invio FormSubmit fallito o bloccato:', err);
      
      // Se fallisce l'invio web diretto (es. offline o blocco CORS), proponiamo l'invio via app email o form standard
      const proceedMailto = confirm(
        "Non è stato possibile inviare i dati tramite connessione diretta.\n\nVuoi aprirli e inviarli tramite la tua applicazione email (Mailto)?"
      );

      if (proceedMailto) {
        triggerMailto(data);
      } else {
        // Fallback: sottometti il form tradizionale HTTP POST
        form.submit();
      }
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  // Funzione Fallback: Invia tramite app Email nativa (Mailto)
  function triggerMailto(data) {
    const subject = encodeURIComponent(`Scheda Socio Milan Club: ${data.nome || ''} ${data.cognome || ''}`);
    const body = encodeURIComponent(formatDataText(data));
    const mailtoUrl = `mailto:${DEST_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  }

  // Pulsante Secondario: "Invia tramite App Email"
  if (mailtoBtn) {
    mailtoBtn.addEventListener('click', () => {
      const data = getFormData();
      if (!data.nome && !data.cognome) {
        showToast('Inserisci almeno Nome e Cognome prima di procedere', true);
        const nomeField = document.getElementById('nome');
        if (nomeField) nomeField.focus();
        return;
      }
      triggerMailto(data);
    });
  }

  // Reset del modulo
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      form.querySelectorAll('.field-hint.error').forEach(el => el.classList.remove('error'));
      if (cfCharCount) {
        cfCharCount.textContent = '0/16';
        cfCharCount.classList.remove('valid');
      }
      setTimeout(updateFormMode, 50);
      showToast('Modulo reimpostato');
    });
  }
});
