/* Realce de sintaxe minimalista (Java, JS, SQL, CSS, HTML, shell) */
(function () {
  const KW = {
    java: 'abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void while var true false',
    js: 'var let const function return if else for while do switch case break default new typeof instanceof this null undefined true false in of class extends try catch finally throw',
    sql: 'SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE AND OR NOT NULL ORDER BY GROUP LIMIT PRIMARY KEY INT VARCHAR true false',
    css: '',
    sh: '',
    kts: 'plugins repositories dependencies implementation java',
  };
  const sets = {};
  for (const k in KW) sets[k] = new Set(KW[k].split(/\s+/).filter(Boolean));

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function span(cls, s) { return '<span class="tk-' + cls + '">' + esc(s) + '</span>'; }

  function hlGeneric(code, lang) {
    const kw = sets[lang] || sets.java;
    const re = lang === 'sql'
      ? /(\/\*[\s\S]*?\*\/|--[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|___)/g
      : /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|@[A-Za-z]+|\b\d+(?:\.\d+)?[fFdDL]?\b|\b[A-Za-z_$][\w$]*\b|___)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      if (t === '___') out += '___';
      else if (t.startsWith('/*') || t.startsWith('//')) out += span('com', t);
      else if (t.startsWith('--')) out += lang === 'sql' ? span('com', t) : esc(t);
      else if (t[0] === '"' || t[0] === "'") out += span('str', t);
      else if (t[0] === '@') out += span('ann', t);
      else if (/^\d/.test(t)) out += span('num', t);
      else if (kw.has(lang === 'sql' ? t.toUpperCase() : t) && (lang !== 'sql' || t === t.toUpperCase())) out += span('kw', t);
      else if (/^[A-Z]/.test(t) && lang !== 'sql') out += span('type', t);
      else if (code[re.lastIndex] === '(') out += span('fn', t);
      else out += esc(t);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function hlCss(code) {
    const re = /(\/\*[\s\S]*?\*\/|"[^"\n]*"|'[^'\n]*'|#[0-9a-fA-F]{3,8}\b|-?\d+(?:\.\d+)?(?:px|em|rem|%|vw|vh|pt|s|ms)?|[\w-]+(?=\s*:[^{};]*;)|@media|!important|___)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      if (t === '___') out += '___';
      else if (t.startsWith('/*')) out += span('com', t);
      else if (t[0] === '"' || t[0] === "'") out += span('str', t);
      else if (t[0] === '#' || /^-?\d/.test(t)) out += span('num', t);
      else if (t === '@media' || t === '!important') out += span('kw', t);
      else out += span('prop', t);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function hlHtml(code) {
    const re = /(<!--[\s\S]*?-->|<\/?[a-zA-Z][\w-]*|\/?>|[\w-]+(?==)|"[^"]*"|'[^']*'|<!DOCTYPE[^>]*>|___)/gi;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      if (t === '___') out += '___';
      else if (t.startsWith('<!--')) out += span('com', t);
      else if (/^<!DOCTYPE/i.test(t)) out += span('kw', t);
      else if (t[0] === '<' || t === '>' || t === '/>') out += span('tag', t);
      else if (t[0] === '"' || t[0] === "'") out += span('str', t);
      else out += span('attr', t);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  window.highlight = function (code, lang) {
    lang = lang || 'java';
    if (lang === 'html') return hlHtml(code);
    if (lang === 'css') return hlCss(code);
    if (lang === 'sh' || lang === 'txt') return esc(code);
    return hlGeneric(code, lang);
  };
  window.escapeHtml = esc;
})();
