// ═══════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════

/**
 * Couleurs des graphiques — initialisées depuis les variables CSS dans DOMContentLoaded.
 * Centralise la source de vérité : plus de valeurs dupliquées dans tout le fichier.
 */
const CHART_COLORS = {
  grid:  '#1a2235',  // var(--bg3)   — valeur par défaut avant lecture CSS
  ticks: '#6b7a99',  // var(--muted) — valeur par défaut avant lecture CSS
};

/** Pick a random element from array */
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/** Shuffle a copy of an array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n distinct elements from array */
function pickN(arr, n) {
  const copy = [...arr];
  const result = [];
  while (result.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(i, 1)[0]);
  }
  return result;
}

/** Pick 2 distinct elements */
const pickTwo = arr => pickN(shuffle(arr), 2);

/** GCD */
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/** Render a fraction as LaTeX, simplified */
function latexFrac(num, den) {
  if (den === 0) return '\\text{ind.}';
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), Math.abs(den));
  const n = num / g, d = den / g;
  if (d === 1) return String(n);
  return `\\dfrac{${n}}{${d}}`;
}

/** Format number for LaTeX (integer or decimal) */
function lx(v) {
  if (Number.isInteger(v)) return String(v);
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9) return latexFrac(n, d);
  }
  return v.toFixed(3);
}

/** Format for display (not LaTeX) */
function fmt(v) {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2).replace(/\.?0+$/, '');
}

function linspace(a, b, n) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(a + (b - a) * i / (n - 1));
  return arr;
}

/**
 * Build options array: ensure all 4 are distinct strings.
 * correct: the correct answer string
 * wrongPool: array of candidate wrong answers (may have duplicates or overlap with correct)
 * Returns shuffled array of 4 distinct strings with correct somewhere inside.
 */
function buildOptions(correct, wrongPool) {
  // Remove any wrong that equals correct
  const filtered = wrongPool.filter(w => w !== correct);
  // Deduplicate wrong answers
  const unique = [...new Set(filtered)];
  // Pick up to 3
  const chosen = pickN(unique, Math.min(3, unique.length));
  // Combine and shuffle
  const all = shuffle([correct, ...chosen]);
  return all;
}

// ═══════════════════════════════════════════════════
// FUNCTION DEFINITIONS
// ═══════════════════════════════════════════════════
const FUNCS = {
  square: {
    label: 'Fonction carré',
    exprTex: 'f(x) = x^2',
    color: '#f7c948',
    domain: '\\mathbb{R}',
    image: '[0\\,;\\,+\\infty[',
    parity: 'Paire',
    zeros: '0',
    fn: x => x * x,
    xRange: [-3.5, 3.5],
    yRange: [-0.5, 9],
    icon: 'x²',
    iconBg: 'rgba(247,201,72,.15)',
    iconColor: '#f7c948',
  },
  inverse: {
    label: 'Fonction inverse',
    exprTex: 'f(x) = \\dfrac{1}{x}',
    color: '#e05a5a',
    domain: '\\mathbb{R} \\setminus \\{0\\}',
    image: '\\mathbb{R} \\setminus \\{0\\}',
    parity: 'Impaire',
    zeros: 'Aucun',
    fn: x => x !== 0 ? 1 / x : null,
    xRange: [-4, 4],
    yRange: [-5, 5],
    icon: '1/x',
    iconBg: 'rgba(224,90,90,.15)',
    iconColor: '#e05a5a',
  },
  sqrt: {
    label: 'Fonction racine carrée',
    exprTex: 'f(x) = \\sqrt{x}',
    color: '#5ab8e0',
    domain: '[0\\,;\\,+\\infty[',
    image: '[0\\,;\\,+\\infty[',
    parity: 'Ni paire ni impaire',
    zeros: '0',
    fn: x => x >= 0 ? Math.sqrt(x) : null,
    xRange: [-0.5, 6],
    yRange: [-0.3, 3],
    icon: '√x',
    iconBg: 'rgba(90,184,224,.15)',
    iconColor: '#5ab8e0',
  },
  cube: {
    label: 'Fonction cube',
    exprTex: 'f(x) = x^3',
    color: '#6be05a',
    domain: '\\mathbb{R}',
    image: '\\mathbb{R}',
    parity: 'Impaire',
    zeros: '0',
    fn: x => x * x * x,
    xRange: [-2.5, 2.5],
    yRange: [-8, 8],
    icon: 'x³',
    iconBg: 'rgba(107,224,90,.15)',
    iconColor: '#6be05a',
  }
};

// ═══════════════════════════════════════════════════
// BUILD FUNCTION CARDS
// ═══════════════════════════════════════════════════
function buildFuncCard(containerId, key) {
  const f = FUNCS[key];
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div class="func-header">
      <div class="func-icon" style="background:${f.iconBg};color:${f.iconColor}">${f.icon}</div>
      <div>
        <div class="func-name">${f.label}</div>
        <div class="func-expr">\\(${f.exprTex}\\)</div>
      </div>
    </div>
    <div class="func-body">
      <div class="func-canvas-wrap"><canvas id="mini-${key}"></canvas></div>
      <div class="func-info">
        <div class="info-item"><label>Ensemble de définition</label><span>\\(${f.domain}\\)</span></div>
        <div class="info-item"><label>Ensemble image</label><span>\\(${f.image}\\)</span></div>
        <div class="info-item"><label>Parité</label><span>${f.parity}</span></div>
        <div class="info-item"><label>Zéro(s)</label><span>${f.zeros}</span></div>
      </div>
    </div>`;
  requestAnimationFrame(() => drawMiniChart(key));
}

// Registre des instances mini-charts pour pouvoir les détruire avant recréation
const miniChartInstances = {};

function drawMiniChart(key) {
  const f = FUNCS[key];
  const canvas = document.getElementById(`mini-${key}`);
  if (!canvas) return;

  // Détruire l'instance précédente si elle existe (évite l'empilement d'instances)
  if (miniChartInstances[key]) {
    miniChartInstances[key].destroy();
    miniChartInstances[key] = null;
  }

  const ctx = canvas.getContext('2d');
  const [xMin, xMax] = f.xRange;
  const [yMin, yMax] = f.yRange;
  const pts = linspace(xMin, xMax, 300);

  const datasets = [];
  if (key === 'inverse') {
    const neg = pts.filter(x => x < -0.05).map(x => ({ x, y: f.fn(x) }));
    const pos = pts.filter(x => x > 0.05).map(x => ({ x, y: f.fn(x) }));
    datasets.push(
      { data: neg, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, tension: 0.4, fill: false },
      { data: pos, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, tension: 0.4, fill: false }
    );
  } else {
    const data = pts.map(x => ({ x, y: f.fn(x) })).filter(p => p.y !== null);
    datasets.push({ data, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, tension: 0.4, fill: false });
  }

  miniChartInstances[key] = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { type: 'linear', min: xMin, max: xMax, grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks, font: { size: 10 }, maxTicksLimit: 7 } },
        y: { type: 'linear', min: yMin, max: yMax, grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks, font: { size: 10 }, maxTicksLimit: 7 } }
      },
      responsive: true,
      maintainAspectRatio: false,
      showLine: true
    }
  });
}

// ═══════════════════════════════════════════════════
// COMPARE TOOL
// ═══════════════════════════════════════════════════
let compareChart = null;
let currentCompareFunc = 'square';
// Cache des points x pour éviter de recalculer linspace à chaque interaction slider
let _compareXCache = { key: null, pts: null };

function initCompare() {
  const canvas = document.getElementById('compare-canvas');
  const ctx = canvas.getContext('2d');
  compareChart = new Chart(ctx, {
    type: 'scatter',
    data: { datasets: [] },
    options: {
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { type: 'linear', grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks } },
        y: { type: 'linear', grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks } }
      },
      responsive: true, maintainAspectRatio: false, showLine: true
    }
  });
  updateCompare();
}

function updateCompare() {
  const f = FUNCS[currentCompareFunc];
  const a = parseFloat(document.getElementById('slider-a').value);
  const b = parseFloat(document.getElementById('slider-b').value);
  document.getElementById('val-a').textContent = fmt(a);
  document.getElementById('val-b').textContent = fmt(b);

  const [xMin, xMax] = f.xRange;
  // Recalculer les points seulement si la fonction a changé
  if (_compareXCache.key !== currentCompareFunc) {
    _compareXCache.key = currentCompareFunc;
    _compareXCache.pts = linspace(xMin, xMax, 400);
  }
  const pts = _compareXCache.pts;
  const line = pts.map(x => ({ x, y: f.fn(x) })).filter(p => p.y !== null && p.y > f.yRange[0] && p.y < f.yRange[1]);

  const fa = f.fn(a); const fb = f.fn(b);
  const ptA = fa !== null ? [{ x: a, y: fa }] : [];
  const ptB = fb !== null ? [{ x: b, y: fb }] : [];

  compareChart.data.datasets = [
    { type: 'scatter', data: line, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, tension: 0.4, fill: false, showLine: true },
    { type: 'scatter', data: ptA, backgroundColor: '#f7c948', pointRadius: 8, pointHoverRadius: 8, label: 'a' },
    { type: 'scatter', data: ptB, backgroundColor: '#e05a5a', pointRadius: 8, pointHoverRadius: 8, label: 'b' },
    ...(fa !== null ? [{ type: 'scatter', data: [{ x: a, y: f.yRange[0] }, { x: a, y: fa }], borderColor: 'rgba(247,201,72,.4)', borderWidth: 1, borderDash: [4, 4], pointRadius: 0, showLine: true }] : []),
    ...(fb !== null ? [{ type: 'scatter', data: [{ x: b, y: f.yRange[0] }, { x: b, y: fb }], borderColor: 'rgba(224,90,90,.4)', borderWidth: 1, borderDash: [4, 4], pointRadius: 0, showLine: true }] : []),
  ];
  compareChart.options.scales.x.min = xMin;
  compareChart.options.scales.x.max = xMax;
  compareChart.options.scales.y.min = f.yRange[0];
  compareChart.options.scales.y.max = f.yRange[1];
  compareChart.update('none');

  const res = document.getElementById('compare-result');
  let html = `<span style="color:#f7c948">a = ${fmt(a)}</span>  →  <span style="color:#f7c948">f(a) = `;
  html += fa !== null ? fmt(+fa.toFixed(4)) : '∄ (hors domaine)';
  html += `</span><br><span style="color:#e05a5a">b = ${fmt(b)}</span>  →  <span style="color:#e05a5a">f(b) = `;
  html += fb !== null ? fmt(+fb.toFixed(4)) : '∄ (hors domaine)';
  html += `</span><br>`;
  if (fa !== null && fb !== null) {
    if (Math.abs(fa - fb) < 0.0001) html += `⇒  f(a) <b>= </b> f(b)`;
    else if (fa < fb) html += `⇒  f(a) <b>&lt;</b> f(b)`;
    else html += `⇒  f(a) <b>&gt;</b> f(b)`;
  }
  res.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// POSITION RELATIVE CHART
// ═══════════════════════════════════════════════════
let posChart = null;
function initPosChart() {
  const ctx = document.getElementById('pos-canvas').getContext('2d');
  const pts = linspace(0, 2.2, 200);
  posChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        { data: pts.map(x => ({ x, y: x })),       borderColor: '#f7c948', borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false, label: 'y = x' },
        { data: pts.map(x => ({ x, y: x * x })),   borderColor: '#e05a5a', borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false, label: 'y = x²' },
        { data: pts.map(x => ({ x, y: x*x*x })), borderColor: '#6be05a', borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false, label: 'y = x³' },
      ]
    },
    options: {
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { type: 'linear', min: 0, max: 2.2, grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks } },
        y: { type: 'linear', min: 0, max: 6,   grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks } }
      },
      responsive: true, maintainAspectRatio: false, showLine: true
    }
  });
  updatePosResult();
}

function updatePosResult() {
  const x = parseFloat(document.getElementById('pos-x-input').value);
  if (isNaN(x) || x < 0) return;
  const vx = x, vx2 = x * x, vx3 = x * x * x;
  const res = document.getElementById('pos-result');
  res.innerHTML = `x = <span style="color:var(--accent3)">${fmt(x)}</span><br>
    x = <span style="color:#f7c948">${fmt(+vx.toFixed(5))}</span><br>
    x² = <span style="color:#e05a5a">${fmt(+vx2.toFixed(5))}</span><br>
    x³ = <span style="color:#6be05a">${fmt(+vx3.toFixed(5))}</span><br><br>
    ${x < 1 ? `<b>x³ ≤ x² ≤ x</b> ✓` : x === 1 ? `<b>x³ = x² = x = 1</b> ✓` : `<b>x ≤ x² ≤ x³</b> ✓`}`;

  if (posChart) {
    const base = posChart.data.datasets.slice(0, 3);
    posChart.data.datasets = [
      ...base,
      { data: [{ x, y: vx }], backgroundColor: '#f7c948', pointRadius: 7, type: 'scatter' },
      { data: [{ x, y: vx2 }], backgroundColor: '#e05a5a', pointRadius: 7, type: 'scatter' },
      { data: [{ x, y: Math.min(vx3, 6) }], backgroundColor: '#6be05a', pointRadius: 7, type: 'scatter' },
    ];
    posChart.update('none');
  }
}

// ═══════════════════════════════════════════════════
// EQUATIONS TOOL
// ═══════════════════════════════════════════════════
let eqChart = null;
let currentEqFunc = 'square';
// Cache des points x pour éviter de recalculer linspace à chaque déplacement du slider k
let _eqXCache = { key: null, pts: null };

function initEqChart() {
  const ctx = document.getElementById('eq-canvas').getContext('2d');
  eqChart = new Chart(ctx, {
    type: 'scatter',
    data: { datasets: [] },
    options: {
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { type: 'linear', grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks } },
        y: { type: 'linear', grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.ticks } }
      },
      responsive: true, maintainAspectRatio: false, showLine: true
    }
  });
  updateEqChart();
}

function updateEqChart() {
  const f = FUNCS[currentEqFunc];
  const k = parseFloat(document.getElementById('slider-k').value);
  document.getElementById('val-k').textContent = fmt(k);

  const [xMin, xMax] = f.xRange;
  const [yMin, yMax] = f.yRange;
  // Recalculer les points seulement si la fonction a changé
  if (_eqXCache.key !== currentEqFunc) {
    _eqXCache.key = currentEqFunc;
    _eqXCache.pts = linspace(xMin, xMax, 400);
  }
  const pts = _eqXCache.pts;

  let datasets = [];
  if (currentEqFunc === 'inverse') {
    const neg = pts.filter(x => x < -0.05).map(x => ({ x, y: f.fn(x) })).filter(p => p.y > yMin && p.y < yMax);
    const pos = pts.filter(x => x > 0.05).map(x => ({ x, y: f.fn(x) })).filter(p => p.y > yMin && p.y < yMax);
    datasets.push({ data: neg, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false });
    datasets.push({ data: pos, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false });
  } else {
    const line = pts.map(x => ({ x, y: f.fn(x) })).filter(p => p.y !== null && p.y >= yMin && p.y <= yMax);
    datasets.push({ data: line, borderColor: f.color, borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false });
  }

  datasets.push({ data: [{ x: xMin, y: k }, { x: xMax, y: k }], borderColor: '#b05ae0', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, showLine: true });

  let sols = [];
  if (currentEqFunc === 'square') {
    if (k >= 0) { sols = k === 0 ? [0] : [Math.sqrt(k), -Math.sqrt(k)]; }
  } else if (currentEqFunc === 'sqrt') {
    if (k >= 0) { sols = [k * k]; }
  } else if (currentEqFunc === 'inverse') {
    if (k !== 0) { sols = [1 / k]; }
  } else if (currentEqFunc === 'cube') {
    sols = [Math.cbrt(k)];
  }

  sols.filter(x => x >= xMin && x <= xMax).forEach(x => {
    datasets.push({ data: [{ x, y: k }], backgroundColor: '#b05ae0', pointRadius: 9, type: 'scatter' });
  });

  eqChart.data.datasets = datasets;
  eqChart.options.scales.x.min = xMin; eqChart.options.scales.x.max = xMax;
  eqChart.options.scales.y.min = yMin; eqChart.options.scales.y.max = yMax;
  eqChart.update('none');

  const res = document.getElementById('eq-result');
  let html = `<b>\\(${f.exprTex} = ${fmt(k)}\\)</b><br>`;
  if (sols.length === 0) {
    html += `<span style="color:var(--accent2)">Aucune solution dans le domaine de définition.</span>`;
  } else {
    html += `Solutions : <span style="color:#b05ae0">${sols.map(s => '\\(x = ' + fmt(+s.toFixed(5)) + '\\)').join('  ou  ')}</span><br>`;
  }
  html += `<br><b>\\(${f.exprTex} < ${fmt(k)}\\)</b>  → `;
  if (currentEqFunc === 'square') {
    if (k <= 0) html += `<span style="color:var(--accent2)">Aucune solution (\\(x^2 \\geq 0\\) toujours)</span>`;
    else { const s = fmt(+Math.sqrt(k).toFixed(4)); html += `<span style="color:var(--accent3)">\\(x \\in \\mathopen]-${s}\\,;\\,${s}\\mathclose[\\)</span>`; }
  } else if (currentEqFunc === 'sqrt') {
    if (k <= 0) html += `<span style="color:var(--accent2)">Aucune solution (\\(\\sqrt{x} \\geq 0\\) toujours)</span>`;
    else { const s = fmt(+(k * k).toFixed(4)); html += `<span style="color:var(--accent3)">\\(x \\in [0\\,;\\,${s}[\\)</span>`; }
  } else if (currentEqFunc === 'inverse') {
    if (k === 0) html += `<span style="color:var(--accent3)">\\(x \\in \\mathopen]-\\infty\\,;\\,0[\\)</span>`;
    else if (k > 0) html += `<span style="color:var(--accent3)">\\(x \\in \\mathopen]-\\infty\\,;\\,0[\\cup\\mathopen]0\\,;\\,${fmt(+(1/k).toFixed(4))}[\\)</span>`;
    else html += `<span style="color:var(--accent3)">\\(x \\in \\mathopen]${fmt(+(1/k).toFixed(4))}\\,;\\,0[\\)</span>`;
  } else {
    const s = fmt(+Math.cbrt(k).toFixed(4));
    html += `<span style="color:var(--accent3)">\\(x \\in \\mathopen]-\\infty\\,;\\,${s}[\\)</span>`;
  }
  res.innerHTML = html;
  if (window.MathJax) MathJax.typesetPromise([res]).catch(err => console.warn('MathJax:', err));
}

// ═══════════════════════════════════════════════════
// QCM ENGINE — RIGOROUSLY REBUILT
// ═══════════════════════════════════════════════════
//
// Design principles:
//   1. a ≠ b always enforced for comparison questions
//   2. f(a) ≠ f(b) always enforced (no tautology)
//   3. All 4 options are distinct strings
//   4. Exactly one option is correct
//   5. Distractors are plausible but mathematically false
//   6. LaTeX rendered via MathJax \( ... \)

let qcmScore = 0, qcmAnswered = 0, qcmTotal = 0;

// ── Generator helpers ──────────────────────────────

/** Inequality string LaTeX: a < b gives "<", a > b gives ">" */
const cmpTex = (x, y) => x < y ? '<' : '>';
const oppCmp = c => c === '<' ? '>' : '<';

// ── Q1: Compare f(a) and f(b) with x² — same-sign, distinct images ──
function qSquareSameSide() {
  // Guarantee |a| ≠ |b| so f(a) ≠ f(b)
  const side = Math.random() < 0.5 ? 1 : -1;
  const mags = pickTwo([1,2,3,4,5,6]); // two distinct magnitudes
  const [a, b] = mags.map(m => side * m);
  const fa = a*a, fb = b*b; // distinct by construction

  const sym = cmpTex(fa, fb);
  const correct = `\\(f(${a}) ${sym} f(${b})\\)`;
  const wrongs = [
    `\\(f(${a}) ${oppCmp(sym)} f(${b})\\)`,                      // reversed
    `\\(f(${a}) = f(${b})\\)`,                                    // equality (false)
    `\\(f(${a}) = ${fa + 1},\\; f(${b}) = ${fb}\\)`,            // wrong value for fa
  ];
  const opts = buildOptions(correct, wrongs);
  const monoNote = side > 0
    ? `\\(x^2\\) est croissante sur \\([0;+\\infty[\\)`
    : `\\(x^2\\) est décroissante sur \\(]-\\infty;0]\\)`;

  return {
    text: `Soit \\(f(x) = x^2\\). Laquelle des affirmations est vraie pour \\(a = ${a}\\) et \\(b = ${b}\\) ?`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(f(${a}) = (${a})^2 = ${fa}\\) et \\(f(${b}) = (${b})^2 = ${fb}\\). ${monoNote}, et \\(|${a}| ${cmpTex(Math.abs(a),Math.abs(b))} |${b}|\\), donc \\(f(${a}) ${sym} f(${b})\\).`
  };
}

// ── Q2: Compare f(a) and f(b) with x² — opposite signs, distinct |values| ──
function qSquareOpposite() {
  const [p, q] = pickTwo([1,2,3,4,5]); // distinct magnitudes
  const a = -p, b = q;
  const fa = p*p, fb = q*q;
  // Distinct by construction (p≠q)
  const sym = cmpTex(fa, fb);
  const correct = `\\(f(${a}) ${sym} f(${b})\\)`;
  const wrongs = [
    `\\(f(${a}) ${oppCmp(sym)} f(${b})\\)`,
    `\\(f(${a}) = f(${b})\\)`,
    `\\(f(${a}) < 0\\)`,   // wrong: x² ≥ 0 always
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Soit \\(f(x) = x^2\\). Comparer \\(f(${a})\\) et \\(f(${b})\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(f(${a}) = (${a})^2 = ${fa}\\) et \\(f(${b}) = (${b})^2 = ${fb}\\). \\(x^2\\) dépend du module de \\(x\\) : \\(|${a}| = ${p}\\) et \\(|${b}| = ${q}\\), donc \\(f(${a}) ${sym} f(${b})\\).`
  };
}

// ── Q3: Compute x³ for a given integer ──
function qCubeCompute() {
  const a = pick([-3,-2,-1,1,2,3]);
  const fa = a*a*a;
  const correct = `\\(f(${a}) = ${fa}\\)`;
  const wrongs = [
    `\\(f(${a}) = ${-fa}\\)`,      // sign flipped
    `\\(f(${a}) = ${a*a}\\)`,      // confused x³ with x²
    `\\(f(${a}) = ${3*a}\\)`,      // confused with 3x
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Soit \\(f(x) = x^3\\). Calculer \\(f(${a})\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(f(${a}) = (${a})^3 = ${fa}\\). La fonction cube préserve le signe : \\(f(${a}) ${fa < 0 ? '<' : '>'} 0\\).`
  };
}

// ── Q4: Compute 1/x for a nonzero integer ──
function qInverseCompute() {
  const pool = [-5,-4,-3,-2,2,3,4,5];
  const v = pick(pool);
  const fracTex = latexFrac(1, v);
  const correct = `\\(f(${v}) = ${fracTex}\\)`;
  const wrongs = [
    `\\(f(${v}) = ${v}\\)`,                    // identity
    `\\(f(${v}) = ${latexFrac(-1,v)}\\)`,      // wrong sign
    `\\(f(${v}) = ${v*v}\\)`,                  // x² instead of 1/x
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Soit \\(f(x) = \\dfrac{1}{x}\\). Calculer \\(f(${v})\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(f(${v}) = \\dfrac{1}{${v}} = ${fracTex}\\).`
  };
}

// ── Q5: Compare 1/x — same sign, distinct values, guaranteed f(a)≠f(b) ──
function qInverseCompare() {
  const side = Math.random() < 0.5 ? 1 : -1;
  const [p, q] = pickTwo([1,2,3,4,5]); // distinct magnitudes
  const a = side * p, b = side * q;
  const fa = 1/a, fb = 1/b; // distinct (1/a≠1/b when a≠b)
  const sym = cmpTex(fa, fb);
  const correct = `\\(f(${a}) ${sym} f(${b})\\)`;
  const wrongs = [
    `\\(f(${a}) ${oppCmp(sym)} f(${b})\\)`,
    `\\(f(${a}) = f(${b})\\)`,
    side > 0
      ? `\\(f(${a}) < 0\\text{ et }f(${b}) > 0\\)` // wrong signs
      : `\\(f(${a}) > 0\\)`,                         // wrong sign
  ];
  const opts = buildOptions(correct, wrongs);
  const monoNote = side > 0
    ? `Sur \\(]0;+\\infty[\\), \\(1/x\\) est décroissante`
    : `Sur \\(]-\\infty;0[\\), \\(1/x\\) est décroissante`;
  return {
    text: `Soit \\(f(x) = \\dfrac{1}{x}\\). Comparer \\(f(${a})\\) et \\(f(${b})\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(f(${a}) = ${latexFrac(1,a)}\\) et \\(f(${b}) = ${latexFrac(1,b)}\\). ${monoNote}, donc \\(f(${a}) ${sym} f(${b})\\).`
  };
}

// ── Q6: Compare √a and √b — a≠b both ≥ 0 ──
function qSqrtCompare() {
  const pool = [0,1,4,9,16,2,3,5,7,8,10];
  const [a, b] = pickTwo(pool); // distinct
  const fa = Math.sqrt(a), fb = Math.sqrt(b);
  const sym = cmpTex(fa, fb);
  const sqA = Number.isInteger(fa) ? String(fa) : `\\sqrt{${a}}`;
  const sqB = Number.isInteger(fb) ? String(fb) : `\\sqrt{${b}}`;
  const correct = `\\(f(${a}) ${sym} f(${b})\\)`;
  const wrongs = [
    `\\(f(${a}) ${oppCmp(sym)} f(${b})\\)`,
    `\\(f(${a}) = f(${b})\\)`,
    `\\(f(${a}) = ${a},\\; f(${b}) = ${b}\\)`, // confused sqrt with identity
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Soit \\(f(x) = \\sqrt{x}\\). Comparer \\(f(${a})\\) et \\(f(${b})\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(f(${a}) = ${sqA}\\) et \\(f(${b}) = ${sqB}\\). \\(\\sqrt{x}\\) est croissante sur \\([0;+\\infty[\\), donc \\(f(${a}) ${sym} f(${b})\\).`
  };
}

// ── Q7: Solve x² = k² (always two solutions) ──
function qSolveSquarePerfect() {
  const r = pick([1,2,3,4,5,6]);
  const k = r * r;
  const correct = `\\(x = ${r}\\text{ ou }x = -${r}\\)`;
  const wrongs = [
    `\\(x = ${r}\\)`,                         // forgot negative root
    `\\(x = -${r}\\)`,                        // forgot positive root
    `\\(x = ${k}\\text{ ou }x = -${k}\\)`,   // k instead of √k
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Résoudre l'équation \\(x^2 = ${k}\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(x^2 = ${k} \\Leftrightarrow x = \\sqrt{${k}} = ${r}\\) ou \\(x = -\\sqrt{${k}} = -${r}\\). Pour \\(k > 0\\), il y a toujours deux solutions opposées.`
  };
}

// ── Q8: Solve x² = k < 0 — no solution ──
function qSolveSquareNeg() {
  const k = pick([-1,-2,-3,-4,-5]);
  const correct = `Aucune solution dans \\(\\mathbb{R}\\)`;
  const wrongs = [
    `\\(x = \\sqrt{${-k}}\\text{ ou }x = -\\sqrt{${-k}}\\)`, // error: used |k| instead
    `\\(x = ${k}\\)`,                                          // computed root of |k| wrong
    `\\(x = 0\\)`,                                             // 0² ≠ k
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Résoudre l'équation \\(x^2 = ${k}\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `Comme \\(x^2 \\geq 0\\) pour tout réel \\(x\\), l'équation \\(x^2 = ${k} < 0\\) n'a aucune solution dans \\(\\mathbb{R}\\).`
  };
}

// ── Q9: Solve √x = k ≥ 0 ──
function qSolveSqrt() {
  const k = pick([1,2,3,4,5,7]);
  const sol = k * k;
  const correct = `\\(x = ${sol}\\)`;
  const wrongs = [
    `\\(x = ${k}\\)`,                  // forgot to square
    `\\(x = ${2*k}\\)`,               // ×2 instead of ²
    `\\(x = -${sol}\\)`,              // negative (√ ≥ 0, impossible)
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Résoudre \\(\\sqrt{x} = ${k}\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(\\sqrt{x} = ${k} \\geq 0\\), donc on peut élever au carré : \\(x = ${k}^2 = ${sol}\\). Vérification : \\(\\sqrt{${sol}} = ${k}\\) ✓`
  };
}

// ── Q10: Solve x³ = k — unique solution ──
function qSolveCube() {
  const r = pick([-3,-2,-1,1,2,3]);
  const k = r*r*r;
  const correct = `\\(x = ${r}\\)`;
  const wrongs = [
    `\\(x = ${r}\\text{ ou }x = -${Math.abs(r)}\\)`, // confused with x²
    `\\(x = ${k}\\)`,                                 // no cube root taken
    `\\(x = ${Math.abs(r)}\\)`,                       // lost sign
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Résoudre l'équation \\(x^3 = ${k}\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `La fonction \\(x \\mapsto x^3\\) est bijective sur \\(\\mathbb{R}\\) : solution unique \\(x = \\sqrt[3]{${k}} = ${r}\\). Contrairement à \\(x^2\\), il n'y a qu'une seule solution.`
  };
}

// ── Q11: Solve x² < k ──
function qInequalitySquare() {
  const r = pick([2,3,4,5]);
  const k = r * r;
  const correct = `\\(x \\in \\mathopen]-${r}\\,;\\,${r}\\mathclose[\\)`;
  const wrongs = [
    `\\(x \\in [-${r}\\,;\\,${r}]\\)`,                          // closed (wrong for strict ineq)
    `\\(x \\in \\mathopen]${r}\\,;\\,+\\infty[\\)`,             // wrong direction
    `\\(x \\in \\mathopen]-\\infty\\,;\\,-${r}[\\cup\\mathopen]${r}\\,;\\,+\\infty[\\)`, // ≥k, not <k
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Résoudre l'inéquation \\(x^2 < ${k}\\).`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(x^2 < ${k} \\Leftrightarrow |x| < \\sqrt{${k}} = ${r} \\Leftrightarrow -${r} < x < ${r}\\). Les bornes sont exclues (inégalité stricte).`
  };
}

// ── Q12: Domain — which value makes √ undefined ──
function qSqrtUndefined() {
  const neg = pick([-1,-2,-3,-4,-5,-9]);
  const correct = `\\(\\sqrt{${neg}}\\) n'existe pas dans \\(\\mathbb{R}\\)`;
  const wrongs = [
    `\\(\\sqrt{${neg}} = -\\sqrt{${-neg}}\\)`,    // incorrect "extension"
    `\\(\\sqrt{${neg}} = \\sqrt{${-neg}}\\)`,      // dropped sign
    `\\(\\sqrt{${neg}} = 0\\)`,                    // wrong
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Que peut-on affirmer sur \\(\\sqrt{${neg}}\\) dans \\(\\mathbb{R}\\) ?`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `La fonction \\(\\sqrt{x}\\) est définie uniquement pour \\(x \\geq 0\\). Comme \\(${neg} < 0\\), la valeur \\(\\sqrt{${neg}}\\) n'appartient pas à \\(\\mathbb{R}\\).`
  };
}

// ── Q13: Position relative (x, x², x³) for x ∈ ]0;1[ ──
function qPositionBetween01() {
  const vals = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const x = pick(vals);
  const correct = `\\(x^3 < x^2 < x\\)`;
  const wrongs = [
    `\\(x < x^2 < x^3\\)`,    // wrong (would hold for x>1)
    `\\(x^2 < x^3 < x\\)`,    // wrong order of x² and x³
    `\\(x = x^2 = x^3\\)`,    // only true at x=0 or x=1
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Pour \\(x = ${x}\\) (avec \\(0 < x < 1\\)), quelle relation est correcte ?`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `Pour \\(0 < x < 1\\), multiplier par \\(x < 1\\) diminue : \\(x^2 = x \\cdot x < 1 \\cdot x = x\\) et \\(x^3 = x \\cdot x^2 < x^2\\). Vérification : \\(x = ${x}\\), \\(x^2 = ${(x*x).toFixed(4)}\\), \\(x^3 = ${(x*x*x).toFixed(4)}\\).`
  };
}

// ── Q14: Position relative (x, x², x³) for x > 1 ──
function qPositionAbove1() {
  const vals = [1.5, 2, 2.5, 3, 4];
  const x = pick(vals);
  const correct = `\\(x < x^2 < x^3\\)`;
  const wrongs = [
    `\\(x^3 < x^2 < x\\)`,    // wrong (would hold for 0<x<1)
    `\\(x^2 < x < x^3\\)`,    // wrong order of x and x²
    `\\(x = x^2 = x^3\\)`,    // only at x=1
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Pour \\(x = ${x}\\) (avec \\(x > 1\\)), quelle relation est correcte ?`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `Pour \\(x > 1\\), multiplier par \\(x > 1\\) augmente : \\(x^2 = x \\cdot x > 1 \\cdot x = x\\) et \\(x^3 = x \\cdot x^2 > x^2\\). Vérification : \\(x = ${x}\\), \\(x^2 = ${x*x}\\), \\(x^3 = ${x*x*x}\\).`
  };
}

// ── Q15: Which functions are defined at x = 0? ──
function qDefinedAtZero() {
  const correct = `\\(x^2\\), \\(x^3\\) et \\(\\sqrt{x}\\) (mais pas \\(1/x\\))`;
  const wrongs = [
    `Toutes les quatre fonctions`,                             // wrong: 1/x not defined
    `\\(x^2\\) et \\(x^3\\) uniquement`,                      // wrong: forgets √x
    `\\(\\sqrt{x}\\) et \\(1/x\\) uniquement`,                // wrong
  ];
  const opts = buildOptions(correct, wrongs);
  return {
    text: `Parmi \\(x^2\\), \\(\\dfrac{1}{x}\\), \\(\\sqrt{x}\\) et \\(x^3\\), lesquelles sont définies en \\(x = 0\\) ?`,
    opts, correctIndex: opts.indexOf(correct),
    expl: `\\(0^2 = 0\\) ✓, \\(0^3 = 0\\) ✓, \\(\\sqrt{0} = 0\\) ✓. Mais \\(\\dfrac{1}{0}\\) est indéfini (division par zéro). Donc trois fonctions sur quatre sont définies en 0.`
  };
}

// ── Pool ──────────────────────────────────────────
const Q_POOL = [
  qSquareSameSide,
  qSquareOpposite,
  qCubeCompute,
  qInverseCompute,
  qInverseCompare,
  qSqrtCompare,
  qSolveSquarePerfect,
  qSolveSquareNeg,
  qSolveSqrt,
  qSolveCube,
  qInequalitySquare,
  qSqrtUndefined,
  qPositionBetween01,
  qPositionAbove1,
  qDefinedAtZero,
];

function generateQuestions(n = 6) {
  return shuffle([...Q_POOL]).slice(0, n).map(gen => gen());
}

// ── Render ────────────────────────────────────────
function renderQCM(questions) {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  qcmScore = 0; qcmAnswered = 0; qcmTotal = questions.length;
  updateScore();

  questions.forEach((q, qi) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.dataset.qi = qi;

    const labels = ['A', 'B', 'C', 'D'];
    const optsHTML = q.opts.map((opt, oi) => `
      <div class="option" role="button" tabindex="0"
           aria-label="Option ${labels[oi]}"
           data-qi="${qi}" data-oi="${oi}">
        <span class="option-label">${labels[oi]}</span>
        <span class="option-content">${opt}</span>
      </div>`).join('');

    block.innerHTML = `
      <p class="question-text"><b>Q${qi + 1}.</b> ${q.text}</p>
      <div class="options">${optsHTML}</div>
      <div class="explanation" id="expl-${qi}">💡 ${q.expl}</div>`;
    container.appendChild(block);
  });

  container.querySelectorAll('.option').forEach(opt => {
    // Clic souris
    opt.addEventListener('click', handleOptionSelect);
    // Navigation clavier : Entrée ou Espace déclenchent la sélection
    opt.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOptionSelect.call(opt, e);
      }
    });
  });

  if (window.MathJax) MathJax.typesetPromise([container]).catch(err => console.warn('MathJax:', err));

  // ── Gestionnaire de sélection d'une option (réutilisable clavier + souris) ──
  function handleOptionSelect() {
      const qi = parseInt(this.dataset.qi);
      const oi = parseInt(this.dataset.oi);
      const block = container.querySelector(`.question-block[data-qi="${qi}"]`);
      if (block.dataset.answered) return;
      block.dataset.answered = '1';
      qcmAnswered++;

      const q = questions[qi];
      const allOpts = block.querySelectorAll('.option');
      allOpts.forEach(o => {
        o.classList.add('locked');
        o.setAttribute('tabindex', '-1'); // retirer du focus une fois répondu
      });

      if (oi === q.correctIndex) {
        this.classList.add('correct');
        qcmScore++;
      } else {
        this.classList.add('wrong');
        allOpts[q.correctIndex].classList.add('correct');
      }
      const explEl = document.getElementById(`expl-${qi}`);
      explEl.classList.add('show');
      updateScore();
      if (window.MathJax) MathJax.typesetPromise([explEl]).catch(err => console.warn('MathJax:', err));
  }
}

// ═══════════════════════════════════════════════════
// CHRONO
// ═══════════════════════════════════════════════════
let timerSeconds = 0;
let timerRunning = false;
let timerVisible = true;
let timerInterval = null;

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function startTimer() {
  if (timerInterval) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSeconds++;
    document.getElementById('timer-display').textContent = formatTime(timerSeconds);
  }, 1000);
  const btnPause = document.getElementById('btn-pause');
  btnPause.textContent = '⏸ Pause';
  btnPause.classList.remove('paused');
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  const btnPause = document.getElementById('btn-pause');
  btnPause.textContent = '▶ Reprendre';
  btnPause.classList.add('paused');
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 0;
  document.getElementById('timer-display').textContent = formatTime(0);
}

function initTimer() {
  document.getElementById('btn-pause').addEventListener('click', () => {
    timerRunning ? pauseTimer() : startTimer();
  });
  document.getElementById('btn-reset-timer').addEventListener('click', resetTimer);
  document.getElementById('btn-toggle-timer').addEventListener('click', () => {
    timerVisible = !timerVisible;
    const display = document.getElementById('timer-display');
    display.classList.toggle('hidden-timer', !timerVisible);
    document.getElementById('btn-toggle-timer').textContent = timerVisible ? '👁 Masquer' : '👁 Afficher';
  });
}

function updateScore() {
  document.getElementById('score-display').textContent = `${qcmScore} / ${qcmAnswered}`;
  const pct = qcmTotal > 0 ? (qcmAnswered / qcmTotal * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
}

function regenerateQCM() {
  // Remettre le chrono à zéro et le relancer pour le nouveau QCM
  resetTimer();
  startTimer();
  renderQCM(generateQuestions(6));
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // ── Lire les couleurs depuis les variables CSS (source unique de vérité) ──
  const cssVars = getComputedStyle(document.documentElement);
  CHART_COLORS.grid   = cssVars.getPropertyValue('--bg3').trim()   || '#1a2235';
  CHART_COLORS.ticks  = cssVars.getPropertyValue('--muted').trim() || '#6b7a99';

  buildFuncCard('card-square', 'square');
  buildFuncCard('card-inverse', 'inverse');
  buildFuncCard('card-sqrt', 'sqrt');
  buildFuncCard('card-cube', 'cube');

  // Attendre que Chart.js ait dimensionné les canvas via requestAnimationFrame
  // (plus fiable que setTimeout arbitraire)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initCompare();
      initPosChart();
      initEqChart();
      regenerateQCM();
      if (window.MathJax) MathJax.typesetPromise().catch(err => console.warn('MathJax init:', err));
    });
  });

  document.getElementById('slider-a').addEventListener('input', updateCompare);
  document.getElementById('slider-b').addEventListener('input', updateCompare);

  document.querySelectorAll('#compare-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#compare-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCompareFunc = tab.dataset.func;
      updateCompare();
    });
  });

  document.getElementById('pos-x-input').addEventListener('input', updatePosResult);

  document.getElementById('slider-k').addEventListener('input', updateEqChart);
  document.querySelectorAll('#eq-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#eq-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentEqFunc = tab.dataset.eq;
      updateEqChart();
    });
  });

  // ── Bouton Nouveau QCM (plus d'onclick inline) ──
  document.getElementById('btn-new-qcm').addEventListener('click', regenerateQCM);

  document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const id = pill.getAttribute('href').slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Chrono ──
  initTimer();
});