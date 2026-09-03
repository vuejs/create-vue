/* ============================================================
   MedHub24 — Shared application logic
   - SPA routing between pages (Home / Checkup / Surgery / Travel)
   - Shared UI behavior for all locales
   ============================================================ */

const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_BUTTON_META = {
    en: {
        label: 'EN',
        value: 'KH',
        aria: 'Switch to Khmer'
    },
    km: {
        label: 'KH',
        value: 'EN',
        aria: 'ប្តូរទៅភាសាអង់គ្លេស'
    }
};

function updateLanguageButtons(lang) {
    const safeLang = lang === 'km' ? 'km' : DEFAULT_LANGUAGE;
    const meta = LANGUAGE_BUTTON_META[safeLang] || LANGUAGE_BUTTON_META[DEFAULT_LANGUAGE];
    document.querySelectorAll('.desktop-language-badge, .mobile-language-toggle').forEach(toggle => {
        toggle.dataset.lang = safeLang;
        toggle.setAttribute('aria-label', meta.aria);

        const label = toggle.querySelector('.language-label');
        const value = toggle.querySelector('.language-value');

        if (label) label.textContent = meta.label;
        if (value) value.textContent = meta.value;
    });
}

window.updateLanguageButtons = updateLanguageButtons;

function applyLanguage(lang) {
    const safeLang = lang === 'km' ? 'km' : DEFAULT_LANGUAGE;
    if (typeof window.MEDHUB_I18N?.setLanguage === 'function') {
        window.MEDHUB_I18N.setLanguage(safeLang);
    } else {
        document.documentElement.lang = safeLang;
        document.body.dataset.lang = safeLang;
        updateLanguageButtons(safeLang);
    }
}

function navigateTo(pageId, el) {
    const safePageId = String(pageId || 'home').trim();
    const targetPageId = document.getElementById(`page-${safePageId}`) ? safePageId : 'home';
    const pages = document.querySelectorAll('.page-content');

    pages.forEach(page => {
        page.classList.toggle('active', page.id === `page-${targetPageId}`);
    });

    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const targetTab = el && el.classList && el.classList.contains('nav-tab')
        ? el
        : Array.from(tabs).find(tab => {
            const onclick = tab.getAttribute('onclick') || '';
            return onclick.includes(`'${targetPageId}'`);
        });

    if (targetTab) {
        targetTab.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'auto' });

    if (targetPageId === 'travel' && typeof setupRoute === 'function') {
        requestAnimationFrame(() => {
            requestAnimationFrame(setupRoute);
        });
    }
}

function getRequestedPage() {
    const validPages = ['home', 'checkup', 'surgery', 'travel', 'accommodation'];
    const params = new URLSearchParams(window.location.search);
    const pageParam = (params.get('page') || '').toLowerCase().trim();
    return validPages.includes(pageParam) ? pageParam : 'home';
}

function applyInitialRoute() {
    const requestedPage = getRequestedPage();
    const tabs = document.querySelectorAll('.nav-tab');
    const targetTab = Array.from(tabs).find(tab => {
        const onclick = tab.getAttribute('onclick') || '';
        return onclick.includes(`'${requestedPage}'`);
    });

    navigateTo(requestedPage, targetTab || undefined);
}

window.addEventListener('DOMContentLoaded', () => {
    applyInitialRoute();
    const currentLanguage = window.MEDHUB_I18N?.getLanguage?.() || DEFAULT_LANGUAGE;
    updateLanguageButtons(currentLanguage);
});

window.applyMedHub24Language = applyLanguage;

(function () {
    const revealItems = document.querySelectorAll('.home-reveal, .checkup-reveal, .surgery-reveal, .stay-reveal');
    if (!revealItems.length) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        revealItems.forEach(item => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
        observer.observe(item);
    });
})();

(function () {
    const routeTrack = document.getElementById('travelJourneyTrack');
    if (!routeTrack) {
        return;
    }

    const svg = routeTrack.querySelector('.travel-route-svg');
    if (!svg) {
        return;
    }

    const pathFg = svg.querySelector('.travel-route-fg');
    const pathBg = svg.querySelector('.travel-route-bg');
    const progressDot = svg.querySelector('.travel-route-progress-dot');
    const progressPlane = svg.querySelector('.travel-route-progress-plane');
    const milestones = routeTrack.querySelectorAll('.travel-milestone');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!pathFg || !pathBg || !progressPlane) {
        return;
    }

    window.setupRoute = function setupRoute() {
        requestAnimationFrame(() => {
            try {
                const trackHeight = Math.max(1, routeTrack.offsetHeight);
                if (trackHeight < 2) return;

                const svgWidth = 44;

                svg.setAttribute('width', svgWidth);
                svg.setAttribute('height', trackHeight);
                svg.style.width = svgWidth + 'px';
                svg.style.height = trackHeight + 'px';
                svg.setAttribute('viewBox', `0 0 ${svgWidth} ${trackHeight}`);

                const trackRect = routeTrack.getBoundingClientRect();
                const centerX = svgWidth / 2;
                const points = [];
                const startDot = routeTrack.querySelector('.travel-endpoint-start .travel-dot');
                if (startDot) {
                    const r = startDot.getBoundingClientRect();
                    points.push(r.top - trackRect.top + r.height / 2);
                }

                milestones.forEach(milestone => {
                    const node = milestone.querySelector('.travel-node');
                    if (node) {
                        const r = node.getBoundingClientRect();
                        points.push(r.top - trackRect.top + r.height / 2);
                    }
                });

                const endDot = routeTrack.querySelector('.travel-endpoint-end .travel-dot');
                if (endDot) {
                    const r = endDot.getBoundingClientRect();
                    points.push(r.top - trackRect.top + r.height / 2);
                }

                if (points.length < 2) {
                    return;
                }

                const amplitude = Math.min(svgWidth * 0.28, 11);
                let pathData = `M ${centerX} ${points[0].toFixed(2)}`;
                for (let i = 1; i < points.length; i += 1) {
                    const previousY = points[i - 1];
                    const currentY = points[i];
                    const direction = (i - 1) % 2 === 0 ? 1 : -1;
                    const controlX = centerX + direction * amplitude;
                    const segment = Math.max(1, currentY - previousY);
                    const c1y = previousY + segment * 0.35;
                    const c2y = previousY + segment * 0.65;
                    pathData += ` C ${controlX.toFixed(2)} ${c1y.toFixed(2)}, ${controlX.toFixed(2)} ${c2y.toFixed(2)}, ${centerX} ${currentY.toFixed(2)}`;
                }

                pathBg.setAttribute('d', pathData);
                pathFg.setAttribute('d', pathData);

                if (!prefersReducedMotion) {
                    const length = pathFg.getTotalLength();
                    pathFg.style.strokeDasharray = length;
                    pathFg.style.strokeDashoffset = length;
                    pathFg.dataset.length = length;
                    pathFg.dataset.startY = points[0];
                    pathFg.dataset.endY = points[points.length - 1];
                } else {
                    pathFg.style.strokeDasharray = 'none';
                    pathFg.style.strokeDashoffset = 0;
                }

                if (progressDot) {
                    progressDot.setAttribute('cx', 0);
                    progressDot.setAttribute('cy', 0);
                }

                progressPlane.setAttribute('transform', `translate(${centerX} ${points[0]})`);
                progressPlane.style.opacity = prefersReducedMotion ? '0.55' : '1';
                document.documentElement.classList.add('travel-js-ready');
                updateRouteProgress();
            } catch (error) {
                console.warn('MedHub24 route setup failed:', error);
            }
        });
    };

    function updateRouteProgress() {
        if (!pathFg || prefersReducedMotion) {
            milestones.forEach(milestone => milestone.classList.add('visible'));
            return;
        }

        const routeTop = routeTrack.getBoundingClientRect().top + window.scrollY;
        const startY = parseFloat(pathFg.dataset.startY || '0');
        const endY = parseFloat(pathFg.dataset.endY || '0');
        const viewportCenter = window.innerHeight / 2;
        const routeLength = Math.max(1, endY - startY);
        const startScroll = routeTop + startY - viewportCenter;
        let progress = (window.scrollY - startScroll) / routeLength;
        progress = Math.max(0, Math.min(1, progress));

        const length = parseFloat(pathFg.dataset.length || '0');
        if (!length) {
            return;
        }

        pathFg.style.strokeDashoffset = length * (1 - progress);

        const point = pathFg.getPointAtLength(length * progress);
        progressPlane.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
        progressPlane.style.opacity = progress > 0.015 && progress < 0.985 ? '1' : '0.65';

        milestones.forEach((milestone, index) => {
            const itemRect = milestone.getBoundingClientRect();
            const itemMidpoint = itemRect.top + itemRect.height * 0.5;
            const isCurrent = itemMidpoint < window.innerHeight * 0.68 && itemMidpoint > window.innerHeight * 0.16;
            milestone.classList.toggle('is-current', isCurrent);
            milestone.classList.toggle('is-passed', itemMidpoint < window.innerHeight * 0.5 && progress > (index + 1) / (milestones.length + 1));
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

    milestones.forEach(milestone => observer.observe(milestone));

    let scrollTicking = false;
    function onScroll() {
        if (scrollTicking) {
            return;
        }

        scrollTicking = true;
        requestAnimationFrame(() => {
            updateRouteProgress();
            scrollTicking = false;
        });
    }

    let resizeTimer;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setupRoute, 120);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', setupRoute);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setupRoute);
    }

    setupRoute();
})();
