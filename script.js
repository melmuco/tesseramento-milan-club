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

  // Gestione rimozione errori all'input dell'utente
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
    input.addEventListener('change', () => clearFieldError(input));
  });

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
