/* ================================================================
   AMUTHA KARUVELAMUTHU — PORTFOLIO INTERACTIONS
   The portfolio assistant uses a local, verified knowledge base.
   It sends no messages to an API or external service.
   ================================================================ */

(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('#scroll-progress-bar');
  const themeToggle = document.querySelector('.theme-toggle');
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('#mobile-nav');
  const assistantDialog = document.querySelector('#portfolio-assistant');
  const assistantClose = document.querySelector('.assistant-close');
  const assistantForm = document.querySelector('#assistant-form');
  const assistantInput = document.querySelector('#assistant-input');
  const chatLog = document.querySelector('#chat-log');
  const toast = document.querySelector('#toast');
  let lastFocusedElement = null;
  let toastTimer = null;
  let replyTimer = null;

  // Theme ---------------------------------------------------------
  const getPreferredTheme = () => {
    try {
      const saved = localStorage.getItem('amutha-portfolio-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {
      // The site still works if storage is disabled.
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    themeToggle?.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070a13' : '#f5f8fc');
  };

  applyTheme(getPreferredTheme());

  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try { localStorage.setItem('amutha-portfolio-theme', nextTheme); } catch (_) { /* no-op */ }
  });

  // Header, progress, and active navigation ----------------------
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)) : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
    header?.classList.toggle('is-scrolled', scrollTop > 16);
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });

  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const activeSectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -58% 0px', threshold: [0, .2, .5] });
    observedSections.forEach((section) => activeSectionObserver.observe(section));
  }

  // Mobile navigation --------------------------------------------
  const closeMobileNav = () => {
    if (!mobileNav || !mobileMenuButton) return;
    mobileNav.hidden = true;
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Open navigation');
  };

  mobileMenuButton?.addEventListener('click', () => {
    const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileNav.hidden = isOpen;
    mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  });

  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileNav));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileNav();
  });

  // Scroll reveal -------------------------------------------------
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Local portfolio assistant ------------------------------------
  const assistantKnowledge = [
    {
      matches: (q) => /\b(hello|hi|hey|good morning|good evening)\b/.test(q),
      answer: 'Hello! I can help you explore Amutha’s IBM Sterling expertise, installation and configuration capabilities, integration work, web skills, and live projects. What interests you most?'
    },
    {
      matches: (q) => /\b(install|installation|setup|set up|deploy|deployment|configure|configuration)\b/.test(q),
      answer: 'Amutha has hands-on capability installing and configuring both IBM Sterling Order Management System and IBM Sterling B2B Integrator for enterprise environments. Her scope also includes platform workflow configuration, integration support, monitoring, and troubleshooting.'
    },
    {
      matches: (q) => /(oms|order management).*(integrat|connect|other product|downstream)|(integrat|connect).*(oms|order management)/.test(q),
      answer: 'Amutha can connect IBM Sterling OMS with IBM Sterling B2B Integrator and other downstream enterprise products. Her portfolio covers the end-to-end path from order orchestration and lifecycle configuration to B2B document exchange and connected system flows. Specific client systems and confidential implementation details are intentionally not published.'
    },
    {
      matches: (q) => /\b(oms|order management|order orchestration|fulfilment|fulfillment|inventory)\b/.test(q),
      answer: 'Amutha’s IBM Sterling OMS experience includes product installation and enterprise configuration, order orchestration and lifecycle setup, fulfilment and inventory rules, integration with B2Bi and downstream systems, plus support and issue resolution across order flows.'
    },
    {
      matches: (q) => /\b(b2bi|b2b integrator|sterling integrator|edi|edifact|x12|bpml|trading partner|document translation)\b/.test(q),
      answer: 'With IBM Sterling B2B Integrator, Amutha has hands-on experience in installation and configuration, EDI mapping and X12 / EDIFACT translation, trading-partner onboarding, BPML business processes, workflow automation, monitoring, error handling, and troubleshooting.'
    },
    {
      matches: (q) => /\b(frontend|front-end|full stack|angular|typescript|javascript|rxjs|ionic|web|firebase|css|html)\b/.test(q),
      answer: 'Amutha builds responsive web applications using Angular, TypeScript, JavaScript, RxJS, HTML, CSS / SCSS, Bootstrap, Tailwind CSS, Ionic, Firebase, and Realtime Database. Her work combines component-oriented implementation with clear, user-friendly interfaces.'
    },
    {
      matches: (q) => /\b(project|projects|portfolio|work|freshcart|chatly|live app|live project)\b/.test(q),
      answer: 'Amutha has two featured live applications. Freshcart is a grocery e-commerce experience built with Angular, Bootstrap, JavaScript, and Firebase. Chatly is a real-time communication experience built with Ionic and Firebase Realtime Database. You can open both from the “Selected work” section.'
    },
    {
      matches: (q) => /\b(skill|skills|technology|technologies|tech stack|toolkit|expertise)\b/.test(q),
      answer: 'Amutha’s toolkit spans enterprise integration and modern application development: IBM Sterling OMS, IBM Sterling B2B Integrator, EDI, X12, EDIFACT, BPML, order lifecycle and fulfilment configuration, Angular, TypeScript, JavaScript, RxJS, Ionic, Firebase, Node.js, HTML, and CSS / SCSS.'
    },
    {
      matches: (q) => /\b(protocol|api|soap|rest|sftp|mq|version|database|operating system|linux)\b/.test(q),
      answer: 'The verified public portfolio currently lists EDI with X12 / EDIFACT, BPML workflows, OMS-to-B2Bi integration, and downstream product integration. It does not publish specific product versions, operating systems, databases, or additional protocols. Please contact Amutha for implementation-specific details.'
    },
    {
      matches: (q) => /\b(year|years|how long|duration|experience level)\b/.test(q),
      answer: 'This portfolio focuses on verified hands-on capabilities and does not currently state a duration for the IBM Sterling experience. Contact Amutha for the latest employment timeline and experience details.'
    },
    {
      matches: (q) => /\b(certification|certified|certificate)\b/.test(q),
      answer: 'No IBM or AI certification is claimed in this portfolio. For current certification details, please contact Amutha directly.'
    },
    {
      matches: (q) => /\b(resume|résumé|cv)\b/.test(q),
      answer: 'You can request Amutha’s latest résumé using the “Request my résumé” button in the contact section. This avoids presenting an outdated document on the website.'
    },
    {
      matches: (q) => /\b(contact|email|hire|hiring|opportunity|connect|reach)\b/.test(q),
      answer: 'You can contact Amutha at amuthak0409@gmail.com or use the contact buttons near the bottom of this page. Her GitHub profile is linked there as well.'
    },
    {
      matches: (q) => /\b(location|based|where)\b/.test(q),
      answer: 'Amutha is based in Tirunelveli, Tamil Nadu, India.'
    },
    {
      matches: (q) => /\b(ai|assistant|chatbot|privacy|data)\b/.test(q),
      answer: 'This is a privacy-friendly, local portfolio assistant. It uses a compact JavaScript knowledge base made only from verified portfolio content. Your messages are processed in the browser and are not sent to an external AI service.'
    }
  ];

  const fallbackAnswer = 'I can answer questions about IBM Sterling OMS, IBM Sterling B2B Integrator, installation and configuration, OMS integrations, front-end skills, live projects, résumé access, or contact details. Try asking one of those topics.';

  const answerQuestion = (question) => {
    const normalized = question.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
    const item = assistantKnowledge.find((entry) => entry.matches(normalized));
    return item ? item.answer : fallbackAnswer;
  };

  const appendMessage = (text, type) => {
    const message = document.createElement('div');
    message.className = `message ${type === 'user' ? 'user-message' : 'assistant-message'}`;

    if (type !== 'user') {
      const avatar = document.createElement('span');
      avatar.className = 'message-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = 'AK';
      message.appendChild(avatar);
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    content.appendChild(paragraph);
    message.appendChild(content);
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
    return message;
  };

  const appendTyping = () => {
    const typing = document.createElement('div');
    typing.className = 'message assistant-message typing-message';
    typing.setAttribute('aria-label', 'Portfolio assistant is preparing an answer');
    typing.innerHTML = '<span class="message-avatar" aria-hidden="true">AK</span><div class="message-content" aria-hidden="true"><i></i><i></i><i></i></div>';
    chatLog.appendChild(typing);
    chatLog.scrollTop = chatLog.scrollHeight;
    return typing;
  };

  const submitQuestion = (question) => {
    const cleanQuestion = String(question || '').trim().slice(0, 240);
    if (!cleanQuestion) return;

    if (replyTimer) window.clearTimeout(replyTimer);
    chatLog.querySelector('.typing-message')?.remove();
    appendMessage(cleanQuestion, 'user');
    const typing = appendTyping();
    assistantInput.value = '';
    assistantInput.focus();

    const response = answerQuestion(cleanQuestion);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.min(850, 360 + response.length);
    replyTimer = window.setTimeout(() => {
      typing.remove();
      appendMessage(response, 'assistant');
      replyTimer = null;
    }, delay);
  };

  const openAssistant = (question = '') => {
    if (!assistantDialog) return;
    lastFocusedElement = document.activeElement;
    closeMobileNav();
    if (!assistantDialog.open) {
      if (typeof assistantDialog.showModal === 'function') assistantDialog.showModal();
      else assistantDialog.setAttribute('open', '');
    }
    window.setTimeout(() => {
      assistantInput?.focus();
      if (question) submitQuestion(question);
    }, 80);
  };

  const closeAssistant = () => {
    if (!assistantDialog?.open) return;
    if (replyTimer) {
      window.clearTimeout(replyTimer);
      replyTimer = null;
      chatLog.querySelector('.typing-message')?.remove();
    }
    if (typeof assistantDialog.close === 'function') assistantDialog.close();
    else assistantDialog.removeAttribute('open');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  document.querySelectorAll('[data-open-assistant]').forEach((button) => {
    button.addEventListener('click', () => openAssistant());
  });

  document.querySelectorAll('[data-question]').forEach((button) => {
    button.addEventListener('click', () => {
      const question = button.dataset.question || button.textContent;
      openAssistant(question);
    });
  });

  assistantClose?.addEventListener('click', closeAssistant);
  assistantDialog?.addEventListener('click', (event) => {
    const rect = assistantDialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) closeAssistant();
  });

  assistantForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitQuestion(assistantInput.value);
  });

  // Clipboard helper ---------------------------------------------
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  document.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
    const email = 'amuthak0409@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch (_) {
      const helper = document.createElement('textarea');
      helper.value = email;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      showToast(copied ? 'Email copied to clipboard' : email);
    }
  });

  // Keep the copyright current without changing the portfolio copy.
  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
