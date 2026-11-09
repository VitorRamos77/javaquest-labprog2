/* =========================================================
   JavaQuest — plataforma de treino 100% prática
   ========================================================= */
(function () {
  'use strict';

  const STORE = 'javaquest_v2';
  const $app = document.getElementById('app');
  const esc = window.escapeHtml;

  /* ---------------- estado persistido ---------------- */
  const blank = () => ({ xp: 0, phases: {}, unlockAll: false });
  let S;
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { S = blank(); }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} };
  const codeKey = (id) => 'jq2_code_' + id;

  /* ---------------- trilhas ---------------- */
  PHASES.forEach((p) => { if (['html', 'css', 'js'].includes(p.kind)) p.track = 'front'; });
  const TRACKS = [
    { id: 'java', title: 'Trilha 1 · Java', desc: 'Da primeira linha de código à orientação a objetos, coleções, arquivos e generics.', order: PHASES.filter((p) => p.track === 'java').map((p) => p.id) },
    { id: 'web', title: 'Trilha 2 · Java Web', desc: 'APIs REST com Spring Boot (@RestController, métodos HTTP, filtros, ResponseEntity, @RequestBody), SQL e CRUD com JPA/Hibernate.', order: ['s01', 's02', 's03', 's05', 's06', 's07', 's08', 's09', 's10', 'q01', 's04'] },
    { id: 'front', title: 'Trilha 3 · Front-end', desc: 'HTML5, CSS3 e JavaScript: as páginas que conversam com sua API.', order: PHASES.filter((p) => p.track === 'front').map((p) => p.id) },
    { id: 'projeto', title: 'Trilha 4 · Projeto Spring: Sistema de Biblioteca', desc: 'Um projeto maior organizado em pacotes (model, repository, service, controller, dto…), com package e import entre pastas. Cada fase evolui o mesmo sistema. Recomendado depois da Trilha 2.', order: PHASES.filter((p) => p.track === 'projeto').map((p) => p.id) },
  ];
  const byId = (id) => PHASES.find((p) => p.id === id);
  const MAIN = PHASES.filter((p) => !p.exam);          // fases (sem os simulados)
  const EXAMS = PHASES.filter((p) => p.exam);
  const trackOf = (p) => TRACKS.find((t) => t.order.includes(p.id));
  const nextOf = (p) => { const t = trackOf(p); const i = t.order.indexOf(p.id); return t.order[i + 1] ? byId(t.order[i + 1]) : null; };
  const isDone = (id) => !!(S.phases[id] && S.phases[id].done);
  function isUnlocked(p) {
    if (S.unlockAll) return true;
    const t = trackOf(p); const i = t.order.indexOf(p.id);
    return i === 0 || isDone(t.order[i - 1]);
  }
  const LEVEL_NAMES = ['', 'Básico', 'Fácil', 'Médio', 'Difícil', 'Desafio'];
  const KIND_LABEL = { java: 'Java', spring: 'Spring Boot', sql: 'SQL', html: 'HTML', css: 'CSS', js: 'JavaScript' };
  const LANG = { java: 'java', spring: 'java', sql: 'sql', html: 'html', css: 'css', js: 'js' };

  /* ---------------- utilidades ---------------- */
  function fmt(s) {
    return String(s || '').split(/(`[^`]+`)/).map((part) => {
      if (/^`[^`]+`$/.test(part)) return '<code>' + esc(part.slice(1, -1)) + '</code>';
      return esc(part).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    }).join('');
  }
  function toast(msg, ms) {
    const t = document.getElementById('toast');
    t.innerHTML = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms || 2400);
  }
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------------- servidor Java ---------------- */
  const Server = {
    token: null, online: false, version: '',
    async check() {
      if (location.protocol === 'file:') { this.online = false; return; }
      try {
        const r = await fetch('/api/token', { cache: 'no-store' });
        const j = await r.json();
        this.token = j.token; this.version = j.java; this.online = true;
      } catch (e) { this.online = false; }
    },
    async run(payload) {
      const r = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-JQ-Token': this.token }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    },
  };

  function renderTopStats() {
    const done = MAIN.filter((p) => isDone(p.id)).length;
    const lv = Math.floor(S.xp / 300) + 1;
    document.getElementById('topStats').innerHTML =
      '<span class="stat" title="Status do servidor Java">' + (Server.online ? '<i class="dot on"></i> Java ' + esc(Server.version) : '<i class="dot"></i> Java offline') + '</span>' +
      '<span class="stat hide-sm">Nv <b>' + lv + '</b></span>' +
      '<span class="stat">⭐ <b>' + S.xp + '</b> XP</span>' +
      '<span class="stat hide-sm">🏁 <b>' + done + '</b>/' + MAIN.length + '</span>';
  }

  /* =========================================================
     MAPA DE FASES
     ========================================================= */
  function renderHome() {
    Workspace.dispose();
    Cola.setContext(null);
    renderTopStats();
    const done = MAIN.filter((p) => isDone(p.id)).length;
    let html = '<section class="home">';
    html += `<div class="hero">
      <div>
        <h1>Aprenda <span class="grad">codando</span>.</h1>
        <p>Cada fase é um exercício de código com testes automáticos, baseado nas aulas de Lab Prog II.
        Escreva, execute, passe nos testes e libere a próxima. A <b>📋 Cola</b> fica sempre à direita (tecla <kbd>Alt</kbd>+<kbd>C</kbd>).</p>
        <div class="hero-bar"><i style="width:${(done / MAIN.length) * 100}%"></i></div>
        <small class="muted">${done} de ${MAIN.length} fases concluídas · ${S.xp} XP</small>
      </div>
    </div>`;
    if (!Server.online) {
      html += `<div class="warnbox"><b>☕ O servidor Java não está rodando.</b> As fases de HTML, CSS, JavaScript e SQL funcionam normalmente,
      mas para compilar e testar Java/Spring abra um terminal nesta pasta e rode:
      <pre class="code"><code>java JavaQuest.java</code></pre>Depois acesse <code>http://localhost:5517</code>. (Requer JDK 17+.)</div>`;
    }
    S.exams = S.exams || {};
    html += `<div class="track-head"><div><h2>📝 Simulados de Prova</h2><p>No formato da P1: cenário, classe modelo, "banco" pronto e endpoints, valendo <b>10 pontos</b> em <b>50 minutos</b>. Cada item só pontua se todos os seus testes passarem. Entregue para ver a nota e liberar o gabarito.</p></div></div><div class="path exams">`;
    EXAMS.forEach((p) => {
      const e = S.exams[p.id] || {};
      const running = e.start && !e.delivered;
      html += `<button class="phase exam-card ${e.best != null ? 'done' : ''}" data-phase="${p.id}">
        <span class="ph-icon">${p.icon}</span>
        <span class="ph-title">${esc(p.title)}</span>
        <span class="ph-sub">${esc(p.subtitle)}</span>
        <span class="ph-foot"><span class="kind kind-${p.kind}">${KIND_LABEL[p.kind]}</span><span class="muted small">⏱ ${p.exam.duracao} min · 10 pts</span></span>
        ${e.best != null ? '<span class="nota-badge ' + notaClass(e.best) + '">' + fmtNota(e.best) + '</span>' : running ? '<span class="ph-badge">em andamento</span>' : ''}
      </button>`;
    });
    html += '</div>';
    TRACKS.forEach((tr) => {
      const n = tr.order.filter(isDone).length;
      html += `<div class="track-head"><div><h2>${tr.title}</h2><p>${tr.desc}</p></div><span class="track-count">${n}/${tr.order.length}</span></div><div class="path">`;
      tr.order.forEach((id, k) => {
        const p = byId(id);
        const st = S.phases[id];
        const un = isUnlocked(p);
        const stars = st && st.done ? st.stars : 0;
        const started = !!localStorage.getItem(codeKey(id));
        html += `<button class="phase ${un ? '' : 'locked'} ${st && st.done ? 'done' : ''}" data-phase="${id}" ${un ? '' : 'disabled'}>
          <span class="ph-num">${k + 1}</span>
          <span class="ph-icon">${un ? p.icon : '🔒'}</span>
          <span class="ph-title">${esc(p.title)}</span>
          <span class="ph-sub">${esc(p.subtitle)}</span>
          <span class="ph-foot">
            <span class="kind kind-${p.kind}">${KIND_LABEL[p.kind]}</span>
            <span class="lvl" title="Dificuldade: ${LEVEL_NAMES[p.level]}">${'●'.repeat(p.level)}<span>${'●'.repeat(5 - p.level)}</span></span>
          </span>
          ${st && st.done ? '<span class="ph-stars">' + [1, 2, 3].map((i) => '<i class="' + (i <= stars ? 'on' : '') + '">★</i>').join('') + '</span>' : started && un ? '<span class="ph-badge">em andamento</span>' : ''}
        </button>`;
      });
      html += '</div>';
    });
    html += `<div class="home-foot">
      <label class="switch"><input type="checkbox" id="unlockAll" ${S.unlockAll ? 'checked' : ''}> <span>Desbloquear todas as fases</span></label>
      <button class="btn btn-ghost btn-sm" id="resetAll">Zerar progresso</button>
    </div></section>`;
    $app.innerHTML = html;
    $app.className = '';
    $app.querySelectorAll('[data-phase]').forEach((b) => b.addEventListener('click', () => openPhase(b.dataset.phase)));
    $app.querySelector('#unlockAll').addEventListener('change', (e) => { S.unlockAll = e.target.checked; save(); renderHome(); });
    $app.querySelector('#resetAll').addEventListener('click', () => {
      if (!confirm('Apagar todo o progresso e TODO o código salvo das fases?')) return;
      S = blank(); save();
      PHASES.forEach((p) => localStorage.removeItem(codeKey(p.id)));
      renderHome();
    });
    window.scrollTo(0, 0);
  }

  /* =========================================================
     EDITOR (textarea + realce + números de linha)
     ========================================================= */
  class Editor {
    constructor(host, lang, onChange) {
      this.lang = lang; this.onChange = onChange; this.errLines = new Map();
      host.innerHTML = '<div class="ed"><div class="ed-gutter"></div><div class="ed-area"><pre class="ed-hl" aria-hidden="true"><code></code></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea></div></div>';
      this.ta = host.querySelector('textarea');
      this.hl = host.querySelector('.ed-hl');
      this.code = host.querySelector('.ed-hl code');
      this.gutter = host.querySelector('.ed-gutter');
      this.indent = lang === 'java' ? '    ' : '  ';
      this.ta.addEventListener('input', () => { this.paint(); this.onChange && this.onChange(this.ta.value); });
      this.ta.addEventListener('scroll', () => this.sync());
      this.ta.addEventListener('keydown', (e) => this.key(e));
    }
    set value(v) { this.ta.value = v; this.paint(); }
    get value() { return this.ta.value; }
    setReadOnly(r) { r = !!r; this.ta.readOnly = r; this.ta.parentElement.classList.toggle('ro', r); }
    setErrors(lines) { this.errLines = lines || new Map(); this.paintGutter(); }
    paint() {
      const v = this.ta.value;
      this.code.innerHTML = highlight(v, this.lang) + (v.endsWith('\n') || v === '' ? ' ' : '');
      this.paintGutter(); this.sync();
    }
    paintGutter() {
      const n = this.ta.value.split('\n').length;
      let g = '';
      for (let i = 1; i <= n; i++) {
        const e = this.errLines.get(i);
        g += e ? '<div class="err" title="' + esc(e) + '">' + i + '</div>' : '<div>' + i + '</div>';
      }
      this.gutter.innerHTML = g;
    }
    sync() {
      this.hl.scrollTop = this.ta.scrollTop; this.hl.scrollLeft = this.ta.scrollLeft;
      this.gutter.scrollTop = this.ta.scrollTop;
    }
    goto(line) {
      const lines = this.ta.value.split('\n');
      let pos = 0;
      for (let i = 0; i < Math.min(line - 1, lines.length); i++) pos += lines[i].length + 1;
      this.ta.focus();
      this.ta.setSelectionRange(pos, pos + (lines[line - 1] || '').length);
      const lh = parseFloat(getComputedStyle(this.ta).lineHeight) || 20;
      this.ta.scrollTop = Math.max(0, (line - 4) * lh);
    }
    insert(text, selFrom, selTo) {
      // usa execCommand para manter o desfazer (Ctrl+Z)
      this.ta.focus();
      if (selFrom !== undefined) this.ta.setSelectionRange(selFrom, selTo);
      if (!document.execCommand('insertText', false, text)) {
        const s = this.ta.selectionStart, e = this.ta.selectionEnd;
        this.ta.value = this.ta.value.slice(0, s) + text + this.ta.value.slice(e);
        this.ta.selectionStart = this.ta.selectionEnd = s + text.length;
        this.ta.dispatchEvent(new Event('input'));
      }
    }
    key(e) {
      const ta = this.ta;
      if (ta.readOnly) return;
      const s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
      if (e.key === 'Tab') {
        e.preventDefault();
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        if (s !== en && v.slice(s, en).includes('\n') || e.shiftKey) {
          // (des)indenta as linhas selecionadas
          const le = v.indexOf('\n', en - 1) === -1 ? v.length : v.indexOf('\n', en - (en > s && v[en - 1] === '\n' ? 1 : 0));
          const block = v.slice(ls, le);
          const out = block.split('\n').map((l) => e.shiftKey ? l.replace(new RegExp('^( {1,' + this.indent.length + '}|\\t)'), '') : this.indent + l).join('\n');
          this.insert(out, ls, le);
          ta.setSelectionRange(ls, ls + out.length);
        } else {
          this.insert(this.indent);
        }
      } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const cur = v.slice(ls, s);
        let ind = (cur.match(/^[ \t]*/) || [''])[0];
        const prev = cur.trimEnd().slice(-1);
        const next = v.slice(en).trimStart()[0];
        if (prev === '{' || prev === '(' || prev === '[' || (this.lang === 'html' && /<(?!\/)[a-z][^>]*>$/i.test(cur.trimEnd()) && !/<(br|img|input|meta|link|hr)\b/i.test(cur.slice(cur.lastIndexOf('<'))))) {
          const closing = (prev === '{' && next === '}') || (prev === '(' && next === ')') || (prev === '[' && next === ']') || (this.lang === 'html' && v.slice(en).trimStart().startsWith('</'));
          if (closing) { this.insert('\n' + ind + this.indent + '\n' + ind); ta.setSelectionRange(s + 1 + ind.length + this.indent.length, s + 1 + ind.length + this.indent.length); return; }
          ind += this.indent;
        }
        this.insert('\n' + ind);
      } else if (e.key === '}' && s === en) {
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const before = v.slice(ls, s);
        if (/^[ \t]+$/.test(before) && before.length >= this.indent.length) {
          e.preventDefault();
          this.insert(before.slice(this.indent.length) + '}', ls, s);
        }
      }
    }
  }

  /* =========================================================
     WORKSPACE DA FASE
     ========================================================= */
  const Workspace = {
    p: null, files: null, cur: 0, editor: null, msgListener: null, runId: null, usedHint: 0, busy: false,

    dispose() {
      if (this.msgListener) window.removeEventListener('message', this.msgListener);
      this.msgListener = null; this.p = null;
      clearInterval(this.timer); this.timer = null;
    },

    load(p) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(codeKey(p.id)) || 'null'); } catch (e) {}
      const files = p.files.map((f) => ({ name: f.name, readonly: !!f.readonly, code: saved && saved[f.name] != null && !f.readonly ? saved[f.name] : f.code }));
      if (saved) {
        Object.keys(saved).forEach((n) => {
          if (n === '__deleted') return;
          if (!files.some((f) => f.name === n)) files.push({ name: n, code: saved[n], custom: true });
        });
        (saved.__deleted || []).forEach((n) => { const i = files.findIndex((f) => f.name === n && !f.readonly); if (i >= 0) files.splice(i, 1); });
      }
      return sortFiles(files);
    },
    persist() {
      const o = {};
      this.files.forEach((f) => { if (!f.readonly) o[f.name] = f.code; });
      const del = this.p.files.filter((pf) => !pf.readonly && !this.files.some((f) => f.name === pf.name)).map((pf) => pf.name);
      if (del.length) o.__deleted = del;
      try { localStorage.setItem(codeKey(this.p.id), JSON.stringify(o)); } catch (e) {}
    },
  };

  function openPhase(id) {
    const p = byId(id);
    Workspace.dispose();
    Workspace.p = p;
    Workspace.files = Workspace.load(p);
    Workspace.cur = 0;
    Workspace.usedHint = 0;
    Workspace.sawSolution = false;
    Workspace.errors = {};
    Cola.setContext(p.cola);
    renderTopStats();
    const st = S.phases[id];
    const needsJava = p.kind === 'java' || p.kind === 'spring';
    const web = ['html', 'css', 'js'].includes(p.kind);
    const t = trackOf(p) || { title: '· Simulado de prova', order: [id] };
    const idx = t.order.indexOf(id);
    const exam = !!p.exam;
    if (exam) startExamAttempt(p);

    const outTabs = [];
    if (web) outTabs.push(['preview', '👁 Página']);
    outTabs.push(['out', '🖥 Saída']);
    outTabs.push(['tests', '🧪 Testes']);
    if (p.kind === 'java' && p.run) outTabs.push(['stdin', '⌨ Entrada']);
    if (p.kind === 'spring') outTabs.push(['req', '📮 Requisições']);
    if (p.kind === 'sql') outTabs.push(['table', '📋 Tabela']);

    $app.className = 'ws-mode';
    $app.innerHTML = `<section class="ws">
      <aside class="ws-left">
        <div class="ws-nav">
          <button class="back" id="back">← ${exam ? 'Início' : 'Fases'}</button>
          <span class="muted small">${esc(t.title.split('·')[1] || '')} · ${idx + 1}/${t.order.length}</span>
        </div>
        <div class="ws-title">
          <span class="ws-icon">${p.icon}</span>
          <div><h1>${esc(p.title)}</h1><p>${esc(p.subtitle)}</p>
          <span class="kind kind-${p.kind}">${KIND_LABEL[p.kind]}</span> <span class="lvl">${'●'.repeat(p.level)}<span>${'●'.repeat(5 - p.level)}</span></span> ${st && st.done ? '<span class="donechip">✔ concluída</span>' : ''}</div>
        </div>
        ${exam ? examPanelHtml(p) : `<div class="ws-scroll">
          <h3>🎯 Sua missão</h3>
          <div class="task">${fmt(p.task)}</div>
          ${p.example ? '<div class="example">' + (p.example.input ? '<div><small>Entrada</small><pre>' + esc(p.example.input) + '</pre></div>' : '') + '<div><small>Saída esperada</small><pre>' + esc(p.example.output) + '</pre></div></div>' : ''}
          <h3>📚 Conceitos da aula</h3>
          <ul class="theory">${p.theory.map((x) => '<li>' + fmt(x) + '</li>').join('')}</ul>
          <h3>💡 Dicas <small class="muted">(usar dicas reduz as estrelas)</small></h3>
          <div id="hints"></div>
          <button class="btn btn-ghost btn-sm" id="hintBtn">Mostrar dica 1 de ${p.hints.length}</button>
          <button class="btn btn-ghost btn-sm" id="solBtn">👀 Ver solução</button>
          ${needsJava && !Server.online ? '<div class="warnbox small"><b>Servidor Java offline.</b> Rode <code>java JavaQuest.java</code> nesta pasta e abra <code>http://localhost:5517</code> para compilar e testar.</div>' : ''}
        </div>`}
      </aside>
      <div class="ws-main">
        <div class="ed-bar">
          <div class="ftabs" id="ftabs"></div>
          <div class="ed-actions">
            <button class="btn btn-ghost btn-sm" id="resetBtn" title="Voltar ao código inicial">↺</button>
            ${p.kind === 'java' || p.kind === 'spring' || p.kind === 'sql' ? '<button class="btn btn-run btn-sm" id="runBtn" title="Ctrl+\'">▶ Executar</button>' : ''}
            ${exam ? '<span class="timer" id="timer">⏱ --:--</span>' : ''}
            <button class="btn btn-primary btn-sm" id="testBtn" title="Ctrl+Enter">✔ Testar <kbd>Ctrl+Enter</kbd></button>
            ${exam ? '<button class="btn btn-deliver btn-sm" id="deliverBtn" title="Corrige e dá a nota">📤 Entregar</button>' : ''}
          </div>
        </div>
        <div class="ed-split ${isTree(p) ? 'tree' : ''}">
          ${isTree(p) ? '<nav class="explorer" id="explorer"></nav>' : ''}
          <div class="ed-host" id="edHost"></div>
        </div>
        <div class="out">
          <div class="out-tabs" id="outTabs">${outTabs.map(([k, l], i) => '<button data-o="' + k + '" class="' + (i === 0 ? 'on' : '') + '">' + l + '</button>').join('')}<span class="out-status" id="outStatus"></span></div>
          <div class="out-body">
            ${web ? '<div class="opane on" data-o="preview"><iframe id="preview" sandbox="allow-scripts allow-modals allow-forms" title="Pré-visualização"></iframe></div>' : ''}
            <div class="opane ${web ? '' : 'on'}" data-o="out"><pre class="console" id="console"><span class="muted">${p.kind === 'spring' ? 'Clique em ▶ Executar para enviar as requisições da aba 📮 Requisições à sua API.' : p.kind === 'sql' ? 'Clique em ▶ Executar para rodar seu script.' : web ? 'Mensagens de console.log aparecem aqui.' : 'Clique em ▶ Executar para rodar o main, ou ✔ Testar para corrigir.'}</span></pre></div>
            <div class="opane" data-o="tests"><div id="testList" class="testlist"><p class="muted">Clique em ✔ Testar para rodar os testes.</p></div></div>
            ${p.kind === 'java' && p.run ? '<div class="opane" data-o="stdin"><p class="muted small">Texto enviado ao <code>System.in</code> quando você clica em ▶ Executar (o teste usa entradas próprias):</p><textarea id="stdin" class="stdin" spellcheck="false">' + esc(p.run.stdin || '') + '</textarea></div>' : ''}
            ${p.kind === 'spring' ? '<div class="opane" data-o="req"><p class="muted small">Uma requisição por linha: <code>MÉTODO /url param=valor&amp;param2=valor</code>. Todas rodam na mesma aplicação (o estado é mantido).</p><textarea id="reqs" class="stdin" spellcheck="false">' + esc(p.requests || '') + '</textarea></div>' : ''}
            ${p.kind === 'sql' ? '<div class="opane" data-o="table"><div id="tableView" class="sqlres"><p class="muted">Carregando…</p></div></div>' : ''}
          </div>
        </div>
      </div>
    </section>`;

    // editor
    const ed = new Editor($app.querySelector('#edHost'), LANG[p.kind], (v) => {
      Workspace.files[Workspace.cur].code = v;
      Workspace.persist();
      if (web) livePreview();
    });
    Workspace.editor = ed;
    drawFileTabs();
    selectFile(Math.max(0, Workspace.files.findIndex((f) => !f.readonly)));

    // abas de saída
    $app.querySelector('#outTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-o]'); if (b) showOut(b.dataset.o); });

    // botões
    $app.querySelector('#back').addEventListener('click', renderHome);
    $app.querySelector('#testBtn').addEventListener('click', () => runTests(false));
    const db = $app.querySelector('#deliverBtn');
    if (db) db.addEventListener('click', () => { if (confirm('Entregar a prova? Ela será corrigida e a nota registrada.')) runTests(true); });
    const rb = $app.querySelector('#runBtn'); if (rb) rb.addEventListener('click', runCode);
    $app.querySelector('#resetBtn').addEventListener('click', () => {
      if (!confirm('Restaurar o código inicial de TODOS os arquivos desta fase? Seu código será perdido.')) return;
      localStorage.removeItem(codeKey(p.id));
      Workspace.files = Workspace.load(p);
      selectFile(Workspace.cur);
      if (web) livePreview();
    });
    const hb = $app.querySelector('#hintBtn');
    if (hb) hb.addEventListener('click', () => {
      if (Workspace.usedHint >= p.hints.length) return;
      $app.querySelector('#hints').insertAdjacentHTML('beforeend', '<div class="hint">' + fmt(p.hints[Workspace.usedHint]) + '</div>');
      Workspace.usedHint++;
      if (Workspace.usedHint >= p.hints.length) { hb.disabled = true; hb.textContent = 'Sem mais dicas'; }
      else hb.textContent = 'Mostrar dica ' + (Workspace.usedHint + 1) + ' de ' + p.hints.length;
    });
    const sb = $app.querySelector('#solBtn');
    if (sb) sb.addEventListener('click', showSolution);
    if (exam) setupExamPanel(p);

    if (web) { setupIframeListener(); livePreview(); }
    if (p.kind === 'sql') SQL.showTable(p);
    window.scrollTo(0, 0);
  }

  function isTree(p) { return p.files.some((f) => f.name.includes('/')); }
  function sortFiles(files) {
    return files.sort((a, b) => {
      const da = a.name.split('/').length, db = b.name.split('/').length;
      const pa = a.name.slice(0, a.name.lastIndexOf('/') + 1), pb = b.name.slice(0, b.name.lastIndexOf('/') + 1);
      if (pa !== pb) {
        if (pb.startsWith(pa)) return -1;  // arquivos da pasta antes das subpastas
        if (pa.startsWith(pb)) return 1;
        return pa.localeCompare(pb);
      }
      return da - db || a.name.localeCompare(b.name);
    });
  }
  const SRC_ROOT = 'src/main/java/';
  function pkgOf(path) {
    const dir = path.slice(0, path.lastIndexOf('/'));
    return dir.startsWith(SRC_ROOT.slice(0, -1)) ? dir.slice(SRC_ROOT.length).replace(/\//g, '.') : '';
  }

  function drawExplorer() {
    const ex = $app.querySelector('#explorer');
    if (!ex) return;
    // monta árvore
    const root = { dirs: {}, files: [] };
    Workspace.files.forEach((f, i) => {
      const parts = f.name.split('/');
      let node = root;
      parts.slice(0, -1).forEach((d) => { node = node.dirs[d] = node.dirs[d] || { dirs: {}, files: [] }; });
      node.files.push({ name: parts[parts.length - 1], i, f });
    });
    // compacta pastas com um único filho e sem arquivos (src/main/java/com/ime/biblioteca)
    const col = Workspace.collapsed || (Workspace.collapsed = new Set());
    function render(node, path, depth) {
      let h = '';
      Object.keys(node.dirs).sort().forEach((d) => {
        let label = d, full = path + d + '/', child = node.dirs[d];
        while (Object.keys(child.dirs).length === 1 && child.files.length === 0) {
          const k = Object.keys(child.dirs)[0];
          label += '/' + k; full += k + '/'; child = child.dirs[k];
        }
        const closed = col.has(full);
        h += '<div class="ex-dir" data-dir="' + esc(full) + '" style="padding-left:' + (6 + depth * 12) + 'px"><span class="ex-caret">' + (closed ? '▸' : '▾') + '</span> 📁 ' + esc(label) + '</div>';
        if (!closed) h += render(child, full, depth + 1);
      });
      node.files.sort((a, b) => a.name.localeCompare(b.name)).forEach(({ name, i, f }) => {
        const errs = (Workspace.errors[f.name] || []).length;
        h += '<div class="ex-file ' + (i === Workspace.cur ? 'on' : '') + '" data-f="' + i + '" style="padding-left:' + (18 + depth * 12) + 'px" title="' + esc(f.name) + '">' +
          '<span class="ex-ico">' + (f.readonly ? '🔒' : '☕') + '</span>' + esc(name) +
          (errs ? ' <b class="errn">' + errs + '</b>' : '') +
          (f.custom ? '<button class="ex-del" data-del="' + i + '" title="Apagar arquivo">🗑</button>' : '') + '</div>';
      });
      return h;
    }
    ex.innerHTML = '<div class="ex-head"><span>EXPLORADOR</span><button class="ex-new" id="exNew" title="Novo arquivo .java">＋ Arquivo</button></div><div class="ex-tree">' + render(root, '', 0) + '</div>';
    ex.querySelectorAll('.ex-dir').forEach((d) => d.addEventListener('click', () => {
      const k = d.dataset.dir; col.has(k) ? col.delete(k) : col.add(k); drawExplorer();
    }));
    ex.querySelectorAll('.ex-file').forEach((d) => d.addEventListener('click', (e) => {
      if (e.target.closest('.ex-del')) return;
      selectFile(+d.dataset.f);
    }));
    ex.querySelectorAll('.ex-del').forEach((b) => b.addEventListener('click', () => {
      const f = Workspace.files[+b.dataset.del];
      if (!confirm('Apagar ' + f.name + '?')) return;
      Workspace.files.splice(+b.dataset.del, 1);
      Workspace.persist();
      selectFile(0);
    }));
    ex.querySelector('#exNew').addEventListener('click', newFile);
  }

  function newFile() {
    const cur = Workspace.files[Workspace.cur].name;
    const dir = cur.slice(0, cur.lastIndexOf('/') + 1);
    let path = prompt('Caminho do novo arquivo (a pasta define o pacote):', dir + 'NovaClasse.java');
    if (!path) return;
    path = path.trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!/^[\w/.-]+\.java$/.test(path)) { toast('Use um caminho terminando em .java, sem espaços.'); return; }
    if (Workspace.files.some((f) => f.name === path)) { toast('Esse arquivo já existe.'); return; }
    const cls = path.slice(path.lastIndexOf('/') + 1, -5);
    if (!/^[A-Z]\w*$/.test(cls)) { toast('O nome da classe deve começar com letra maiúscula (PascalCase).'); return; }
    const pkg = pkgOf(path);
    Workspace.files.push({ name: path, custom: true, code: (pkg ? 'package ' + pkg + ';\n\n' : '') + 'public class ' + cls + ' {\n\n}\n' });
    sortFiles(Workspace.files);
    Workspace.persist();
    selectFile(Workspace.files.findIndex((f) => f.name === path));
  }

  function drawFileTabs() {
    if (isTree(Workspace.p)) {
      drawExplorer();
      const f = Workspace.files[Workspace.cur];
      const parts = f.name.split('/');
      $app.querySelector('#ftabs').innerHTML = '<div class="crumb">' + parts.map((x, i) => i === parts.length - 1 ? '<b>' + esc(x) + '</b>' : '<span>' + esc(x) + '</span>').join('<i>›</i>') +
        (pkgOf(f.name) ? '<small class="muted"> · package ' + esc(pkgOf(f.name)) + '</small>' : '') + '</div>';
      return;
    }
    const ft = $app.querySelector('#ftabs');
    ft.innerHTML = Workspace.files.map((f, i) => {
      const errs = (Workspace.errors[f.name] || []).length;
      return '<button data-f="' + i + '" class="' + (i === Workspace.cur ? 'on' : '') + '">' + (f.readonly ? '🔒 ' : '') + esc(f.name) + (errs ? ' <b class="errn">' + errs + '</b>' : '') + '</button>';
    }).join('');
    ft.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => selectFile(+b.dataset.f)));
  }
  function selectFile(i) {
    Workspace.cur = i;
    const f = Workspace.files[i];
    Workspace.editor.value = f.code;
    Workspace.editor.setReadOnly(f.readonly);
    const m = new Map();
    (Workspace.errors[f.name] || []).forEach((e) => m.set(e.line, (m.get(e.line) ? m.get(e.line) + '\n' : '') + e.msg));
    Workspace.editor.setErrors(m);
    drawFileTabs();
  }
  function showOut(k) {
    $app.querySelectorAll('#outTabs [data-o]').forEach((b) => b.classList.toggle('on', b.dataset.o === k));
    $app.querySelectorAll('.opane').forEach((x) => x.classList.toggle('on', x.dataset.o === k));
  }
  function setStatus(html) { const s = $app.querySelector('#outStatus'); if (s) s.innerHTML = html; }
  function setBusy(b) {
    Workspace.busy = b;
    ['#runBtn', '#testBtn'].forEach((sel) => { const x = $app.querySelector(sel); if (x) x.disabled = b; });
    if (b) setStatus('<span class="spin"></span> rodando…');
  }

  /* ---------------- Java: executar e testar ---------------- */
  function filesMap() { const o = {}; Workspace.files.forEach((f) => { o[f.name] = f.code; }); return o; }

  function showCompileErrors(errors) {
    Workspace.errors = {};
    errors.forEach((e) => { (Workspace.errors[e.file] = Workspace.errors[e.file] || []).push(e); });
    selectFile(Workspace.cur);
    const con = $app.querySelector('#console');
    con.innerHTML = '<span class="c-err">✘ Erro de compilação (' + errors.length + ')</span>\n\n' + errors.map((e, i) =>
      '<a class="c-loc" data-i="' + i + '">' + esc(e.file === 'Teste.java' ? 'Teste (oculto)' : e.file) + ':' + e.line + '</a>  ' + esc(e.msg)).join('\n\n') +
      (errors.some((e) => e.file === 'Teste.java') ? '\n\n<span class="c-warn">⚠ O código de teste não compilou: verifique se as classes/métodos têm exatamente os nomes e tipos pedidos.</span>' : '');
    con.querySelectorAll('.c-loc').forEach((a) => a.addEventListener('click', () => {
      const e = errors[+a.dataset.i];
      const fi = Workspace.files.findIndex((f) => f.name === e.file);
      if (fi >= 0) { selectFile(fi); Workspace.editor.goto(e.line); }
    }));
    showOut('out');
    setStatus('<span class="bad">erro de compilação</span>');
  }
  function clearErrors() { Workspace.errors = {}; selectFile(Workspace.cur); }

  function requireServer() {
    if (Server.online) return true;
    const con = $app.querySelector('#console');
    con.innerHTML = '<span class="c-err">O servidor Java não está rodando.</span>\n\nAbra um terminal na pasta da plataforma e execute:\n\n    java JavaQuest.java\n\nDepois acesse http://localhost:5517';
    showOut('out');
    return false;
  }

  async function runCode() {
    const p = Workspace.p;
    if (Workspace.busy) return;
    if (p.kind === 'sql') return SQL.run(p, false);
    if (!requireServer()) return;
    setBusy(true);
    const con = $app.querySelector('#console');
    try {
      let payload;
      if (p.kind === 'spring') {
        const reqs = ($app.querySelector('#reqs').value || '').split('\n').filter((l) => l.trim());
        // as requisições vão pela entrada padrão: no Windows, aspas dentro de argumentos são removidas
        payload = { files: filesMap(), main: 'SpringConsole', args: [], stdin: reqs.join('\n') + '\n' };
      } else {
        payload = { files: filesMap(), main: p.run.main, stdin: ($app.querySelector('#stdin') || {}).value || '', extraFiles: p.extraFiles || {} };
      }
      const r = await Server.run(payload);
      if (r.error) throw new Error(r.error);
      if (r.stage === 'compile') { showCompileErrors(r.errors); return; }
      clearErrors();
      let out = '';
      out += r.stdout ? esc(r.stdout) : '<span class="muted">(o programa não imprimiu nada)</span>';
      if (r.stderr) out += '\n<span class="c-err">' + esc(r.stderr) + '</span>';
      if (r.timeout) out += '\n<span class="c-err">⏱ Tempo esgotado (10 s): laço infinito ou esperando entrada que não existe?</span>';
      out += '\n\n<span class="muted">— fim da execução (' + r.ms + ' ms, código de saída ' + r.exitCode + ')</span>';
      con.innerHTML = out;
      showOut('out');
      setStatus(r.exitCode === 0 && !r.timeout ? '<span class="ok">executou</span>' : '<span class="bad">terminou com erro</span>');
    } catch (e) {
      con.innerHTML = '<span class="c-err">Falha ao falar com o servidor: ' + esc(e.message) + '</span>';
      showOut('out');
      setStatus('');
    } finally { setBusy(false); }
  }

  async function runTests(deliver) {
    const p = Workspace.p;
    if (Workspace.busy) return;
    Workspace.deliver = !!deliver && !!p.exam;
    if (['html', 'css', 'js'].includes(p.kind)) return runWebTests();
    if (p.kind === 'sql') return SQL.run(p, true);
    if (!requireServer()) return;
    setBusy(true);
    const tl = $app.querySelector('#testList');
    try {
      const files = filesMap();
      files['Teste.java'] = 'public class Teste {\n    public static void main(String[] args) throws Throwable {\n' + p.test + '\n        QT.end();\n    }\n}\n';
      const r = await Server.run({ files, main: 'Teste', stdin: '', extraFiles: p.extraFiles || {} });
      if (r.error) throw new Error(r.error);
      if (r.stage === 'compile') {
        showCompileErrors(r.errors);
        tl.innerHTML = '<p class="c-err">O código não compila — veja a aba 🖥 Saída.</p>';
        if (Workspace.deliver) finishExam(p, null);
        return;
      }
      clearErrors();
      const results = [];
      const other = [];
      let ended = false;
      (r.stdout || '').split('\n').forEach((l) => {
        if (l.startsWith('@@QT|PASS|')) results.push({ ok: true, name: l.slice(10) });
        else if (l.startsWith('@@QT|FAIL|')) { const parts = l.slice(10).split('|'); results.push({ ok: false, name: parts[0], msg: parts.slice(1).join('|').replace(/⏎/g, '\n') }); }
        else if (l.startsWith('@@QT|END')) ended = true;
        else if (l.trim()) other.push(l);
      });
      const con = $app.querySelector('#console');
      con.innerHTML = (other.length ? '<span class="muted">Saída impressa pelo seu código durante os testes:</span>\n' + esc(other.join('\n')) : '<span class="muted">(nenhuma saída extra)</span>') +
        (r.stderr ? '\n<span class="c-err">' + esc(r.stderr) + '</span>' : '');
      if (!ended) {
        results.push({ ok: false, name: 'Execução completa', msg: r.timeout ? 'Tempo esgotado (10 s): seu código entrou em laço infinito ou está muito lento.' : 'O programa terminou antes do fim dos testes (System.exit? erro grave?). Veja a aba Saída.' });
      }
      showTestResults(results);
    } catch (e) {
      tl.innerHTML = '<p class="c-err">Falha ao falar com o servidor: ' + esc(e.message) + '</p>';
      showOut('tests'); setStatus('');
    } finally { setBusy(false); }
  }

  function showTestResults(results) {
    const tl = $app.querySelector('#testList');
    const n = results.filter((x) => x.ok).length, total = results.length;
    const all = total > 0 && n === total;
    tl.innerHTML = '<div class="tl-head ' + (all ? 'ok' : '') + '"><b>' + n + '/' + total + '</b> testes passando<div class="tl-bar"><i style="width:' + (total ? (n / total) * 100 : 0) + '%"></i></div></div>' +
      results.map((x) => '<div class="tr ' + (x.ok ? 'ok' : 'bad') + '"><i>' + (x.ok ? '✔' : '✘') + '</i><div><b>' + esc(x.name) + '</b>' + (x.msg ? '<pre>' + esc(x.msg) + '</pre>' : '') + '</div></div>').join('');
    showOut('tests');
    setStatus(all ? '<span class="ok">✔ todos os testes passaram</span>' : '<span class="bad">' + (total - n) + ' falhando</span>');
    if (Workspace.p.exam) {
      const sc = scoreExam(Workspace.p, results);
      tl.insertAdjacentHTML('afterbegin', scoreHtml(Workspace.p, sc, Workspace.deliver));
      if (Workspace.deliver) finishExam(Workspace.p, sc);
      return;
    }
    if (all) phaseCleared();
  }

  /* =========================================================
     SIMULADOS DE PROVA
     ========================================================= */
  const fmtNota = (n) => n.toFixed(1).replace('.', ',');
  const notaClass = (n) => (n >= 7 ? 'n-ok' : n >= 5 ? 'n-mid' : 'n-bad');
  function examState(id) { S.exams = S.exams || {}; return (S.exams[id] = S.exams[id] || {}); }

  function startExamAttempt(p) {
    const e = examState(p.id);
    if (!e.start || e.delivered) {
      e.start = Date.now(); e.delivered = false; e.autoDelivered = false;
      save();
    }
  }

  function examPanelHtml(p) {
    const x = p.exam;
    const e = examState(p.id);
    const total = x.itens.reduce((a, i) => a + i.pts, 0);
    return `<div class="ws-scroll prova">
      <div class="prova-head">
        <div><b>Laboratório de Programação — Simulado</b><small>Treino no formato da P1 · Java</small></div>
        <div class="prova-meta"><span>Duração: <b>${x.duracao} min</b></span><span>Valor: <b>${fmtNota(total)}</b></span><span>Consulta: <b>restrita</b> <small class="muted">(aqui a cola está liberada para treino)</small></span></div>
      </div>
      <div class="prova-txt">${fmt(x.cenario)}</div>
      <h3>Atributos obrigatórios da classe <code>${esc(x.classe)}</code></h3>
      <table class="attrs"><tr><th>Atributo</th><th>Tipo</th><th>Descrição</th><th>Exemplo</th></tr>
        ${x.attrs.map((a) => '<tr><td><code>' + esc(a[0]) + '</code></td><td><code>' + esc(a[1]) + '</code></td><td>' + esc(a[2]) + '</td><td><code>' + esc(a[3]) + '</code></td></tr>').join('')}
      </table>
      ${x.obs ? '<p class="small">' + fmt(x.obs) + '</p>' : ''}
      <h3>Fonte de dados</h3>
      <p class="small">${fmt(x.dados)}</p>
      <h3>Questões</h3>
      <p class="small muted">Complete os arquivos do editor. As partes já prontas (como <code>/health</code>) servem de exemplo.</p>
      ${x.itens.map((i) => '<div class="q-item" data-item="' + i.id + '"><span class="q-badge">' + i.id + ') <small>' + fmtNota(i.pts) + ' pt</small></span><div>' + fmt(i.txt) + '</div><span class="q-score"></span></div>').join('')}
      <h3>Exemplo de uso</h3>
      <pre class="code ex-uso">${esc(x.exemplo)}</pre>
      <div class="prova-foot">
        ${e.best != null ? '<span>Melhor nota: <b class="' + notaClass(e.best) + '">' + fmtNota(e.best) + '</b> · tentativas: ' + (e.tries || 0) + '</span>' : '<span class="muted">Nenhuma entrega ainda.</span>'}
        <div>
          <button class="btn btn-ghost btn-sm" id="gabBtn" ${e.tries ? '' : 'disabled title="Disponível depois da primeira entrega"'}>📋 Gabarito</button>
          <button class="btn btn-ghost btn-sm" id="restartBtn">↺ Recomeçar prova</button>
        </div>
      </div>
    </div>`;
  }

  function setupExamPanel(p) {
    const e = examState(p.id);
    const gb = $app.querySelector('#gabBtn');
    gb.addEventListener('click', () => { Workspace.sawSolution = true; showSolution(true); });
    $app.querySelector('#restartBtn').addEventListener('click', () => {
      if (!confirm('Recomeçar a prova? O cronômetro volta para ' + p.exam.duracao + ':00 e o código volta ao inicial.')) return;
      localStorage.removeItem(codeKey(p.id));
      e.start = null; save();
      openPhase(p.id);
    });
    const tick = () => {
      const el = $app.querySelector('#timer');
      if (!el) return;
      const st = examState(p.id);
      if (st.delivered) { el.textContent = '✔ entregue'; el.className = 'timer done'; return; }
      const left = p.exam.duracao * 60 * 1000 - (Date.now() - st.start);
      const abs = Math.abs(left);
      const mm = Math.floor(abs / 60000), ss = Math.floor((abs % 60000) / 1000);
      el.textContent = (left < 0 ? '⏱ +' : '⏱ ') + mm + ':' + String(ss).padStart(2, '0');
      el.className = 'timer' + (left < 0 ? ' over' : left < 5 * 60 * 1000 ? ' warn' : '');
      if (left <= 0 && !st.autoDelivered && !Workspace.busy) {
        st.autoDelivered = true; save();
        toast('⏰ Tempo esgotado! Entregando a prova…', 3500);
        runTests(true);
      }
    };
    tick();
    Workspace.timer = setInterval(tick, 1000);
  }

  function scoreExam(p, results) {
    const itens = p.exam.itens.map((i) => {
      const ts = results.filter((r) => r.name.startsWith('[' + i.id + ']'));
      const ok = ts.length > 0 && ts.every((r) => r.ok);
      const passed = ts.filter((r) => r.ok).length;
      return { id: i.id, pts: i.pts, got: ok ? i.pts : 0, passed, total: ts.length };
    });
    const broken = results.some((r) => r.name === 'Execução completa' && !r.ok);
    const nota = broken ? itens.reduce((a, i) => a + i.got, 0) : itens.reduce((a, i) => a + i.got, 0);
    return { itens, nota: Math.round(nota * 10) / 10 };
  }

  function scoreHtml(p, sc, final) {
    // marca os itens no enunciado
    sc.itens.forEach((i) => {
      const el = $app.querySelector('.q-item[data-item="' + i.id + '"] .q-score');
      if (el) { el.textContent = fmtNota(i.got) + '/' + fmtNota(i.pts); el.className = 'q-score ' + (i.got ? 'ok' : 'bad'); }
    });
    return `<div class="score ${final ? 'final' : ''}">
      <div class="score-nota"><small>${final ? 'Nota da entrega' : 'Nota parcial (se entregasse agora)'}</small><b class="${notaClass(sc.nota)}">${fmtNota(sc.nota)}</b><small>de 10,0</small></div>
      <table class="score-tab"><tr><th>Item</th><th>Testes</th><th>Pontos</th></tr>
        ${sc.itens.map((i) => '<tr class="' + (i.got ? 'ok' : 'bad') + '"><td>' + i.id + ')</td><td>' + i.passed + '/' + i.total + '</td><td>' + fmtNota(i.got) + ' / ' + fmtNota(i.pts) + '</td></tr>').join('')}
      </table>
      ${final ? '<div class="score-msg">' + (sc.nota >= 10 ? '🏆 Gabaritou!' : sc.nota >= 7 ? '👏 Aprovado no simulado.' : 'Revise os itens em vermelho, veja o gabarito e tente de novo.') + '<br><small class="muted">O gabarito foi liberado no painel da esquerda.</small></div>' : ''}
    </div>`;
  }

  function finishExam(p, sc) {
    const e = examState(p.id);
    const nota = sc ? sc.nota : 0;
    const usedMin = Math.round((Date.now() - e.start) / 60000);
    e.delivered = true;
    e.tries = (e.tries || 0) + 1;
    e.last = nota;
    e.best = Math.max(e.best == null ? 0 : e.best, nota);
    e.history = (e.history || []).concat([{ nota, min: usedMin, em: new Date().toISOString().slice(0, 16) }]).slice(-10);
    save();
    if (!sc) {
      $app.querySelector('#testList').insertAdjacentHTML('afterbegin', '<div class="score final"><div class="score-nota"><small>Nota da entrega</small><b class="n-bad">0,0</b><small>de 10,0</small></div><div class="score-msg">O código entregue <b>não compila</b>, então nenhum item pôde ser corrigido. Na prova em papel o professor ainda poderia dar pontos parciais — mas aqui vale a regra do compilador! 🙂</div></div>');
    }
    const gb = $app.querySelector('#gabBtn');
    if (gb) { gb.disabled = false; gb.title = ''; }
    const foot = $app.querySelector('.prova-foot > span');
    if (foot) foot.innerHTML = 'Melhor nota: <b class="' + notaClass(e.best) + '">' + fmtNota(e.best) + '</b> · tentativas: ' + e.tries;
    toast('📤 Prova entregue: nota ' + fmtNota(nota) + (usedMin ? ' em ' + usedMin + ' min' : ''), 4000);
    if (nota >= 10) confetti();
    Workspace.deliver = false;
  }

  /* ---------------- conclusão de fase ---------------- */
  function phaseCleared() {
    const p = Workspace.p;
    const prev = S.phases[p.id];
    const stars = Workspace.sawSolution ? 1 : Workspace.usedHint > 0 ? 2 : 3;
    const first = !prev || !prev.done;
    let gain = 0;
    if (first) gain = 30 + p.level * 20 + (stars - 1) * 15;
    else if (stars > (prev.stars || 0)) gain = (stars - prev.stars) * 15;
    S.xp += gain;
    S.phases[p.id] = { done: true, stars: Math.max(stars, prev && prev.stars || 0) };
    save(); renderTopStats();
    const nx = nextOf(p);
    const tl = $app.querySelector('#testList');
    tl.insertAdjacentHTML('afterbegin', `<div class="win">
      <div class="win-stars">${[1, 2, 3].map((i) => '<i class="' + (i <= stars ? 'on' : '') + '">★</i>').join('')}</div>
      <div><b>Fase concluída!</b> ${gain ? '+' + gain + ' XP' : ''}<br><small class="muted">${stars === 3 ? 'Sem dicas — perfeito!' : stars === 2 ? 'Com dicas. Refaça sem dicas para 3 estrelas.' : 'Com a solução. Tente refazer sozinho depois!'}</small></div>
      ${nx ? '<button class="btn btn-primary" id="nextBtn">Próxima: ' + esc(nx.title) + ' →</button>' : '<button class="btn btn-primary" id="nextBtn">Voltar ao mapa →</button>'}
    </div>`);
    tl.querySelector('#nextBtn').addEventListener('click', () => nx ? openPhase(nx.id) : renderHome());
    if (first) confetti();
  }

  function showSolution(isGabarito) {
    const p = Workspace.p;
    if (isGabarito !== true && !confirm('Ver a solução? Se você concluir a fase depois disso, ganha só 1 estrela.\n\nA solução abre numa janela separada; seu código não é alterado.')) return;
    Workspace.sawSolution = true;
    const lang = LANG[p.kind];
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="modal-card"><div class="modal-head"><b>👀 Solução de referência — ' + esc(p.title) + '</b><span><button class="btn btn-ghost btn-sm" id="useSol">Copiar para o editor</button> <button class="icon-btn" id="closeSol">✕</button></span></div><div class="modal-body">' +
      p.solution.map((f) => '<h4>' + esc(f.name) + '</h4><pre class="code"><code>' + highlight(f.code, lang) + '</code></pre>').join('') + '</div></div>';
    document.body.appendChild(m);
    const close = () => m.remove();
    m.addEventListener('click', (e) => { if (e.target === m) close(); });
    m.querySelector('#closeSol').addEventListener('click', close);
    m.querySelector('#useSol').addEventListener('click', () => {
      if (!confirm('Substituir o seu código pela solução?')) return;
      p.solution.forEach((sf) => { const f = Workspace.files.find((x) => x.name === sf.name); if (f && !f.readonly) f.code = sf.code; else if (!f) Workspace.files.push({ name: sf.name, code: sf.code, custom: true }); }); sortFiles(Workspace.files);
      Workspace.persist(); selectFile(Workspace.cur);
      if (['html', 'css', 'js'].includes(p.kind)) livePreview();
      close();
    });
  }

  /* ---------------- HTML/CSS/JS no iframe ---------------- */
  function buildDoc(p, src, tests, runId) {
    const bridge = '<script>(function(){var send=function(t,a){try{parent.postMessage({__jq:"' + runId + '",type:t,text:Array.prototype.map.call(a,function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(" ")},"*")}catch(e){}};' +
      '["log","info","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){send(k,arguments);o.apply(console,arguments)}});' +
      'window.addEventListener("error",function(e){send("error",[e.message+(e.lineno?" (linha "+e.lineno+")":"")])});' +
      'document.addEventListener("submit",function(e){if(!e.defaultPrevented){e.preventDefault();send("info",["(formulário enviado para "+(e.target.getAttribute("action")||"?")+" — bloqueado na pré-visualização)"])}});})();<\/script>';
    const runner = tests ? '<script>(function(){var T=[' + tests.map((t) => '(' + t.t.toString() + ')').join(',') + '];function go(){var r=T.map(function(f){try{return{ok:!!f()}}catch(e){return{ok:false,err:String(e&&e.message||e)}}});parent.postMessage({__jq:"' + runId + '",type:"tests",r:r},"*")}if(document.readyState==="complete")setTimeout(go,40);else window.addEventListener("load",function(){setTimeout(go,40)})})();<\/script>' : '';
    if (p.kind === 'html') {
      const d = /<head[^>]*>/i.test(src) ? src.replace(/<head[^>]*>/i, (m) => m + bridge) : bridge + src;
      return d + runner;
    }
    if (p.kind === 'css') {
      return '<!DOCTYPE html><html><head><meta charset="UTF-8">' + bridge + '<style>body{font-family:system-ui,sans-serif;padding:8px}</style><style>' + src.replace(/<\/style/gi, '') + '</style></head><body>' + p.html + runner + '</body></html>';
    }
    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' + bridge + '<style>body{font-family:system-ui,sans-serif;padding:8px}</style></head><body>' + (p.html || '') +
      '<script>' + src.replace(/<\/script/gi, '<\\/script') + '\n<\/script>' + runner + '</body></html>';
  }
  function setupIframeListener() {
    Workspace.msgListener = (e) => {
      const d = e.data;
      if (!d || d.__jq !== Workspace.runId) return;
      const con = $app.querySelector('#console');
      if (!con) return;
      if (d.type === 'tests') {
        const p = Workspace.p;
        showTestResults(p.tests.map((t, i) => ({ ok: d.r[i].ok, name: t.d, msg: d.r[i].err ? 'Erro: ' + d.r[i].err : '' })));
        setBusy(false);
        return;
      }
      if (con.querySelector('.muted.placeholder')) con.innerHTML = '';
      con.insertAdjacentHTML('beforeend', '<span class="c-' + d.type + '">' + (d.type === 'error' ? '✘ ' : d.type === 'warn' ? '⚠ ' : '') + esc(d.text) + '</span>\n');
    };
    window.addEventListener('message', Workspace.msgListener);
  }
  function webSource() {
    const p = Workspace.p;
    return Workspace.files[0].code;
    // (fases web têm um arquivo só)
  }
  const livePreview = debounce(() => renderIframe(false), 350);
  function renderIframe(withTests) {
    const p = Workspace.p;
    if (!p) return;
    Workspace.runId = 'r' + Math.random().toString(36).slice(2);
    const con = $app.querySelector('#console');
    if (con) con.innerHTML = '<span class="muted placeholder">Mensagens de console.log aparecem aqui.</span>';
    $app.querySelector('#preview').srcdoc = buildDoc(p, webSource(), withTests ? p.tests : null, Workspace.runId);
  }
  function runWebTests() {
    setBusy(true);
    renderIframe(true);
    setTimeout(() => { if (Workspace.busy) { setBusy(false); setStatus('<span class="bad">os testes não responderam</span>'); } }, 6000);
  }

  /* ---------------- SQL (sql.js) ---------------- */
  const SQL = {
    lib: null,
    async load() {
      if (this.lib) return this.lib;
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
        s.onload = res; s.onerror = () => rej(new Error('Não foi possível baixar o sql.js (precisa de internet).'));
        document.head.appendChild(s);
      });
      this.lib = await window.initSqlJs({ locateFile: (f) => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + f });
      return this.lib;
    },
    table(res) {
      if (!res) return '<p class="muted">(sem resultado)</p>';
      return '<table><tr>' + res.columns.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr>' +
        res.values.map((r) => '<tr>' + r.map((v) => '<td>' + (v === null ? '<i>NULL</i>' : esc(String(v))) + '</td>').join('') + '</tr>').join('') + '</table>' +
        '<small class="muted">' + res.values.length + ' linha(s)</small>';
    },
    async showTable(p) {
      const tv = $app.querySelector('#tableView');
      try {
        const lib = await this.load();
        const db = new lib.Database(); db.run(p.setup);
        tv.innerHTML = '<p class="muted small">Estado inicial da tabela <code>users</code> (antes do seu script):</p>' + this.table(db.exec('SELECT * FROM users')[0]);
        db.close();
      } catch (e) { tv.innerHTML = '<p class="c-err">' + esc(e.message) + '</p>'; }
    },
    async run(p, withTests) {
      setBusy(true);
      const con = $app.querySelector('#console');
      try {
        const lib = await this.load();
        const db = new lib.Database();
        db.run(p.setup);
        const script = Workspace.files[0].code;
        let results;
        try { results = db.exec(script); }
        catch (e) {
          con.innerHTML = '<span class="c-err">✘ Erro de SQL: ' + esc(e.message) + '</span>';
          showOut('out'); setStatus('<span class="bad">erro de SQL</span>');
          if (withTests) showTestResults(p.tests.map((t) => ({ ok: false, name: t.d, msg: 'O script tem erro de SQL.' })));
          return;
        }
        const last = results.length ? results[results.length - 1] : null;
        con.innerHTML = '';
        con.insertAdjacentHTML('beforeend', '<div class="sqlres">' + (results.length ? results.map((r, i) => '<div><small class="muted">Resultado ' + (i + 1) + '</small>' + this.table(r) + '</div>').join('') : '<p class="muted">Script executado. Nenhum SELECT retornou linhas.</p>') +
          '<div><small class="muted">Tabela users depois do script</small>' + this.table(db.exec('SELECT * FROM users')[0]) + '</div></div>');
        if (withTests) {
          const q = (sql) => { const r = db.exec(sql); return r.length ? r[0].values : []; };
          showTestResults(p.tests.map((t) => { try { return { ok: !!t.t(q, last), name: t.d }; } catch (e) { return { ok: false, name: t.d, msg: String(e.message) }; } }));
        } else { showOut('out'); setStatus('<span class="ok">executou</span>'); }
        db.close();
      } catch (e) {
        con.innerHTML = '<span class="c-err">' + esc(e.message) + '</span>'; showOut('out');
      } finally { setBusy(false); }
    },
  };

  /* =========================================================
     COLA (gaveta retrátil)
     ========================================================= */
  const Cola = {
    el: document.getElementById('cola'),
    body: document.getElementById('colaBody'),
    search: document.getElementById('colaSearch'),
    group: 'all', ctx: null, isOpen: false,
    GROUPS: [['ctx', '⭐ Desta fase'], ['all', 'Tudo'], ['java', 'Java'], ['web', 'Spring/BD'], ['front', 'HTML/CSS/JS']],
    init() {
      document.getElementById('colaChips').innerHTML = this.GROUPS.map(([k, l]) => '<button data-g="' + k + '" class="chip">' + l + '</button>').join('');
      document.getElementById('colaChips').addEventListener('click', (e) => {
        const b = e.target.closest('[data-g]'); if (!b) return;
        this.group = b.dataset.g; this.syncChips(); this.render();
      });
      document.getElementById('colaHandle').addEventListener('click', () => this.toggle());
      document.getElementById('colaClose').addEventListener('click', () => this.close());
      document.getElementById('btnCola').addEventListener('click', () => this.toggle());
      this.search.addEventListener('input', () => this.render());
      this.body.addEventListener('click', (e) => {
        const b = e.target.closest('.copy'); if (!b) return;
        const code = b.parentElement.querySelector('code').innerText;
        (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast('📋 Copiado!'), () => toast('Não foi possível copiar'));
      });
      this.syncChips(); this.render();
    },
    syncChips() {
      document.querySelectorAll('#colaChips .chip').forEach((c) => {
        c.classList.toggle('on', c.dataset.g === this.group);
        if (c.dataset.g === 'ctx') c.style.display = this.ctx ? '' : 'none';
      });
    },
    setContext(ids) {
      this.ctx = ids && ids.length ? ids : null;
      this.group = this.ctx ? 'ctx' : 'all';
      this.search.value = '';
      this.syncChips(); this.render();
    },
    open() { this.isOpen = true; this.el.classList.add('open'); this.el.setAttribute('aria-hidden', 'false'); document.body.classList.add('cola-open'); },
    close() { this.isOpen = false; this.el.classList.remove('open'); this.el.setAttribute('aria-hidden', 'true'); document.body.classList.remove('cola-open'); },
    toggle() { this.isOpen ? this.close() : this.open(); },
    render() {
      const term = this.search.value.trim().toLowerCase();
      const defLang = (sec) => ({ html: 'html', css: 'css', js: 'js', sql: 'sql' }[sec.id] || 'java');
      let secs = COLA.slice();
      if (this.group === 'ctx' && this.ctx && !term) secs = this.ctx.map((id) => COLA.find((s) => s.id === id)).filter(Boolean);
      else if (['java', 'web', 'front'].includes(this.group)) secs = secs.filter((s) => s.group === this.group);
      let html = '';
      secs.forEach((sec) => {
        const items = sec.items.filter((it) => !term || (sec.title + ' ' + it.t + ' ' + (it.d || '') + ' ' + (it.c || '')).toLowerCase().includes(term));
        if (!items.length) return;
        const rel = this.ctx && this.ctx.includes(sec.id);
        const open = term || this.group === 'ctx' || rel;
        html += '<details class="csec" ' + (open ? 'open' : '') + '><summary>' + esc(sec.title) + (rel ? ' <span class="star">⭐</span>' : '') + '<small>' + items.length + '</small></summary>';
        items.forEach((it) => {
          html += '<div class="citem"><h4>' + esc(it.t) + '</h4>' + (it.d ? '<p>' + fmt(it.d) + '</p>' : '') +
            (it.c ? '<div class="cwrap"><button class="copy" title="Copiar">⧉</button><pre class="code"><code>' + markTerm(highlight(it.c, it.lang || defLang(sec)), term) + '</code></pre></div>' : '') + '</div>';
        });
        html += '</details>';
      });
      this.body.innerHTML = html || '<p class="muted center">Nada encontrado para "' + esc(term) + '".</p>';
    },
  };
  function markTerm(html, term) {
    if (!term || term.length < 2) return html;
    const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return html.replace(/(^|>)([^<]+)/g, (m, a, txt) => a + txt.replace(re, '<mark>$1</mark>'));
  }

  /* ---------------- confete ---------------- */
  function confetti() {
    const c = document.createElement('div'); c.className = 'confetti';
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = ['#f89820', '#5b9bd5', '#22c55e', '#eab308', '#ec4899'][i % 5];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      c.appendChild(s);
    }
    document.body.appendChild(c); setTimeout(() => c.remove(), 3500);
  }

  /* ---------------- atalhos ---------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const m = document.querySelector('.modal'); if (m) { m.remove(); return; }
      if (Cola.isOpen) { Cola.close(); return; }
    }
    if (e.altKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); Cola.toggle(); return; }
    if (!Workspace.p) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runTests(false); }
    else if ((e.ctrlKey || e.metaKey) && e.key === "'") { e.preventDefault(); runCode(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); toast('💾 Seu código é salvo automaticamente neste navegador.'); }
  });

  document.getElementById('btnHome').addEventListener('click', renderHome);

  Cola.init();
  Server.check().then(renderHome);
})();
