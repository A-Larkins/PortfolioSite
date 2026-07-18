(function () {
    "use strict";

    /* ------------------------------------------------------------ Navbar */

    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', () => {
        const open = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!open));
        navMenu.classList.toggle('is-open', !open);
    });

    // Close the mobile menu after picking a destination
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('is-open');
        });
    });

    /* ------------------------------------------- Scroll-driven UI states */

    const scrollTopBtn = document.querySelector('.scroll-top');
    const sections = [...document.querySelectorAll('section[id]')];
    const navLinks = [...navMenu.querySelectorAll('a[href^="#"]')];

    function onScroll() {
        const y = window.scrollY;

        nav.classList.toggle('is-scrolled', y > 20);
        scrollTopBtn.classList.toggle('is-visible', y > 400);

        // Highlight the section currently under the navbar
        const marker = y + nav.offsetHeight + 80;
        let current = null;
        sections.forEach(section => {
            if (section.offsetTop <= marker) current = section.id;
        });

        navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { onScroll(); ticking = false; });
    }, { passive: true });
    onScroll();

    /* --------------------------------------------- Smooth anchor scroll */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const top = href === '#top' ? 0 : target.offsetTop - nav.offsetHeight + 1;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ------------------------------------------------- Reveal on scroll */

    const revealTargets = [...document.querySelectorAll(
        '.proj-card, .skill-group, .timeline-item, .cred-item, .about-body, .contact-form'
    )];

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        // Only animate what starts off-screen. Anything already in view — including
        // on a deep link like /#projects — renders immediately rather than waiting
        // on the observer, so content is never left invisible.
        revealTargets.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) return;
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    /* -------------------------------------------------------- Modal */

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const cache = new Map();
    let lastFocused = null;

    function paragraphs(text) {
        return text
            .trim()
            .split(/\n\s*\n/)
            .map(block => `<p>${block.trim().replace(/\n/g, ' ')}</p>`)
            .join('');
    }

    async function openModal(trigger) {
        const slug = trigger.dataset.modal;
        if (!slug) return;

        lastFocused = trigger;
        modalTitle.textContent = trigger.querySelector('h3').textContent;
        modalBody.innerHTML = '<p>Loading…</p>';

        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.querySelector('.modal-close').focus();

        if (cache.has(slug)) {
            modalBody.innerHTML = cache.get(slug);
            return;
        }

        try {
            const response = await fetch(`content/${slug}.txt`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = paragraphs(await response.text());
            cache.set(slug, html);
            modalBody.innerHTML = html;
        } catch (error) {
            console.error('Error loading modal content:', error);
            modalBody.innerHTML = '<p>Sorry — that content failed to load.</p>';
        }
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', () => openModal(trigger));
        trigger.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(trigger);
            }
        });
    });

    modal.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    /* --------------------------------------------------------- Footer */

    document.getElementById('year').textContent = new Date().getFullYear();

})();
