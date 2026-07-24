/*=================================
  MAIN.JS
  Setiap fitur dibungkus fungsi terpisah dan dipanggil dari init()
  di bawah — tidak ada variabel global selain namespace tunggal.
==================================*/
(function () {
  'use strict';

  /* ---------- 1. Navigasi mobile (hamburger) ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 2. Highlight nav aktif sesuai scroll ---------- */
  function initActiveNav() {
    var links = document.querySelectorAll('.nav-link');
    var sections = Array.prototype.map.call(links, function (link) {
      var id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    }).filter(Boolean);

    if (!('IntersectionObserver' in window) || !sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = document.querySelector('.nav-link[href="#' + entry.target.id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- 3. Typing animation di hero ---------- */
  function initTyping() {
    var target = document.getElementById('typing-target');
    if (!target) return;

    // Hormati preferensi reduced motion: tampilkan teks statis saja.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var roles = ['Web Developer', 'Frontend Engineer', 'AI-Curious Builder'];
    var roleIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var current = roles[roleIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = current.slice(0, charIndex);

      var delay = deleting ? 40 : 80;

      if (!deleting && charIndex === current.length) {
        delay = 1600;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 300;
      }
      window.setTimeout(tick, delay);
    }
    tick();
  }

  /* ---------- 4. Scroll indicator: sembunyi setelah user scroll ---------- */
  function initScrollIndicator() {
    var indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;
    window.addEventListener('scroll', function () {
      indicator.classList.toggle('is-hidden', window.scrollY > 120);
    }, { passive: true });
  }

  /* ---------- 5. Scroll-reveal untuk kartu (project, blog, dst) ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(
      '.project-card, .blog-card, .cl-badge, .lj-card, .stat-card, .cert-card'
    );
    if (!items.length) return;

    items.forEach(function (item) { item.setAttribute('data-reveal', ''); });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ---------- 6. Tabs Pengalaman ---------- */
  function initExpTabs() {
    var tabs = document.querySelectorAll('.exp-tab');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        tab.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.exp-panel').forEach(function (panel) {
          panel.setAttribute('aria-hidden', 'true');
        });
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.setAttribute('aria-hidden', 'false');
      });

      // Navigasi tab dengan panah kiri/kanan sesuai pola ARIA tabs.
      tab.addEventListener('keydown', function (e) {
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        if (e.key === 'ArrowRight') list[(i + 1) % list.length].focus();
        if (e.key === 'ArrowLeft') list[(i - 1 + list.length) % list.length].focus();
      });
    });
  }

  /* ---------- 7. Modal preview sertifikat ---------- */
  function initCertModal() {
    var grids = document.querySelectorAll('.cert-grid');
    if (!grids.length) return;

    var modal = document.createElement('div');
    modal.className = 'cert-modal';
    modal.id = 'cert-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="cert-modal-content">' +
      '<button class="cert-modal-close" aria-label="Tutup preview sertifikat">Tutup ✕</button>' +
      '<img alt="" id="cert-modal-img">' +
      '<p id="cert-modal-caption"></p>' +
      '</div>';
    document.body.appendChild(modal);

    var closeBtn = modal.querySelector('.cert-modal-close');
    var img = modal.querySelector('#cert-modal-img');
    var caption = modal.querySelector('#cert-modal-caption');
    var lastFocused = null;

    function openModal(card) {
      var thumb = card.querySelector('img');
      var name = card.querySelector('.cert-name');
      var fullSrc = card.getAttribute('data-full') || (thumb ? thumb.src : '');
      img.src = fullSrc;
      img.alt = thumb ? thumb.alt : '';

      var parts = [];
      if (name) parts.push(name.textContent);
      var meta = [card.getAttribute('data-issuer'), card.getAttribute('data-date')].filter(Boolean).join(' · ');
      if (meta) parts.push(meta);
      caption.textContent = parts.join(' — ');

      lastFocused = document.activeElement;
      modal.hidden = false;
      closeBtn.focus();
    }
    function closeModal() {
      modal.hidden = true;
      if (lastFocused) lastFocused.focus();
    }

    grids.forEach(function (grid) {
      grid.addEventListener('click', function (e) {
        var card = e.target.closest('.cert-card');
        if (card) openModal(card);
      });
    });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  /* ---------- 8. Validasi form kontak (tanpa backend) ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('contact-form-status');

    function setError(fieldId, message) {
      var field = document.getElementById(fieldId).closest('.field');
      var error = field.querySelector('.field-error');
      var invalid = Boolean(message);
      field.setAttribute('data-invalid', String(invalid));
      error.hidden = !invalid;
      if (invalid) error.textContent = message;
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name');
      var email = document.getElementById('cf-email');
      var message = document.getElementById('cf-message');
      var valid = true;

      if (!name.value.trim()) { setError('cf-name', 'Nama wajib diisi.'); valid = false; }
      else setError('cf-name', '');

      if (!email.value.trim() || !isValidEmail(email.value.trim())) {
        setError('cf-email', 'Masukkan alamat email yang valid.');
        valid = false;
      } else setError('cf-email', '');

      if (!message.value.trim()) { setError('cf-message', 'Pesan wajib diisi.'); valid = false; }
      else setError('cf-message', '');

      if (!valid) {
        status.dataset.state = 'error';
        status.textContent = 'Periksa kembali kolom yang ditandai di atas.';
        return;
      }

      // Tidak ada backend: form ini menyiapkan link mailto sebagai fallback.
      var subject = encodeURIComponent('Pesan dari Portofolio — ' + name.value.trim());
      var body = encodeURIComponent(message.value.trim() + '\n\n— ' + name.value.trim() + ' (' + email.value.trim() + ')');
      window.location.href = 'mailto:armansyah.dev@gmail.com?subject=' + subject + '&body=' + body;

      status.dataset.state = 'success';
      status.textContent = 'Aplikasi email kamu akan terbuka untuk mengirim pesan ini.';
      form.reset();
    });
  }

  /* ---------- 9. Statistik GitHub, gracefully degrade jika API gagal ---------- */
  function initGithubStats() {
    var section = document.getElementById('github-stats');
    if (!section) return;
    var commitVal = section.querySelector('[aria-label="Jumlah commit"]');
    if (!commitVal) return;

    fetch('https://api.github.com/users/ArmansyahSoft')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API tidak tersedia');
        return res.json();
      })
      .then(function (data) {
        var repoVal = section.querySelector('[aria-label="Jumlah repositori"]');
        if (repoVal && typeof data.public_repos === 'number') {
          repoVal.textContent = data.public_repos + '+';
        }
      })
      .catch(function () {
        // Degradasi anggun: biarkan placeholder statis yang sudah ada di HTML.
        commitVal.textContent = '—';
      });
  }

  /* ---------- 10. Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 11. Footer: tahun & tanggal update otomatis ---------- */
  function initFooterMeta() {
    var year = document.getElementById('footer-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------- Init ---------- */
  function init() {
    initNav();
    initActiveNav();
    initTyping();
    initScrollIndicator();
    initScrollReveal();
    initExpTabs();
    initCertModal();
    initContactForm();
    initGithubStats();
    initBackToTop();
    initFooterMeta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
