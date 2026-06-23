/* =========================================================
   SHARED JAVASCRIPT — LegalRightsCenter.online
   Navigation, accordion, disclaimer, progress bar, tools
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── READ PROGRESS BAR ─────────────────────────────── */
  const bar = document.getElementById('read-progress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${(window.scrollY / max) * 100}%`;
    });
  }

  /* ── MOBILE NAV ────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px,5px)' : '';
      spans[1].style.opacity   = navLinks.classList.contains('open') ? '0' : '1';
      spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
  }

  /* ── ACCORDION / FAQ ───────────────────────────────── */
  document.querySelectorAll('.accordion-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-q').forEach(b => {
        b.classList.remove('open');
        if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) { btn.classList.add('open'); answer.classList.add('open'); }
    });
  });

  /* ── STICKY DISCLAIMER CLOSE ───────────────────────── */
  const discClose = document.querySelector('.disclaimer-sticky .close-btn');
  if (discClose) {
    discClose.addEventListener('click', () => {
      document.querySelector('.disclaimer-sticky').style.display = 'none';
      document.body.style.paddingBottom = '0';
    });
    document.body.style.paddingBottom = '60px';
  }

  /* ── ANIMATE ON SCROLL ─────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.card, .stat-box, .elig-step, .accordion-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(el);
  });

  /* ── SMOOTH INTERNAL LINKS ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  /* ── NAV SCROLL SHADOW ─────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20 ? '0 4px 32px rgba(0,0,0,.4)' : '0 4px 24px rgba(0,0,0,.3)';
    });
  }

  /* ── ACTIVE NAV LINK ───────────────────────────────── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path || a.getAttribute('href') === path.replace('/index.html','')) {
      a.style.color = 'var(--gold-light)';
    }
  });
});

/* =========================================================
   SETTLEMENT CALCULATOR ENGINE
   ========================================================= */
function runSettlementCalc() {
  const medBills   = parseFloat(document.getElementById('med-bills')?.value) || 0;
  const futuresMed = parseFloat(document.getElementById('future-med')?.value) || 0;
  const lostWages  = parseFloat(document.getElementById('lost-wages')?.value) || 0;
  const futureLost = parseFloat(document.getElementById('future-lost')?.value) || 0;
  const painMult   = parseFloat(document.getElementById('pain-mult')?.value)  || 1.5;
  const fault      = parseFloat(document.getElementById('fault-pct')?.value)  || 0;
  const severity   = document.getElementById('injury-severity')?.value || 'moderate';

  const multMap = { 'minor': [1.2,1.8], 'moderate': [1.5,3], 'serious': [2.5,5], 'catastrophic': [4,9] };
  const [low, high] = multMap[severity] || [1.5,3];

  const specials = medBills + futuresMed + lostWages + futureLost;
  const painLow  = specials * low;
  const painHigh = specials * high;
  const totalLow  = (specials + painLow)  * (1 - fault / 100);
  const totalHigh = (specials + painHigh) * (1 - fault / 100);

  const fmt = n => '$' + Math.round(n).toLocaleString();

  const resVal   = document.getElementById('result-value');
  const resRange = document.getElementById('result-range');
  if (resVal)   resVal.textContent   = fmt((totalLow + totalHigh) / 2);
  if (resRange) resRange.textContent = `Estimated range: ${fmt(totalLow)} – ${fmt(totalHigh)}`;

  document.getElementById('calc-result-box')?.classList.add('show');
  document.getElementById('calc-result-box')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* =========================================================
   ELIGIBILITY CHECKLIST ENGINE
   ========================================================= */
function selectElig(btn, step, value) {
  // Support both (btn, step, value) and (step, value) signatures
  let actualBtn, actualStep, actualValue;
  if (typeof btn === 'number') {
    actualStep = btn;
    actualValue = step;
    const stepEl = document.getElementById(`elig-step-${actualStep}`);
    if (stepEl) {
      const index = (actualValue === 'yes') ? 0 : 1;
      actualBtn = stepEl.querySelectorAll('.elig-btn')[index];
    }
  } else {
    actualBtn = btn;
    actualStep = step;
    actualValue = value;
  }

  const stepEl = document.getElementById(`elig-step-${actualStep}`);
  if (stepEl) {
    stepEl.querySelectorAll('.elig-btn').forEach(b => b.classList.remove('selected-yes','selected-no'));
    if (actualBtn) {
      actualBtn.classList.add(actualValue === 'yes' ? 'selected-yes' : 'selected-no');
    }
    stepEl.classList.add('answered');
  }

  // Reveal next step
  const next = document.getElementById(`elig-step-${actualStep + 1}`);
  if (next) {
    next.style.display = 'block';
    next.scrollIntoView({ behavior:'smooth', block:'nearest' });
  } else {
    checkEligResult();
  }
}


function checkEligResult() {
  const yesCount = document.querySelectorAll('.elig-btn.selected-yes').length;
  const total    = document.querySelectorAll('.elig-step').length;
  const pct      = Math.round((yesCount / total) * 100);
  const res      = document.getElementById('elig-result');
  if (!res) return;

  const scoreEl = res.querySelector('.elig-score-ring');
  const titleEl = res.querySelector('h3');
  const descEl  = res.querySelector('p');

  if (scoreEl) scoreEl.textContent = pct + '%';
  if (pct >= 70) {
    if (titleEl) titleEl.textContent = 'You May Have a Strong Claim';
    if (descEl)  descEl.textContent  = 'Based on your answers, you appear to meet several key eligibility criteria. We strongly recommend speaking with a personal injury attorney — most offer free consultations and work on contingency (no fee unless you win).';
  } else if (pct >= 40) {
    if (titleEl) titleEl.textContent = 'Possible Claim — Attorney Review Recommended';
    if (descEl)  descEl.textContent  = 'Your situation may qualify, but there are factors that need professional evaluation. A licensed personal injury attorney can give you a definitive answer after reviewing your specific facts.';
  } else {
    if (titleEl) titleEl.textContent = 'Claim May Be Difficult — Verify With an Attorney';
    if (descEl)  descEl.textContent  = 'Based on your answers, there are significant hurdles to a successful claim. That said, every case is different — an attorney consultation (free at most firms) is the only way to be certain.';
  }
  res.classList.add('show');
  res.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* =========================================================
   CONTACT FORM HANDLER
   ========================================================= */
function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  form.style.display = 'none';
  document.getElementById('form-success')?.classList.add('show');
  // In production: POST to backend / third-party intake system
}
document.querySelector('#contact-form')?.addEventListener('submit', handleContactForm);
