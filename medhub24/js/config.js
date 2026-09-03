/* ============================================================
   MedHub24 — Theme + admin schema
   The Tailwind CDN has been removed; the palette and the
   utilities the markup uses now live in css/tailwind-shim.css.
   This object is kept only so any tooling that reads the theme
   keeps working, and is guarded so it cannot throw.
   ============================================================ */
window.tailwind = window.tailwind || {};
window.MEDHUB24_THEME = window.tailwind.config = {
    theme: {
        extend: {
            colors: {
                navy: '#12324D',
                coral: '#D86D61',
                mint: '#40B9B0',
                lightbg: '#F8F5EE'
            },
            fontFamily: {
                heading: ['Poppins', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
                body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
                khmerHeading: ['MedHub Khmer', 'Koh Santepheap', 'Noto Sans Khmer', 'sans-serif'],
                khmerBody: ['MedHub Khmer', 'Koh Santepheap', 'Noto Sans Khmer', 'sans-serif'],
                khmerDisplay: ['MedHub Khmer Display', 'Angkor', 'Koh Santepheap', 'sans-serif']
            }
        }
    }
};

window.MEDHUB24_ADMIN_SCHEMA = {
    version: 1,
    languages: {
        default: 'en',
        supported: ['en', 'km'],
        headlineFontKhmer: 'Angkor',
        supportingHeadlineFontKhmer: 'Koh Santepheap',
        bodyFontKhmer: 'Koh Santepheap'
    },
    brand: {
        name: 'MedHub24',
        promise: 'Premium medical tourism management for Cambodian patients',
        markets: ['Malaysia', 'Singapore', 'Thailand'],
        editableFields: ['brand.logo', 'brand.footerLogo']
    },
    contacts: {
        facebookLabel: 'Health Speaker',
        facebookUrl: 'https://www.facebook.com/healthspeakers',
        editableFields: ['contacts.facebook', 'contacts.phone']
    },
    designModes: {
        home: ['premium-concierge'],
        checkup: ['premium-showcase'],
        surgery: ['premium-showcase'],
        travel: ['premium-flow'],
        accommodation: ['premium-stay']
    },
    editableTypes: ['brand', 'title', 'text', 'image', 'url', 'phone', 'cta'],
    pages: {
        home: {
            sections: ['home.hero', 'home.story', 'home.usp', 'home.paths'],
            primaryFields: ['home.hero.title', 'home.hero.backgroundImage', 'home.manager.photo', 'home.story.routeImage', 'home.usp.title']
        },
        checkup: {
            sections: ['checkup.hero', 'checkup.story', 'checkup.route', 'checkup.cta'],
            primaryFields: ['checkup.hero.title', 'checkup.hero.backgroundImage', 'checkup.story.title']
        },
        surgery: {
            sections: ['surgery.hero', 'surgery.story', 'surgery.route', 'surgery.cta'],
            primaryFields: ['surgery.hero.title', 'surgery.hero.backgroundImage', 'surgery.story.title']
        },
        travel: {
            sections: ['travel.hero', 'travel.story', 'travel.route', 'travel.cta'],
            primaryFields: ['travel.hero.title', 'travel.hero.backgroundImage', 'travel.story.title']
        },
        accommodation: {
            sections: ['accommodation.hero', 'accommodation.story.price', 'accommodation.story.route', 'accommodation.story.recovery', 'accommodation.route', 'accommodation.cta'],
            primaryFields: ['accommodation.hero.title', 'accommodation.hero.backgroundImage', 'accommodation.story.title']
        }
    }
};

window.getMedHub24EditableFields = function getMedHub24EditableFields(root) {
    const scope = root || document;
    const fields = new Map();

    Array.from(scope.querySelectorAll('[data-admin-field]')).forEach((element) => {
        const field = element.dataset.adminField;
        const item = {
            field,
            type: element.dataset.adminType || 'text',
            page: element.closest('[data-admin-page]')?.dataset.adminPage || 'global',
            section: element.closest('[data-admin-section]')?.dataset.adminSection || null,
            visible: !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
            value: element.tagName === 'IMG'
                ? element.getAttribute('src')
                : element.tagName === 'A'
                    ? element.getAttribute('href')
                    : element.textContent.trim()
        };

        if (!fields.has(field) || (!fields.get(field).visible && item.visible)) {
            fields.set(field, item);
        }
    });

    return Array.from(fields.values()).map(({ visible, ...item }) => item);
};
