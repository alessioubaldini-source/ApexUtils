console.log('ApexUtils: Script JS caricato correttamente');
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const rows = document.querySelectorAll('tbody tr');
  const sections = document.querySelectorAll('.section');
  const filterBtns = document.querySelectorAll('.legend-item');
  const backToTopBtn = document.getElementById('back-to-top');

  // 1. LIVE SEARCH
  searchInput.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();

    // Filtra tutte le righe delle tabelle
    rows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });

    // Gestione visibilità macro-sezioni
    if (term.length > 0) {
      // Se sto cercando, nascondo le sezioni che non hanno righe visibili
      sections.forEach((sec) => {
        const visibleRows = sec.querySelectorAll('tbody tr:not([style*="display: none"])');
        sec.style.display = visibleRows.length > 0 ? '' : 'none';
      });
    } else {
      // Se ho cancellato la ricerca, ripristino il filtro di categoria attivo
      const activeBtn = document.querySelector('.legend-item.active');
      if (activeBtn) {
        filterSections(activeBtn.dataset.filter);
      }
    }
  });

  // 2. CATEGORY FILTERS
  function filterSections(category) {
    sections.forEach((sec) => {
      if (category === 'all' || sec.classList.contains(category)) {
        sec.style.display = '';
      } else {
        sec.style.display = 'none';
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      filterSections(btn.dataset.filter);

      // Reset della ricerca quando cambio filtro
      searchInput.value = '';
      rows.forEach((r) => (r.style.display = ''));
    });
  });

  // 3. BACK TO TOP
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // 5. COPY CODE BUTTON
  document.querySelectorAll('.example-block').forEach((block) => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerText = 'Copia';
    btn.type = 'button';
    btn.addEventListener('click', () => {
      const code = block.querySelector('pre').innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.innerText = 'Copiato!';
        setTimeout(() => (btn.innerText = 'Copia'), 2000);
      });
    });
    block.appendChild(btn);
  });

  // 6. SNIPPET MODAL SYSTEM
  const modal = document.getElementById('snippetModal');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.querySelector('.modal-title');
  const closeModal = document.getElementById('closeModal');

  // Dizionario degli snippet
  const snippets = {
    // SEZIONE A
    getIgWidget: `var widget = ApexUtils.getIgWidget('MY_STATIC_ID');\n// widget è un oggetto jQuery UI`,
    getIgSelectedIds: `var ids = ApexUtils.getIgSelectedIds('ORDINI_IG');\nif (ids.length === 0) alert('Seleziona un ordine');`,
    getIgSelectedRecords: `var rawRecords = ApexUtils.getIgSelectedRecords('MY_IG');\n// Ritorna array di array (struttura interna APEX per model.fetchRecords)`,
    getIgRecordsData: [
      `// Caso 1: Estrazione dati da righe SELEZIONATE\nvar data = ApexUtils.getIgRecordsData('RIGHE_IG', {\n  mode: 'selected',\n  columns: ['ID_PRODOTTO', 'QTA', 'PREZZO'],\n  raw: false\n});\nconsole.log(data); // Output: [{ID_PRODOTTO: 10, QTA: 5...}]`,
      `// Caso 2: Estrazione TUTTE le righe (es. per calcoli client-side)\nvar allRows = ApexUtils.getIgRecordsData('RIGHE_IG', {\n  mode: 'all',\n  columns: ['TOTALE_RIGA']\n});`,
      `// Caso 3: Formato RAW (più performante per grandi moli di dati)\nvar rawData = ApexUtils.getIgRecordsData('RIGHE_IG', {\n  mode: 'all',\n  raw: true \n});`,
      `// Caso 4: Filtro custom (es. solo righe con QTA > 0)\nvar validData = ApexUtils.getIgRecordsData('RIGHE_IG', {\n  mode: 'all',\n  columns: ['ID_ARTICOLO', 'QTA'],\n  filter: function(row) {\n    return Number(row.QTA) > 0;\n  }\n});`,
    ],
    iterateIgRecords: `ApexUtils.iterateIgRecords('MY_IG', function(record, index, id, model) {\n  var val = model.getValue(record, 'COLUMN_NAME');\n  console.log('Row ' + index + ': ' + val);\n});`,
    getIgRowsSelectionForAjax: `// Prepara array f01, f02 per processo legacy\nvar arrays = ApexUtils.getIgRowsSelectionForAjax('GRID', ['ID', 'NOTE']);\nApexUtils.runProcess('ELABORA', {\n  f01: arrays.f01,\n  f02: arrays.f02\n});`,
    isIgColumnLOV: `if (ApexUtils.isIgColumnLOV(model, 'STATO_ORDINE')) {\n  // È una colonna complessa (Select List/Popup LOV)\n}`,
    saveIg: `ApexUtils.saveIg('MY_GRID'); // Triggera il salvataggio nativo`,
    refreshIg: `ApexUtils.refreshIg('MY_GRID'); // Ricarica i dati`,
    refreshRegions: `ApexUtils.refreshRegions(['GRID_1', 'CHART_2']).then(() => {\n  console.log('Tutte le regioni aggiornate');\n});`,
    isIgChanged: `if (ApexUtils.isIgChanged('DETTAGLIO_IG')) {\n  alert('Hai modifiche non salvate!');\n}`,
    toggleIgInsert: [`// Caso 1: Disabilita inserimento (es. Utente Read-Only)\nApexUtils.toggleIgInsert('RIGHE_IG', false);`, `// Caso 2: Abilita inserimento\nApexUtils.toggleIgInsert('RIGHE_IG', true);`],
    syncIgSelectedRecords: `// Forza il refresh dei record selezionati dal DB (es. dopo calcolo server-side)\nApexUtils.syncIgSelectedRecords('MY_IG');`,
    getIgEventRecordValue: [
      `// Caso 1: Ottieni CODICE (Default) - es. '101' per Cliente\nvar id = ApexUtils.getIgEventRecordValue(this, 'CLIENTE_ID');`,
      `// Caso 2: Ottieni DESCRIZIONE - es. 'Acme Corp'\nvar desc = ApexUtils.getIgEventRecordValue(this, 'CLIENTE_ID', false);`,
    ],

    // SEZIONE B
    runProcess: [
      `// Caso 1: Processo semplice senza parametri\nApexUtils.runProcess('ESEGUI_CALCOLO').then(function() {\n  ApexUtils.showSuccess('Fatto');\n});`,
      `// Caso 2: Parametri input + Loading Mask su regione specifica\nApexUtils.runProcess('SALVA_DATI', {\n  x01: 'Parametro 1',\n  x02: 123\n}, '#REGION_STATIC_ID');`,
      `// Caso 3: Submit Page Items specifici\nApexUtils.runProcess('FILTRA_DATI', {\n  pageItems: '#P1_DEPT, #P1_YEAR'\n});`,
    ],
    runSequentialProcesses: `ApexUtils.runSequentialProcesses([\n  { name: 'STEP_1_VALIDA' },\n  { name: 'STEP_2_ELABORA' }\n], function(results) {\n  ApexUtils.showSuccess('Finito!');\n});`,
    updateItemsFromProcess: [
      `// Caso 1: Aggiorna items e sopprimi eventi Change (Default)\n// Utile per evitare loop di Dynamic Actions\nApexUtils.updateItemsFromProcess('GET_INFO', ['P1_NOME', 'P1_EMAIL']);`,
      `// Caso 2: Aggiorna items e SCATENA eventi Change\n// Utile se altri item dipendono da questi (es. Cascading LOV)\nApexUtils.updateItemsFromProcess('GET_INFO', ['P1_NOME'], false);`,
    ],
    setSessionState: `ApexUtils.setSessionState({ P1_ITEM: 'Valore', P1_ID: 123 })\n  .then(() => console.log('Session State aggiornato'));`,
    downloadFile: `// Scarica PDF generato dal backend\nApexUtils.downloadFile('PRINT_INVOICE', { p_inv_id: 1022 });`,
    safeSetValue: `// Imposta valore item senza scatenare eventi Change (no loop DA)\nApexUtils.safeSetValue('P1_ITEM', 'Nuovo Valore', true);`,

    // SEZIONE C
    disableItems: `ApexUtils.disableItems('#P1_NOME, #P1_COGNOME');`,
    enableItems: `ApexUtils.enableItems('#P1_NOME');`,
    hideItems: `ApexUtils.hideItems('#P1_ADVANCED_OPT'); // Nasconde intero container`,
    showItems: `ApexUtils.showItems('#P1_ADVANCED_OPT');`,
    clearItems: `ApexUtils.clearItems('.filtri-ricerca');`,
    isFormChanged: `if (ApexUtils.isFormChanged()) {\n  // Logica custom warning\n}`,
    resetDirtyState: `ApexUtils.resetDirtyState(); // Rimuove warning "modifiche non salvate" dopo save custom`,
    getItemValueAsNumber: `// Converte "1.200,50" (IT) in 1200.50 (JS)\nvar total = ApexUtils.getItemValueAsNumber('P1_TOTALE');`,
    serializeContainer: `var formData = ApexUtils.serializeContainer('REGION_STATIC_ID');`,

    // SEZIONE C2
    callForm: [
      `// Caso 1: Navigazione base alla pagina 10 con parametri\nApexUtils.callForm(10, { P10_ID: 50, P10_MODE: 'EDIT' });`,
      `// Caso 2: Navigazione avanzata con reset delle Interactive Grid\nApexUtils.callForm(102, { P102_MASTER: 1 }, {\n  mode: 'same',\n  clearCache: '102',\n  resetIg: true\n});`,
    ],
    closeModalAndRefresh: `// Chiudi dialog e aggiorna la griglia padre\nApexUtils.closeModalAndRefresh('PADRE_IG');`,
    getUrlParam: `var id = ApexUtils.getUrlParam('p_id');\nif (id) console.log('ID trovato in URL:', id);`,
    redirect: `ApexUtils.redirect('f?p=APP:PAGE:SESSION');`,

    // SEZIONE D
    showSuccess: `ApexUtils.showSuccess('Operazione completata con successo');`,
    showError: `ApexUtils.showError('Attenzione: Dati mancanti');`,
    setFocusFirstError: `// Utile dopo validazioni manuali\nApexUtils.setFocusFirstError();`,
    copyToClipboard: `ApexUtils.copyToClipboard('Codice: ABC-123');`,
    fallbackCopyToClipboard: `ApexUtils.fallbackCopyToClipboard('Testo da copiare'); // Fallback legacy`,
    animate: [`// Caso 1: Pulse (attenzione generica)\nApexUtils.animate('#btnSalva');`, `// Caso 2: Shake (errore/blocco)\nApexUtils.animate('#P1_CAMPO', 'shake', 300);`],
    setTabState: `// Disabilita tab "Dettagli"\nApexUtils.setTabState('REGION_DETTAGLI', false);`,

    // SEZIONE E
    isEmpty: `if (ApexUtils.isEmpty(valore)) { return; }`,
    isNumeric: `if (ApexUtils.isNumeric('1.500,20')) {\n  console.log('Valore numerico valido');\n}`,
    debounce: `// Esegui ricerca solo dopo 300ms di stop digitazione\n$('#search').on('keyup', ApexUtils.debounce(cercaFn, 300));`,
    formatNumber: `var str = ApexUtils.formatNumber(1500.2, '999G990D00');`,
    isValidEmail: `if (!ApexUtils.isValidEmail('test@example.com')) alert('Email errata');`,
    isValidCF: `if (ApexUtils.isValidCF('RSSMRA80A01H501U')) {\n  console.log('Codice Fiscale valido');\n}`,
    stringToDate: `var dateObj = ApexUtils.stringToDate('25/12/2023');\n// Nota: i mesi in JS partono da 0 (Dicembre = 11)`,

    // SEZIONE F
    storageSet: `ApexUtils.storageSet('user_pref', { dark: true });`,
    storageGet: `var prefs = ApexUtils.storageGet('user_pref');`,

    // SEZIONE G (DEBUG)
    debug: `ApexUtils.debug('Log info', { id: 123 }); // Visibile solo se debug attivo`,
    debugTimerStart: `ApexUtils.debugTimerStart('LoadData');`,
    debugTimerEnd: `ApexUtils.debugTimerEnd('LoadData'); // Stampa durata in console`,
    logPageState: `ApexUtils.logPageState(); // Stampa console.table con valori di tutti gli item`,
    visualHighlight: `ApexUtils.visualHighlight('#P1_SALVA'); // Bordo rosso temporaneo per debug visivo`,
    triggerEvent: `ApexUtils.triggerEvent('#P1_BTN', 'click');`,

    // LEGACY / COMPAT
    cmsGetValueRecord: `var val = cmsGetValueRecord(this, 'COL'); // Legacy alias`,
    cmsAbiInsert: `cmsAbiInsert('IG_STATIC_ID', true); // Legacy alias`,
    cmsStringToDate: `var d = cmsStringToDate('01/01/2020'); // Legacy alias`,
    isColumnLOV: `if (isColumnLOV(model, 'STATO')) { ... } // Legacy alias`,
    cmsGetRowsSelection: `var sel = cmsGetRowsSelection('IG_ID', ['ID', 'NOTE']); // Legacy alias`,
    cmsGridChanged: `if (cmsGridChanged('IG_ID')) alert('Modificato'); // Legacy alias`,
  };

  // Gestione Click su Funzioni
  document.querySelectorAll('td .fn').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Puliamo il nome funzione da parentesi ()
      const fnName = e.target.innerText.replace('()', '').trim();
      const snippet = snippets[fnName];

      if (snippet) {
        modalTitle.innerText = `Esempio: ${fnName}`;

        // Pulisci contenuto precedente
        modalBody.innerHTML = '';

        // Normalizza snippet in array per gestire casi multipli
        const snippetList = Array.isArray(snippet) ? snippet : [snippet];

        snippetList.forEach((snipText, idx) => {
          // Wrapper relativo per posizionare il pulsante Copia
          const wrapper = document.createElement('div');
          wrapper.style.position = 'relative';
          if (idx > 0) wrapper.style.borderTop = '1px solid #2e3650'; // Separatore visivo

          const pre = document.createElement('pre');
          pre.className = 'modal-code';
          pre.innerHTML = syntaxHighlight(snipText);

          const btn = document.createElement('button');
          btn.className = 'copy-btn';
          btn.type = 'button';
          btn.innerText = 'Copia';
          addCopyLogic(btn, snipText);

          wrapper.appendChild(btn);
          wrapper.appendChild(pre);
          modalBody.appendChild(wrapper);
        });

        modal.classList.add('open');
      } else {
        // Feedback visivo se non c'è snippet (opzionale)
        console.log(`Nessun esempio disponibile per ${fnName}`);
      }
    });
  });

  // Chiudi modale
  closeModal.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) modal.classList.remove('open');
  });

  // Helper per logica copia (riutilizzabile)
  function addCopyLogic(btn, text) {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        btn.innerText = 'Copiato!';
        setTimeout(() => (btn.innerText = 'Copia'), 2000);
      });
    });
  }

  // Helper per syntax highlighting (Classi come da esempi PRO)
  function syntaxHighlight(code) {
    // Escape HTML base
    let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Regex Tokenizer: Stringhe | Commenti | Keywords | Numeri | ApexUtils | Metodi | Proprietà | Chiavi Oggetto
    // Ordine importante: Stringhe e Commenti prima per evitare match interni
    return html.replace(
      /('[^']*')|(\/\/.*)|(\b(?:var|function|return|if|else|true|false|new|null|const|let)\b)|(\b\d+\b)|(\bApexUtils\b)|(\.[a-zA-Z0-9_]+)(?=\()|(\.[a-zA-Z0-9_]+)|(\b[a-zA-Z0-9_]+:)/g,
      (m, str, cmt, kw, num, cls, method, prop, key) => {
        if (str) return `<span class="str">${str}</span>`;
        if (cmt) return `<span class="cmt">${cmt}</span>`;
        if (kw) return `<span class="kw">${kw}</span>`;
        if (num) return `<span class="num">${num}</span>`;
        if (cls) return `<span class="fn-c">${cls}</span>`;
        if (method) return `.<span class="method">${method.substring(1)}</span>`;
        if (prop) return `.<span class="prop">${prop.substring(1)}</span>`;
        if (key) return `<span class="prop">${key.slice(0, -1)}</span>:`;
        return m;
      },
    );
  }
});
