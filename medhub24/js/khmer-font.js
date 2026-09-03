/* ============================================================
   MedHub24 — Khmer webfont verification
   ------------------------------------------------------------
   Requirement: the approved Khmer face must not be silently
   replaced by a device font. The CSS stack already prefers the
   self-hosted copy, then the network copy, then the device.
   This script reports which one actually won, so a substitution
   is visible instead of shipping unnoticed.

   Sets on <html>:
     data-khmer-font="loaded"   approved face is rendering
     data-khmer-font="fallback" a device font is rendering
   ============================================================ */
(function () {
    'use strict';

    var PROBE = 'ការព្យាបាល';               // Khmer, always present in the copy
    var FACES = ['MedHub Khmer', 'Hanuman'];
    var DISPLAY = ['MedHub Khmer Display', 'Angkor'];

    function faceRenders(family) {
        if (!document.fonts || typeof document.fonts.check !== 'function') {
            return null; // API unavailable — do not claim either way
        }
        try {
            return document.fonts.check('400 16px "' + family + '"', PROBE);
        } catch (error) {
            return null;
        }
    }

    function firstAvailable(families) {
        for (var i = 0; i < families.length; i += 1) {
            if (faceRenders(families[i]) === true) {
                return families[i];
            }
        }
        return null;
    }

    function report() {
        var body = firstAvailable(FACES);
        var display = firstAvailable(DISPLAY);
        var root = document.documentElement;

        if (body === null && faceRenders(FACES[0]) === null) {
            root.setAttribute('data-khmer-font', 'unknown');
            return;
        }

        var state = body ? 'selfhosted' : 'fallback';
        root.setAttribute('data-khmer-font', state);
        root.setAttribute('data-khmer-display-font', display ? 'loaded' : 'fallback');

        if (state === 'fallback') {
            console.warn(
                '[MedHub24] The approved Khmer face is NOT rendering. Khmer text is being drawn ' +
                'by a device font and will not match the approved design. Check that ' +
                'assets/fonts/Hanuman-Regular.ttf is deployed and served as font/ttf. ' +
                'See assets/fonts/FONTS.md.'
            );
        } else if (window.MEDHUB24_FONT_DEBUG) {
            console.info('[MedHub24] Khmer body face: ' + body + '; display face: ' + (display || 'fallback'));
        }
    }

    /* Ask the browser to fetch the Khmer faces immediately rather than
       waiting for the first Khmer glyph to be painted. Harmless when the
       page opens in English. */
    function warm() {
        if (!document.fonts || typeof document.fonts.load !== 'function') {
            return Promise.resolve();
        }
        var jobs = [];
        [
            '400 16px "MedHub Khmer"', '700 16px "MedHub Khmer"',
            '400 32px "MedHub Khmer Display"',
            '400 16px "Hanuman"', '400 32px "Angkor"'
        ]
            .forEach(function (spec) {
                try { jobs.push(document.fonts.load(spec, PROBE)); } catch (error) { /* ignore */ }
            });
        return Promise.all(jobs).catch(function () { /* handled by report() */ });
    }

    function run() {
        warm().then(function () {
            if (document.fonts && document.fonts.ready) {
                return document.fonts.ready;
            }
            return null;
        }).then(report, report);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }

    window.MEDHUB24_checkKhmerFont = report;
})();
