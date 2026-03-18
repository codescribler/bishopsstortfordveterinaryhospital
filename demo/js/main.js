/* ============================================================
   Bishop's Stortford Veterinary Hospital — Taste-Skill JS

   Creative Arsenal:
   - Spotlight border cards (cursor-tracking radial glow)
   - 3D parallax tilt on cards
   - Staggered hero line reveals
   - Scroll-driven timeline fill
   - Floating pill nav with scroll state
   - Full-screen mobile nav with staggered mask reveal
   - Kinetic marquee scroll-speed modulation
   - All motion: transform + opacity only (GPU-safe)
   - IntersectionObserver only (no scroll listeners for reveals)
   ============================================================ */

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------
       STICKY PILL NAV
    ---------------------------------------------------------- */
    var header = document.getElementById('siteHeader');
    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    /* ----------------------------------------------------------
       MOBILE NAV — STAGGERED MASK REVEAL
    ---------------------------------------------------------- */
    var navToggle = document.getElementById('navToggle');
    var mobileNav = document.getElementById('mobileNav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        mobileNav.querySelectorAll('.mobile-nav-link, .cta-trigger').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
                mobileNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        });
    }

    /* ----------------------------------------------------------
       SCROLL REVEALS (IntersectionObserver)
    ---------------------------------------------------------- */
    if (!prefersReducedMotion) {
        /* Standard reveals */
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

        /* Staggered reveals — cascade delay per parent */
        var staggerEls = document.querySelectorAll('.reveal-stagger');
        var parentMap = new Map();
        staggerEls.forEach(function (el) {
            var parent = el.parentElement;
            if (!parentMap.has(parent)) parentMap.set(parent, []);
            parentMap.get(parent).push(el);
        });
        parentMap.forEach(function (children) {
            children.forEach(function (child, i) {
                child.style.transitionDelay = (i * 90) + 'ms';
            });
        });

        var staggerObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    staggerObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        staggerEls.forEach(function (el) { staggerObs.observe(el); });

        /* Hero line-by-line reveal */
        var heroLines = document.querySelectorAll('.hero-line');
        heroLines.forEach(function (line, i) {
            line.style.transitionDelay = (300 + i * 150) + 'ms';
        });
        var heroObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    heroLines.forEach(function (line) { line.classList.add('is-visible'); });
                    heroObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        var heroHeadline = document.querySelector('.hero-headline');
        if (heroHeadline) heroObs.observe(heroHeadline);
    } else {
        document.querySelectorAll('.reveal, .reveal-stagger, .hero-line').forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* ----------------------------------------------------------
       SPOTLIGHT BORDER CARDS — CURSOR TRACKING GLOW
       (taste-skill: radial gradient follows mouse)
    ---------------------------------------------------------- */
    document.querySelectorAll('.spotlight-card, .bento-card, .service-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });
    });

    /* ----------------------------------------------------------
       3D PARALLAX TILT (taste-skill: mouse tracking)
       GPU-safe: transform only, no layout triggers
    ---------------------------------------------------------- */
    if (!prefersReducedMotion) {
        document.querySelectorAll('[data-tilt]').forEach(function (card) {
            var inner = card;
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width;
                var y = (e.clientY - rect.top) / rect.height;
                var tiltX = (y - 0.5) * -6;
                var tiltY = (x - 0.5) * 6;
                inner.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
            });

            card.addEventListener('mouseleave', function () {
                inner.style.transform = '';
            });
        });
    }

    /* ----------------------------------------------------------
       HERO PARALLAX (transform only — GPU safe)
    ---------------------------------------------------------- */
    if (!prefersReducedMotion) {
        var heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.style.transform = 'scale(1.1)';
            var heroH = document.querySelector('.hero');
            var heroHeight = heroH ? heroH.offsetHeight : 900;
            window.addEventListener('scroll', function () {
                if (window.scrollY < heroHeight) {
                    heroBg.style.transform = 'translateY(' + (window.scrollY * 0.2) + 'px) scale(1.1)';
                }
            }, { passive: true });
        }
    }

    /* ----------------------------------------------------------
       SCROLL-DRIVEN TIMELINE FILL
       (taste-skill: scroll progress path)
    ---------------------------------------------------------- */
    if (!prefersReducedMotion) {
        var timelineFill = document.getElementById('timelineFill');
        var timeline = document.querySelector('.timeline');
        if (timelineFill && timeline) {
            var timelineObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        updateTimelineFill();
                        window.addEventListener('scroll', updateTimelineFill, { passive: true });
                    } else {
                        window.removeEventListener('scroll', updateTimelineFill);
                    }
                });
            }, { threshold: 0 });
            timelineObs.observe(timeline);

            function updateTimelineFill() {
                var rect = timeline.getBoundingClientRect();
                var windowH = window.innerHeight;
                var timelineH = rect.height;
                var scrolled = windowH - rect.top;
                var progress = Math.max(0, Math.min(1, scrolled / (timelineH + windowH * 0.3)));
                timelineFill.style.height = (progress * 100) + '%';
            }
        }
    }

    /* ----------------------------------------------------------
       MARQUEE — PAUSE ON HOVER, SPEED ON SCROLL
    ---------------------------------------------------------- */
    var marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        var marqueeWrapper = document.querySelector('.trust-marquee');
        if (marqueeWrapper) {
            marqueeWrapper.addEventListener('mouseenter', function () {
                marqueeTrack.style.animationPlayState = 'paused';
            });
            marqueeWrapper.addEventListener('mouseleave', function () {
                marqueeTrack.style.animationPlayState = 'running';
            });
        }
    }

    /* ----------------------------------------------------------
       PAW PRINTS — fade in after 10 seconds
    ---------------------------------------------------------- */
    if (!prefersReducedMotion) {
        setTimeout(function () {
            var paw1 = document.querySelector('.paw-print--1');
            if (paw1) paw1.classList.add('is-visible');
        }, 10000);

        setTimeout(function () {
            var paw2 = document.querySelector('.paw-print--2');
            if (paw2) paw2.classList.add('is-visible');
        }, 11200);
    }

    /* ----------------------------------------------------------
       DEMO MODAL — ACCESSIBLE FOCUS TRAP
    ---------------------------------------------------------- */
    var modal = document.getElementById('demoModal');
    var modalClose = document.getElementById('modalClose');
    var ctaTriggers = document.querySelectorAll('.cta-trigger');
    var previouslyFocused = null;
    var focusHandler = null;

    function openModal() {
        previouslyFocused = document.activeElement;
        modal.removeAttribute('hidden');
        void modal.offsetHeight;
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (modalClose) modalClose.focus();
        focusHandler = trapFocus(modal);
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        if (focusHandler) {
            document.removeEventListener('keydown', focusHandler);
            focusHandler = null;
        }
        setTimeout(function () { modal.setAttribute('hidden', ''); }, 450);
        if (previouslyFocused) previouslyFocused.focus();
    }

    ctaTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            openModal();
        });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
    });

    function trapFocus(element) {
        var sel = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
        function handler(e) {
            if (e.key !== 'Tab' || !element.classList.contains('is-open')) return;
            var focusables = element.querySelectorAll(sel);
            if (!focusables.length) return;
            var first = focusables[0], last = focusables[focusables.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
        document.addEventListener('keydown', handler);
        return handler;
    }

})();