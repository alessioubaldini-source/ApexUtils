document.addEventListener('DOMContentLoaded', () => {
  // 1. LIVE SEARCH LOGIC
  const mainSearch = document.getElementById('mainSearch');
  const cards = document.querySelectorAll('.card:not(.grid-2)'); // Escludiamo i pattern complessi e il playground dal filtro base

  mainSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();

    cards.forEach((card) => {
      const rows = card.querySelectorAll('tbody tr');
      let cardHasMatch = false;

      rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        if (text.includes(term)) {
          row.style.display = '';
          cardHasMatch = true;
        } else {
          row.style.display = 'none';
        }
      });

      // Mostra/Nascondi intera card se non ci sono match
      card.style.display = cardHasMatch ? '' : 'none';
    });
  });

  // 3. SELECTOR BUILDER LOGIC
  const buildInputs = ['buildType1', 'buildVal1', 'buildRel', 'buildType2', 'buildVal2'];
  const generatedDisplay = document.getElementById('generatedSelector');
  const copyGenBtn = document.getElementById('copyGenerated');

  function updateBuilder() {
    const t1 = document.getElementById('buildType1').value;
    const v1 = document.getElementById('buildVal1').value.trim();
    const rel = document.getElementById('buildRel').value;
    const t2 = document.getElementById('buildType2').value;
    const v2 = document.getElementById('buildVal2').value.trim();

    if (!v1 && !v2) {
      generatedDisplay.innerText = '...';
      return;
    }

    const getPart = (type, val) => {
      if (!val) return '';
      if (type === 'class') return '.' + val.replace(/^\./, '');
      if (type === 'id') return '#' + val.replace(/^#/, '');
      return val;
    };

    const part1 = getPart(t1, v1);
    const part2 = getPart(t2, v2);

    let result = '';
    if (rel === 'and') {
      // Selettore composto (es: div.classe o .classe1.classe2)
      result = part1 + part2;
    } else {
      const separators = { child: ' > ', desc: ' ', adj: ' + ', sib: ' ~ ' };
      result = part1 + (part1 && part2 ? separators[rel] : '') + part2;
    }

    generatedDisplay.innerText = result || '...';
  }

  buildInputs.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateBuilder);
  });

  copyGenBtn.addEventListener('click', () => {
    const text = generatedDisplay.innerText;
    if (text !== '...') {
      navigator.clipboard.writeText(text);
      const originalText = copyGenBtn.innerText;
      copyGenBtn.innerText = 'Copiato!';
      setTimeout(() => (copyGenBtn.innerText = originalText), 1500);
    }
  });

  // 2. INTERACTIVE PLAYGROUND LOGIC
  const testerInput = document.getElementById('selectorTester');
  const sandbox = document.getElementById('sandbox');
  const feedback = document.getElementById('testerFeedback');

  testerInput.addEventListener('input', () => {
    const selector = testerInput.value.trim();

    // Reset highlights
    sandbox.querySelectorAll('*').forEach((el) => el.classList.remove('highlight'));
    feedback.innerText = '';

    if (!selector) return;

    try {
      const matches = sandbox.querySelectorAll(selector);

      if (matches.length > 0) {
        matches.forEach((el) => {
          // Evidenziamo solo se l'elemento è effettivamente dentro il sandbox
          // (querySelectorAll su un elemento radice è comunque sicuro)
          el.classList.add('highlight');
        });
        feedback.style.color = 'var(--accent)';
        feedback.innerText = `Match trovati: ${matches.length}`;
      } else {
        feedback.style.color = 'var(--muted)';
        feedback.innerText = 'Nessun match trovato nel sandbox.';
      }
    } catch (err) {
      // Se il selettore è incompleto o invalido mentre l'utente scrive
      feedback.style.color = 'var(--accent2)';
      feedback.innerText = 'Selettore non valido o incompleto...';
    }
  });
});
