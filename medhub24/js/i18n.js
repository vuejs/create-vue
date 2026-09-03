(function () {
    const DEFAULT_LANGUAGE = 'en';
    const STORAGE_KEY = 'medhub24.lang';
    const KHMER_DRAFT_KEY = 'medhub24.khmerDraft';
    const state = {
        language: null,
        originalTextNodes: new WeakMap(),
        reverseLocaleCache: null,
        khmerDraft: null,
        syncChannel: null
    };

    function normalizeLanguage(lang) {
        return lang === 'km' ? 'km' : DEFAULT_LANGUAGE;
    }

    function getRequestedLanguage() {
        const params = new URLSearchParams(window.location.search);
        const requested = (params.get('lang') || '').toLowerCase().trim();
        return requested === 'km' || requested === DEFAULT_LANGUAGE ? requested : null;
    }

    function readStoredLanguage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === 'km' || stored === DEFAULT_LANGUAGE ? stored : null;
        } catch (error) {
            return null;
        }
    }

    function getLanguage() {
        return state.language || getRequestedLanguage() || readStoredLanguage() || DEFAULT_LANGUAGE;
    }

    function getLocale(lang) {
        const safeLang = normalizeLanguage(lang);
        const baseLocale = window.MEDHUB_LOCALES?.[safeLang] || window.MEDHUB_LOCALES?.[DEFAULT_LANGUAGE] || {};
        if (safeLang === 'km' && state.khmerDraft) {
            return { ...baseLocale, ...state.khmerDraft };
        }
        return baseLocale;
    }

    function readKhmerDraft() {
        try {
            const rawDraft = localStorage.getItem(KHMER_DRAFT_KEY);
            if (!rawDraft) {
                return null;
            }

            const parsedDraft = JSON.parse(rawDraft);
            return parsedDraft && typeof parsedDraft === 'object' ? parsedDraft : null;
        } catch (error) {
            return null;
        }
    }

    function refreshKhmerDraft() {
        state.khmerDraft = readKhmerDraft();
        if (getLanguage() === 'km') {
            applyTranslationNodes('km');
        }
    }

    function stripHtml(value) {
        return String(value ?? '').replace(/<[^>]*>/g, '');
    }

    function normalizeText(value) {
        return stripHtml(value).replace(/\s+/g, ' ').trim();
    }

    function t(key, fallbackValue) {
        const locale = getLocale(getLanguage());
        if (key && Object.prototype.hasOwnProperty.call(locale, key)) {
            return locale[key];
        }

        const defaultLocale = getLocale(DEFAULT_LANGUAGE);
        if (key && Object.prototype.hasOwnProperty.call(defaultLocale, key)) {
            return defaultLocale[key];
        }

        return fallbackValue ?? key ?? '';
    }

    function buildReverseLocale() {
        if (state.reverseLocaleCache) {
            return state.reverseLocaleCache;
        }

        const reverse = new Map();
        Object.entries(getLocale(DEFAULT_LANGUAGE)).forEach(([key, value]) => {
            if (typeof value !== 'string' || value.includes('<')) {
                return;
            }

            const normalized = normalizeText(value);
            if (normalized && !reverse.has(normalized)) {
                reverse.set(normalized, key);
            }
        });

        state.reverseLocaleCache = reverse;
        return reverse;
    }

    function applyMeta(lang) {
        const safeLang = normalizeLanguage(lang);
        document.documentElement.lang = safeLang;

        if (document.body) {
            document.body.dataset.lang = safeLang;
        }

        document.title = t('meta.title', 'MedHub24 | Premium Medical Tourism for Cambodian Patients');

        const description = document.querySelector('meta[name="description"]');
        if (description) {
            description.setAttribute('content', t('meta.description', description.getAttribute('content') || ''));
        }
    }

    function translateDirectNodes(lang) {
        const safeLang = normalizeLanguage(lang);
        document.querySelectorAll('[data-i18n]').forEach((node) => {
            const key = node.dataset.i18n;
            if (!key) {
                return;
            }

            const fallback = node.dataset.i18nFallback || node.textContent.trim();
            const value = t(key, fallback);

            if (node.dataset.i18nHtml === 'true') {
                node.innerHTML = value;
            } else {
                node.textContent = stripHtml(value);
            }
        });

        document.querySelectorAll('[data-i18n-attr]').forEach((node) => {
            const config = node.dataset.i18nAttr;
            if (!config) {
                return;
            }

            const [attributeName, key] = config.split(':');
            if (!attributeName || !key) {
                return;
            }

            const value = t(key, node.getAttribute(attributeName) || '');
            node.setAttribute(attributeName, stripHtml(value));
        });

        return safeLang;
    }

    function shouldTranslateTextNode(node) {
        const parent = node.parentElement;
        if (!parent) {
            return false;
        }

        if (parent.closest('script, style, noscript, svg, [data-i18n], [data-no-i18n]')) {
            return false;
        }

        return !!normalizeText(state.originalTextNodes.get(node) || node.nodeValue);
    }

    function translateLegacyTextNodes(lang) {
        if (!document.body || typeof NodeFilter === 'undefined') {
            return;
        }

        const safeLang = normalizeLanguage(lang);
        const defaultLocale = getLocale(DEFAULT_LANGUAGE);
        const targetLocale = getLocale(safeLang);
        const reverse = buildReverseLocale();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!shouldTranslateTextNode(node)) {
                    return NodeFilter.FILTER_REJECT;
                }

                const original = state.originalTextNodes.get(node) || node.nodeValue;
                return reverse.has(normalizeText(original)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        const textNodes = [];
        let node = walker.nextNode();
        while (node) {
            textNodes.push(node);
            node = walker.nextNode();
        }

        textNodes.forEach((textNode) => {
            if (!state.originalTextNodes.has(textNode)) {
                state.originalTextNodes.set(textNode, textNode.nodeValue);
            }

            const original = state.originalTextNodes.get(textNode);
            const normalized = normalizeText(original);
            const key = reverse.get(normalized);
            if (!key) {
                return;
            }

            const next = stripHtml(targetLocale[key] || defaultLocale[key] || normalized);
            const leading = original.match(/^\s*/)?.[0] || '';
            const trailing = original.match(/\s*$/)?.[0] || '';
            textNode.nodeValue = `${leading}${next}${trailing}`;
        });
    }

    function applyTranslationNodes(lang) {
        const safeLang = translateDirectNodes(lang);
        translateLegacyTextNodes(safeLang);
        applyMeta(safeLang);
    }

    function setLanguage(lang) {
        const safeLang = normalizeLanguage(lang);
        state.language = safeLang;

        try {
            localStorage.setItem(STORAGE_KEY, safeLang);
        } catch (error) {
            // Local storage may be blocked in private browsing.
        }

        const url = new URL(window.location.href);
        url.searchParams.set('lang', safeLang);
        window.history.replaceState({}, '', url.toString());

        applyTranslationNodes(safeLang);

        if (typeof window.updateLanguageButtons === 'function') {
            window.updateLanguageButtons(safeLang);
        }
    }

    window.MEDHUB_I18N = {
        DEFAULT_LANGUAGE,
        normalizeLanguage,
        readStoredLanguage,
        getLanguage,
        setLanguage,
        t,
        applyTranslationNodes,
        applyMeta,
        refreshKhmerDraft
    };

    window.toggleLanguage = function toggleLanguage(button) {
        const current = getLanguage();
        const next = current === 'km' ? DEFAULT_LANGUAGE : 'km';
        setLanguage(next);

        if (button && button.dataset) {
            button.dataset.lang = next;
        }
    };

    if ('BroadcastChannel' in window) {
        state.syncChannel = new BroadcastChannel('medhub24-khmer-copy');
        state.syncChannel.addEventListener('message', (event) => {
            if (event.data?.type === 'khmer-draft-updated') {
                refreshKhmerDraft();
            }
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === KHMER_DRAFT_KEY) {
            refreshKhmerDraft();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        state.khmerDraft = readKhmerDraft();
        setLanguage(getLanguage());
    });
})();
