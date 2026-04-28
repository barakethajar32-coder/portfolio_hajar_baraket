// =============================================
// ÉTOILES DE FOND
// =============================================
const sc = document.getElementById('stars');
for (let i = 0; i < 80; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  const sz = Math.random() * 3 + 1;
  s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;animation-delay:${Math.random()*2}s;animation-duration:${1.5+Math.random()*2}s`;
  sc.appendChild(s);
}

// =============================================
// ÉTAT GLOBAL
// =============================================
const completed = {};
let totalCompleted = 0;

// =============================================
// NAVIGATION
// =============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  if (id !== 'title') document.getElementById('hud').style.display = 'flex';
}

function startGame() {
  showScreen('map');
  updateHUD();
}

function goMap() {
  showScreen('map');
  updateMap();
}

function goLevel(zone) {
  showScreen(zone);
  if (zone === 'about') initQuiz();
  if (zone === 'gallery') initMemory();
  if (zone === 'music') resetRhythm();
  if (zone === 'skills') resetMole();
  if (zone === 'contact') initBoss();
  if (zone === 'inspiration') fetchQuote();
}

function checkZone6() {
  if (totalCompleted >= 5) goLevel('inspiration');
  else alert('🔒 Complete all 5 zones first!');
}

function updateMap() {
  ['about','gallery','music','skills','contact'].forEach(z => {
    document.getElementById('star-' + z).textContent = completed[z] ? '⭐' : '';
  });
  const pct = (totalCompleted / 5) * 100;
  document.getElementById('world-progress-bar').style.width = pct + '%';
  document.getElementById('world-progress-label').textContent = `${totalCompleted} / 5 completed`;
  const zoneInspiration = document.getElementById('zone-inspiration');
  const lockBadge = document.getElementById('inspiration-lock');
  if (totalCompleted >= 5) {
    zoneInspiration.style.opacity = '1';
    lockBadge.textContent = '🔓';
  } else {
    zoneInspiration.style.opacity = '0.5';
    lockBadge.textContent = '🔒';
  }
}

function updateHUD() {
  document.getElementById('hud-stars-display').textContent = `⭐ ${totalCompleted} / 5 zones`;
}

// =============================================
// CONFETTI & TOAST
// =============================================
function completeZone(zone) {
  if (!completed[zone]) {
    completed[zone] = true;
    totalCompleted++;
    updateHUD();
    confetti();
  }
}

function confetti() {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9a3c'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${1.2+Math.random()*1.5}s;animation-delay:${Math.random()*.5}s;transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3000);
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.transform = 'translateY(0)';
  t.style.opacity = '1';
  setTimeout(() => {
    t.style.transform = 'translateY(100px)';
    t.style.opacity = '0';
  }, 2500);
}

// =============================================
// QUIZ
// =============================================
const quizData = [
  { q: "What is Hajar's main creative passion?", opts: ["Cooking","Art & Music","Sports","Coding only"], ans: 1 },
  { q: "Which vibe best describes Hajar's style?", opts: ["Dark & gloomy","Boring & plain","Colorful & playful 🌈","Super serious"], ans: 2 },
  { q: "What does Hajar love to create?", opts: ["Spreadsheets","Visual & musical art","Legal documents","Traffic reports"], ans: 1 },
  { q: "How would Hajar describe her portfolio?", opts: ["Just a CV","A creative universe!","A boring website","A grocery list"], ans: 1 },
  { q: "What's Hajar's superpower?", opts: ["Making things ugly","Being average","Turning imagination into art ✨","Sleeping all day"], ans: 2 }
];
let qIdx = 0, qScore = 0;

function initQuiz() { qIdx = 0; qScore = 0; renderQuestion(); }

function renderQuestion() {
  const prog = document.getElementById('quiz-progress');
  prog.innerHTML = quizData.map((_,i) => `<div class="q-dot${i<qIdx?' done':''}"></div>`).join('');
  const d = quizData[qIdx];
  document.getElementById('quiz-q').textContent = d.q;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-opts').innerHTML = d.opts.map((o,i) => `<button class="quiz-opt" onclick="answerQ(${i})">${o}</button>`).join('');
}

function answerQ(i) {
  const d = quizData[qIdx];
  const btns = document.querySelectorAll('.quiz-opt');
  btns.forEach((b,j) => {
    b.disabled = true;
    if (j === d.ans) b.classList.add('correct');
    else if (j === i) b.classList.add('wrong');
  });
  if (i === d.ans) qScore++;
  document.getElementById('quiz-feedback').innerHTML = i === d.ans ? '✅ Correct! You know Hajar well!' : '❌ Oops! Try the next one!';
  qIdx++;
  setTimeout(() => {
    if (qIdx < quizData.length) renderQuestion();
    else {
      document.getElementById('quiz-q').textContent = `Quiz done! You got ${qScore}/${quizData.length} right! 🎉`;
      document.getElementById('quiz-opts').innerHTML = '';
      document.getElementById('quiz-feedback').innerHTML = `<button class="start-btn small-btn" onclick="completeZone('about');goMap()">🗺️ Claim ⭐ & Go Back</button>`;
    }
  }, 1200);
}

// =============================================
// MEMORY
// =============================================
const memEmojis = ['🎨','🎵','📸','🦋','✨','🎭','🖌️','🎶'];
let memFlipped = [], memMatched = 0, memMoves = 0, memLock = false, memCards = [];

function initMemory() {
  memFlipped = []; memMatched = 0; memMoves = 0; memLock = false;
  document.getElementById('mem-moves').textContent = '0';
  document.getElementById('mem-pairs').textContent = '0';
  const pairs = [...memEmojis, ...memEmojis].sort(() => Math.random() - .5);
  memCards = pairs;
  document.getElementById('mem-grid').innerHTML = pairs.map((e,i) => `<div class="mem-card" id="mc${i}" onclick="flipCard(${i})"><div class="front">${e}</div><div class="back">❓</div></div>`).join('');
}

function flipCard(i) {
  if (memLock || memFlipped.includes(i) || document.getElementById('mc' + i).classList.contains('matched')) return;
  document.getElementById('mc' + i).classList.add('flipped');
  memFlipped.push(i);
  if (memFlipped.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves;
    memLock = true;
    const [a, b] = memFlipped;
    if (memCards[a] === memCards[b]) {
      document.getElementById('mc' + a).classList.add('matched');
      document.getElementById('mc' + b).classList.add('matched');
      memMatched++;
      document.getElementById('mem-pairs').textContent = memMatched;
      memFlipped = [];
      memLock = false;
      if (memMatched === 8) {
        confetti();
        completeZone('gallery');
        setTimeout(() => { alert('🎉 You matched all pairs! ⭐ earned!'); goMap(); }, 500);
      }
    } else {
      setTimeout(() => {
        document.getElementById('mc' + a).classList.remove('flipped');
        document.getElementById('mc' + b).classList.remove('flipped');
        memFlipped = [];
        memLock = false;
      }, 900);
    }
  }
}

// =============================================
// RHYTHM
// =============================================
let rhythmInterval = null, rhythmActive = -1, rhythmScore = 0, rhythmMiss = 0, rhythmRunning = false;

function resetRhythm() {
  rhythmScore = 0; rhythmMiss = 0;
  document.getElementById('r-score').textContent = '0';
  document.getElementById('r-miss').textContent = '0';
  document.getElementById('combo-display').textContent = '';
  document.getElementById('rhythm-start-btn').style.display = '';
  stopRhythm();
}

function startRhythm() {
  resetRhythm();
  document.getElementById('combo-display').textContent = '🎵 Go!';
  document.getElementById('rhythm-start-btn').style.display = 'none';
  rhythmRunning = true;
  rhythmTick();
  rhythmInterval = setInterval(rhythmTick, 900);
}

function rhythmTick() {
  if (rhythmActive >= 0) {
    rhythmMiss++;
    document.getElementById('r-miss').textContent = rhythmMiss;
    document.getElementById('combo-display').textContent = '❌ Too slow!';
    document.getElementById('b' + rhythmActive).classList.remove('active');
  }
  rhythmActive = Math.floor(Math.random() * 4);
  document.getElementById('b' + rhythmActive).classList.add('active');
}

function hitBeat(i) {
  if (!rhythmRunning) return;
  if (i === rhythmActive) {
    rhythmScore++;
    document.getElementById('r-score').textContent = rhythmScore;
    document.getElementById('b' + rhythmActive).classList.remove('active');
    rhythmActive = -1;
    const msgs = ['🔥 Hot!','⚡ Lit!','🌟 Nice!','🎵 Groovy!','✨ Sick!'];
    document.getElementById('combo-display').textContent = msgs[Math.floor(Math.random()*msgs.length)];
    if (rhythmScore >= 10) {
      stopRhythm();
      confetti();
      completeZone('music');
      setTimeout(() => { alert('🎉 10 hits! ⭐ earned! You have the rhythm!'); goMap(); }, 300);
    }
  } else {
    rhythmMiss++;
    document.getElementById('r-miss').textContent = rhythmMiss;
    document.getElementById('combo-display').textContent = '💨 Wrong beat!';
  }
}

function stopRhythm() {
  clearInterval(rhythmInterval);
  if (rhythmActive >= 0) {
    document.getElementById('b' + rhythmActive).classList.remove('active');
    rhythmActive = -1;
  }
  rhythmRunning = false;
}

// =============================================
// WHACK-A-MOLE
// =============================================
const skills = ['🎨','🖌️','🎵','📸','✨','🦋','🎭','🎶','💫','🌟'];
let moleInterval = null, moleTimer = null, moleScoreVal = 0, moleTimeLeft = 30, moleRunning = false, moleActive = [];

function buildMoleGrid() {
  const g = document.getElementById('mole-grid');
  g.innerHTML = Array(9).fill(0).map((_,i) => `<div class="mole-hole" id="hole${i}"><div class="mole" id="mole${i}">🌟</div></div>`).join('');
  for (let i = 0; i < 9; i++) {
    (function(idx) {
      document.getElementById('hole' + idx).addEventListener('click', () => whack(idx));
    })(i);
  }
}

function resetMole() {
  stopMole();
  moleScoreVal = 0;
  document.getElementById('mole-score').textContent = '0';
  document.getElementById('mole-time').textContent = '30';
  document.getElementById('mole-timer-fill').style.width = '100%';
  document.getElementById('mole-start-btn').style.display = '';
  buildMoleGrid();
}

function startMole() {
  stopMole();
  moleScoreVal = 0; moleTimeLeft = 30; moleActive = [];
  document.getElementById('mole-score').textContent = '0';
  document.getElementById('mole-time').textContent = '30';
  document.getElementById('mole-timer-fill').style.width = '100%';
  document.getElementById('mole-start-btn').style.display = 'none';
  buildMoleGrid();
  moleRunning = true;

  moleInterval = setInterval(() => {
    const free = [0,1,2,3,4,5,6,7,8].filter(i => !moleActive.includes(i));
    if (!free.length) return;
    const h = free[Math.floor(Math.random() * free.length)];
    const skill = skills[Math.floor(Math.random() * skills.length)];
    document.getElementById('mole' + h).textContent = skill;
    document.getElementById('hole' + h).classList.add('has-mole');
    moleActive.push(h);
    setTimeout(() => hideMole(h), 1200);
  }, 700);

  moleTimer = setInterval(() => {
    moleTimeLeft--;
    document.getElementById('mole-time').textContent = moleTimeLeft;
    document.getElementById('mole-timer-fill').style.width = (moleTimeLeft / 30 * 100) + '%';
    if (moleTimeLeft <= 0) {
      stopMole();
      setTimeout(() => {
        if (moleScoreVal >= 15) {
          confetti();
          completeZone('skills');
          alert('🎉 You whacked 15+ skills! ⭐ earned!');
        } else {
          alert(`You got ${moleScoreVal} — need 15 to win! Try again!`);
        }
        goMap();
      }, 300);
    }
  }, 1000);
}

function hideMole(h) {
  const hole = document.getElementById('hole' + h);
  if (hole) hole.classList.remove('has-mole');
  moleActive = moleActive.filter(x => x !== h);
}

function whack(h) {
  if (!moleRunning) return;
  if (!moleActive.includes(h)) return;
  moleScoreVal++;
  document.getElementById('mole-score').textContent = moleScoreVal;
  hideMole(h);
  const hole = document.getElementById('hole' + h);
  if (hole) {
    hole.style.transform = 'scale(0.85)';
    setTimeout(() => hole.style.transform = '', 150);
  }
}

function stopMole() {
  clearInterval(moleInterval);
  clearInterval(moleTimer);
  moleRunning = false;
  moleActive.forEach(h => hideMole(h));
}

// =============================================
// BOSS FIGHT
// =============================================
let bossHP = 100;

function initBoss() {
  bossHP = 100;
  document.getElementById('boss-hp-fill').style.width = '100%';
  document.getElementById('boss-hp-txt').textContent = '100 / 100';
  document.getElementById('boss-sprite').textContent = '👾';
  document.getElementById('battle-log').textContent = '';
  document.querySelectorAll('.spell-btn').forEach(b => b.disabled = false);
  document.getElementById('contact-form-wrap').style.display = 'none';
  document.getElementById('form-feedback').textContent = '';
}

function attack(dmg, msg) {
  bossHP = Math.max(0, bossHP - dmg);
  document.getElementById('boss-hp-fill').style.width = bossHP + '%';
  document.getElementById('boss-hp-txt').textContent = bossHP + ' / 100';
  document.getElementById('battle-log').textContent = msg;
  const sprite = document.getElementById('boss-sprite');
  sprite.classList.add('hit');
  setTimeout(() => sprite.classList.remove('hit'), 300);
  if (bossHP <= 50) sprite.textContent = '😵';
  if (bossHP <= 0) {
    sprite.textContent = '💥';
    document.getElementById('battle-log').textContent = '🎉 BOSS DEFEATED! You unlocked Hajar\'s contacts!';
    document.querySelectorAll('.spell-btn').forEach(b => b.disabled = true);
    confetti();
    completeZone('contact');
    document.getElementById('contact-form-wrap').style.display = 'block';
  }
}

// =============================================
// FORMULAIRE DE CONTACT ASYNCHRONE
// =============================================
async function sendMessage() {
  const name = document.getElementById('form-name').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const message = document.getElementById('form-message').value.trim();
  const feedback = document.getElementById('form-feedback');
  const loader = document.getElementById('form-loader');

  if (!name || !email || !message) {
    feedback.textContent = '❌ Please fill all fields.';
    feedback.style.color = '#ff6b6b';
    return;
  }

  loader.style.display = 'block';
  feedback.textContent = '';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    if (!response.ok) throw new Error('Network response was not ok');
    feedback.textContent = '✅ Message sent successfully! (demo)';
    feedback.style.color = '#6bcb77';
    document.getElementById('form-name').value = '';
    document.getElementById('form-email').value = '';
    document.getElementById('form-message').value = '';
  } catch (error) {
    feedback.textContent = '❌ Failed to send. Please try again.';
    feedback.style.color = '#ff6b6b';
  } finally {
    loader.style.display = 'none';
  }
}

// =============================================
// API INSPIRATION (robuste avec fallback)
// =============================================
async function fetchQuote() {
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const loader = document.getElementById('quote-loader');
  const errorEl = document.getElementById('quote-error');

  quoteText.textContent = '';
  quoteAuthor.textContent = '';
  errorEl.style.display = 'none';
  loader.style.display = 'block';

  const endpoints = [
    'https://api.adviceslip.com/advice',
    'https://api.quotable.io/random?tags=technology',
    'https://dummyjson.com/quotes/random'
  ];

  let success = false;
  for (let url of endpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      let quote = '', author = '';
      if (data.slip && data.slip.advice) {
        quote = data.slip.advice;
        author = 'Advice Slip';
      } else if (data.content && data.author) {
        quote = data.content;
        author = data.author;
      } else if (data.quote && data.author) {
        quote = data.quote;
        author = data.author;
      } else if (data.message && data.message.quote) {
        quote = data.message.quote;
        author = data.message.author || 'Unknown';
      }

      if (quote) {
        quoteText.textContent = `“${quote}”`;
        quoteAuthor.textContent = `— ${author}`;
        success = true;
        break;
      }
    } catch (err) {
      console.warn('API échouée : ' + url, err);
    }
  }

  if (!success) {
    errorEl.style.display = 'block';
    errorEl.textContent = '⚠️ Could not load inspiration (offline?). Fallback quote:';
    // Citation locale de secours
    quoteText.textContent = '“The only way to do great work is to love what you do.”';
    quoteAuthor.textContent = '— Steve Jobs';
  }

  loader.style.display = 'none';
}

// =============================================
// OUVERTURE DE LIENS
// =============================================
function openLink(url) {
  window.open(url, '_blank');
}

// =============================================
// INITIALISATION AU CHARGEMENT
// =============================================
buildMoleGrid();