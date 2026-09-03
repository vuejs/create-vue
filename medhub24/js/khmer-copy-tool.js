(function () {
    const enLocale = window.MEDHUB_LOCALES?.en || {};
    const loadedKmLocale = window.MEDHUB_LOCALES?.km || {};
    const originalKmLocale = { ...loadedKmLocale };
    const DRAFT_KEY = 'medhub24.khmerDraft';
    const LANGUAGE_KEY = 'medhub24.lang';

    const state = {
        km: { ...loadedKmLocale },
        selectedKey: Object.keys(enLocale)[0] || Object.keys(loadedKmLocale)[0] || '',
        page: 'home',
        query: '',
        filter: 'all',
        dirty: new Set(),
        fileHandle: null,
        autoSaveTimer: null,
        syncChannel: 'BroadcastChannel' in window ? new BroadcastChannel('medhub24-khmer-copy') : null
    };

    const el = {
        sourceStatus: document.getElementById('sourceStatus'),
        autoSaveNote: document.getElementById('autoSaveNote'),
        openSource: document.getElementById('openSource'),
        saveSource: document.getElementById('saveSource'),
        searchInput: document.getElementById('searchInput'),
        entryList: document.getElementById('entryList'),
        pageTabs: document.getElementById('pageTabs'),
        pageCopyList: document.getElementById('pageCopyList'),
        activeKey: document.getElementById('activeKey'),
        activeBadges: document.getElementById('activeBadges'),
        statusLine: document.getElementById('statusLine'),
        smartFix: document.getElementById('smartFix'),
        polishText: document.getElementById('polishText'),
        conciseText: document.getElementById('conciseText'),
        copyPrompt: document.getElementById('copyPrompt'),
        revertText: document.getElementById('revertText'),
        statTotal: document.getElementById('statTotal'),
        statReview: document.getElementById('statReview'),
        statEdited: document.getElementById('statEdited'),
        statMissing: document.getElementById('statMissing'),
        issueList: document.getElementById('issueList'),
        newKeyInput: document.getElementById('newKeyInput'),
        addKey: document.getElementById('addKey'),
        bulkJson: document.getElementById('bulkJson'),
        applyJson: document.getElementById('applyJson'),
        fixAll: document.getElementById('fixAll'),
        copyCode: document.getElementById('copyCode'),
        downloadCode: document.getElementById('downloadCode')
    };

    const PAGE_GROUPS = [
        { id: 'home', label: 'Home Page', match: (key) => key.startsWith('home.') || key.startsWith('meta.') || key.startsWith('brand.') || key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('common.') },
        { id: 'checkup', label: 'Checkup Page', match: (key) => key.startsWith('checkup.') || key.startsWith('brand.') || key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('common.') },
        { id: 'surgery', label: 'Surgery Page', match: (key) => key.startsWith('surgery.') || key.startsWith('brand.') || key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('common.') },
        { id: 'travel', label: 'Travel Page', match: (key) => key.startsWith('travel.') || key.startsWith('brand.') || key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('common.') },
        { id: 'accommodation', label: 'Stay Page', match: (key) => key.startsWith('accommodation.') || key.startsWith('brand.') || key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('common.') },
        { id: 'shared', label: 'Shared Text', match: (key) => key.startsWith('meta.') || key.startsWith('brand.') || key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('common.') },
        { id: 'all', label: 'All Khmer Text', match: () => true }
    ];

    const TYPO_RULES = [
        [/អោយ/g, 'ឱ្យ'],
        [/ឲ្យ/g, 'ឱ្យ'],
        [/ព័ត៏មាន/g, 'ព័ត៌មាន'],
        [/ព័ត៍មាន/g, 'ព័ត៌មាន'],
        [/លំអិត/g, 'លម្អិត'],
        [/លំអីត/g, 'លម្អិត'],
        [/អំពិ/g, 'អំពី'],
        [/អនុញាតិ/g, 'អនុញ្ញាត'],
        [/សំនួរ/g, 'សំណួរ'],
        [/គ្រួសា(?!រ)/g, 'គ្រួសារ'],
        [/ច្បាស់លាស់អាច/g, 'ច្បាស់លាស់ អាច'],
        [/ក្រុមការងារយើងខ្ញុំ/g, 'ក្រុមការងារយើង'],
        [/ខាងយើងខ្ញុំ/g, 'យើង']
    ];

    const POLISH_RULES = [
        [/សួរព័ត៌មានខ្ញុំបាន 24\/7/g, 'សួរខ្ញុំបាន 24/7'],
        [/រកពេទ្យឯកទេសឱ្យចំជំងឺ/g, 'រកគ្រូពេទ្យឯកទេសឱ្យត្រូវជាមួយអាការៈជំងឺ'],
        [/ដើម្បីឱ្យក្រុមការងារយើងរកគ្រូពេទ្យឯកទេសឱ្យចំជំងឺរបស់អស់លោកអ្នក យើងសុំអនុញ្ញាតសាកសួរព័ត៌មានលោកអ្នកយ៉ាងលម្អិតអំពីប្រវត្តការព្យាបាលនិងអាការៈជំងឺជាមុនសិន។/g, 'ពីរោគសញ្ញាទៅកាន់វេជ្ជបណ្ឌិតឯកទេសដែលសមស្រប ដំណើរថែទាំក្លាយជាច្បាស់លាស់។'],
        [/ក្រោយពីបានព័ត៌មានអាការៈជំងឺពីអ្នកយ៉ាងលម្អិតហើយ ក្រុមការងារយើងស្វះស្វែងរកគ្រូពេទ្យឯកទេសឱ្យត្រូវជាមួយអាការៈជំងឺរបស់អ្នក/g, 'ជ្រើសរើសតម្រូវការថែទាំរបស់អ្នក យើងនឹងផ្គូផ្គងប្រទេស មន្ទីរពេទ្យ វេជ្ជបណ្ឌិតឯកទេស និងការតាមដានបន្តឱ្យសមស្រប។'],
        [/យើងមិនត្រឹមគ្រាន់តែជួយកក់គ្រូពេទ្យនិងណាត់ខាងមន្ទីរពេទ្យទេ តែយើងជួយលោកអ្នកខាងផ្នែកវេជ្ជសាស្ត្រផ្សេងៗ ការប្រឹក្សានិងតាមដានមើលថែក្រោយអ្នកត្រឡប់មកផ្ទះវិញជាមួយគ្រូពេទ្យរបស់អ្នក/g, 'យើងមិនត្រឹមតែជួយកក់ និងណាត់មន្ទីរពេទ្យទេ ប៉ុន្តែជួយគិតផ្នែកវេជ្ជសាស្ត្រ រៀបចំដំណើរ និងតាមដានបន្ទាប់ពីអ្នកត្រឡប់មកផ្ទះ។'],
        [/ដូចលោកអ្នកមានទីប្រឹក្សាផ្ទាល់ខ្លួនម្នាក់ប្រចាំនៅខ្មែរចាំឆ្លើយសំណួររឿងសុខភាព និង រៀបចំផែនការធ្វើដំណើរជាឯកជនឬជាគ្រួសារនៅក្រៅប្រទេស។/g, 'មានអ្នកទំនាក់ទំនងម្នាក់នៅកម្ពុជា ដើម្បីជួយជ្រើសកញ្ចប់ពិនិត្យ មន្ទីរពេទ្យ ពេលវេលាធ្វើដំណើរ និងបកស្រាយលទ្ធផលជាភាសាខ្មែរងាយយល់។'],
        [/លោកអ្នកអាចផ្ញើការវាយតម្លៃពីមន្ទីរពេទ្យផ្សេងមកឱ្យខ្ញុំ ដើម្បីស្វែងរកតម្លៃថ្មីសម្រាប់លទ្ធភាពការបង់ចំណាយរបស់លោកអ្នកបាន។/g, 'លោកអ្នកអាចផ្ញើការវាយតម្លៃពីមន្ទីរពេទ្យផ្សេងមកខ្ញុំ ដើម្បីជួយពិនិត្យជម្រើសតម្លៃ និងផែនការចំណាយឱ្យសមស្រប។']
    ];

    const CONCISE_RULES = [
        [/អ្នកជំងឺកម្ពុជា/g, 'អ្នកជំងឺខ្មែរ'],
        [/វេជ្ជបណ្ឌិតឯកទេស/g, 'ពេទ្យឯកទេស'],
        [/ការតាមដានបន្ត/g, 'តាមដានបន្ត'],
        [/ការធ្វើដំណើរ/g, 'ដំណើរ'],
        [/ក្រុមការងារយើង/g, 'យើង']
    ];

    const PASS_THROUGH_KEYS = new Set([
        'brand.name',
        'home.cta.secondary',
        'checkup.cta.secondary',
        'surgery.cta.secondary',
        'accommodation.cta.secondary'
    ]);

    function stripHtml(value) {
        return String(value ?? '').replace(/<[^>]*>/g, '');
    }

    function renderRich(value) {
        return String(value ?? '').replace(/\n/g, '<br>');
    }

    function hasKhmer(value) {
        return /[\u1780-\u17FF]/.test(String(value ?? ''));
    }

    function getOrderedKeys() {
        const seen = new Set();
        return [...Object.keys(enLocale), ...Object.keys(state.km)].filter((key) => {
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function getPageKeys() {
        const group = PAGE_GROUPS.find((item) => item.id === state.page) || PAGE_GROUPS[0];
        return getOrderedKeys().filter(group.match);
    }

    function cleanKhmer(value) {
        let next = String(value ?? '');
        TYPO_RULES.forEach(([pattern, replacement]) => {
            next = next.replace(pattern, replacement);
        });
        next = next
            .replace(/[ \t]+/g, ' ')
            .replace(/\s+([។,])/g, '$1')
            .replace(/([។,])(?=\S)/g, '$1 ')
            .replace(/\s+<br>/g, '<br>')
            .replace(/<br>\s+/g, '<br>')
            .trim();
        return next;
    }

    function polishKhmer(value, mode) {
        let next = cleanKhmer(value);
        POLISH_RULES.forEach(([pattern, replacement]) => {
            next = next.replace(pattern, replacement);
        });
        if (mode === 'concise') {
            CONCISE_RULES.forEach(([pattern, replacement]) => {
                next = next.replace(pattern, replacement);
            });
        }
        return cleanKhmer(next);
    }

    function getHtmlTags(value) {
        return String(value ?? '')
            .match(/<\/?[a-z][^>]*>/gi)
            ?.map((tag) => tag.toLowerCase().replace(/\s+[^>]*>/, '>')) || [];
    }

    function detectIssues(key) {
        const english = enLocale[key] || '';
        const khmer = state.km[key];
        const issues = [];
        const khmerText = String(khmer ?? '');

        if (!Object.prototype.hasOwnProperty.call(state.km, key)) {
            issues.push({ type: 'error', label: 'Missing' });
        }

        if (!Object.prototype.hasOwnProperty.call(enLocale, key)) {
            issues.push({ type: 'warn', label: 'No English' });
        }

        if (khmerText.trim() === '') {
            issues.push({ type: 'error', label: 'Empty' });
        }

        if (!PASS_THROUGH_KEYS.has(key) && /[A-Za-z]{3,}/.test(stripHtml(english)) && khmerText.trim() && !hasKhmer(khmerText)) {
            issues.push({ type: 'warn', label: 'No Khmer' });
        }

        const hasTypo = TYPO_RULES.some(([pattern]) => {
            pattern.lastIndex = 0;
            return pattern.test(khmerText);
        });
        if (hasTypo) {
            issues.push({ type: 'warn', label: 'Typo' });
        }

        if (getHtmlTags(english).join('|') !== getHtmlTags(khmerText).join('|')) {
            issues.push({ type: 'warn', label: 'HTML tags' });
        }

        if (stripHtml(khmerText).length > 170) {
            issues.push({ type: 'warn', label: 'Long' });
        }

        return issues;
    }

    function isEdited(key) {
        return state.dirty.has(key) || state.km[key] !== originalKmLocale[key];
    }

    function getFilteredKeys(sourceKeys = getPageKeys()) {
        const query = state.query.toLowerCase();
        return sourceKeys.filter((key) => {
            const haystack = `${key} ${enLocale[key] || ''} ${state.km[key] || ''}`.toLowerCase();
            if (query && !haystack.includes(query)) return false;
            if (state.filter === 'review' && detectIssues(key).length === 0) return false;
            if (state.filter === 'edited' && !isEdited(key)) return false;
            return true;
        });
    }

    function createBadge(issue) {
        const span = document.createElement('span');
        span.className = `badge ${issue.type || ''}`.trim();
        span.textContent = issue.label;
        return span;
    }

    function setStatus(message) {
        el.statusLine.textContent = message;
    }

    function getPreviewUrl() {
        const pageParam = ['checkup', 'surgery', 'travel', 'accommodation'].includes(state.page)
            ? `&page=${state.page}`
            : '';
        return `index.html?lang=km${pageParam}`;
    }

    function publishDraft() {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(state.km));
            localStorage.setItem(LANGUAGE_KEY, 'km');
        } catch (error) {
            setStatus('Preview sync could not use browser storage.');
        }

        if (state.syncChannel) {
            state.syncChannel.postMessage({ type: 'khmer-draft-updated' });
        }
    }

    function updateAutoSaveNote() {
        el.autoSaveNote.textContent = state.fileHandle
            ? 'Preview sync is on. Code auto-save is connected to locales/km/common.js.'
            : 'Preview sync is on. Click Connect Code once to auto-save into locales/km/common.js.';
    }

    function markSaved() {
        Object.keys(originalKmLocale).forEach((key) => {
            delete originalKmLocale[key];
        });
        Object.entries(state.km).forEach(([key, value]) => {
            originalKmLocale[key] = value;
        });
        state.dirty.clear();
    }

    function afterChange(key, message) {
        if (key) {
            state.selectedKey = key;
            state.dirty.add(key);
        }
        publishDraft();
        scheduleAutoSave();
        renderHeader();
        renderList();
        renderStats();
        updateActiveRows();
        setStatus(message || 'Updated. Preview synced.');
    }

    function updateKeyValue(key, value, message) {
        state.km[key] = value;
        const textarea = el.pageCopyList.querySelector(`[data-khmer-key="${CSS.escape(key)}"]`);
        if (textarea && document.activeElement !== textarea) {
            textarea.value = value;
        }
        afterChange(key, message);
        updateRowBadges(key);
    }

    function renderPageTabs() {
        el.pageTabs.innerHTML = '';
        PAGE_GROUPS.forEach((group) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `chip ${group.id === state.page ? 'active' : ''}`.trim();
            button.textContent = `${group.label} (${getOrderedKeys().filter(group.match).length})`;
            button.addEventListener('click', () => {
                state.page = group.id;
                const keys = getFilteredKeys(getPageKeys());
                state.selectedKey = keys[0] || getPageKeys()[0] || state.selectedKey;
                render();
                setStatus(`${group.label} loaded.`);
            });
            el.pageTabs.append(button);
        });
    }

    function renderList() {
        const keys = getFilteredKeys(getPageKeys());
        if (!keys.includes(state.selectedKey) && keys.length) {
            state.selectedKey = keys[0];
        }

        el.entryList.innerHTML = '';
        keys.forEach((key) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `entry ${key === state.selectedKey ? 'active' : ''}`.trim();
            button.dataset.key = key;

            const keyNode = document.createElement('div');
            keyNode.className = 'entry-key mono';
            keyNode.textContent = key;

            const valueNode = document.createElement('div');
            valueNode.className = 'entry-value';
            valueNode.textContent = stripHtml(state.km[key] || enLocale[key] || '');

            const metaNode = document.createElement('div');
            metaNode.className = 'entry-meta';
            if (isEdited(key)) {
                metaNode.append(createBadge({ type: 'edit', label: 'Edited' }));
            }
            detectIssues(key).slice(0, 2).forEach((issue) => metaNode.append(createBadge(issue)));

            button.append(keyNode, valueNode, metaNode);
            button.addEventListener('click', () => {
                state.selectedKey = key;
                renderHeader();
                renderList();
                scrollToKey(key);
            });
            el.entryList.append(button);
        });
    }

    function renderHeader() {
        const key = state.selectedKey;
        const pageLabel = PAGE_GROUPS.find((item) => item.id === state.page)?.label || 'Khmer Text';
        el.activeKey.textContent = key ? `${pageLabel} / ${key}` : pageLabel;
        el.activeBadges.innerHTML = '';
        if (key && isEdited(key)) {
            el.activeBadges.append(createBadge({ type: 'edit', label: 'Edited' }));
        }
        if (key) {
            detectIssues(key).forEach((issue) => el.activeBadges.append(createBadge(issue)));
        }
        const previewLink = document.querySelector('.header-actions a[href^="index.html"]');
        if (previewLink) {
            previewLink.setAttribute('href', getPreviewUrl());
        }
    }

    function renderPageContent() {
        const keys = getFilteredKeys(getPageKeys());
        el.pageCopyList.innerHTML = '';

        if (!keys.length) {
            const empty = document.createElement('div');
            empty.className = 'copy-row';
            empty.textContent = 'No Khmer text matches this filter.';
            el.pageCopyList.append(empty);
            return;
        }

        keys.forEach((key) => {
            const row = document.createElement('article');
            row.className = `copy-row ${key === state.selectedKey ? 'active' : ''}`.trim();
            row.dataset.rowKey = key;

            const head = document.createElement('div');
            head.className = 'copy-row-head';

            const keyNode = document.createElement('div');
            keyNode.className = 'copy-row-key mono';
            keyNode.textContent = key;

            const badges = document.createElement('div');
            badges.className = 'entry-meta';
            if (isEdited(key)) {
                badges.append(createBadge({ type: 'edit', label: 'Edited' }));
            }
            detectIssues(key).forEach((issue) => badges.append(createBadge(issue)));

            const grid = document.createElement('div');
            grid.className = 'copy-row-grid';

            const englishBox = document.createElement('div');
            englishBox.innerHTML = `<div class="label">English Source</div><div class="english-copy">${renderRich(enLocale[key] || '')}</div>`;

            const khmerBox = document.createElement('div');
            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = 'Khmer Text';

            const textarea = document.createElement('textarea');
            textarea.spellcheck = false;
            textarea.dataset.khmerKey = key;
            textarea.value = state.km[key] || '';
            textarea.addEventListener('focus', () => {
                state.selectedKey = key;
                renderHeader();
                renderList();
                updateActiveRows();
            });
            textarea.addEventListener('input', (event) => {
                state.km[key] = event.target.value;
                afterChange(key, 'Updated. Preview synced. Code auto-save will run if connected.');
                updateRowBadges(key);
            });

            head.append(keyNode, badges);
            khmerBox.append(label, textarea);
            grid.append(englishBox, khmerBox);
            row.append(head, grid);
            el.pageCopyList.append(row);
        });
    }

    function updateActiveRows() {
        el.pageCopyList.querySelectorAll('.copy-row').forEach((row) => {
            row.classList.toggle('active', row.dataset.rowKey === state.selectedKey);
        });
    }

    function updateRowBadges(key) {
        const row = el.pageCopyList.querySelector(`[data-row-key="${CSS.escape(key)}"]`);
        if (!row) return;
        const badges = row.querySelector('.entry-meta');
        if (!badges) return;
        badges.innerHTML = '';
        if (isEdited(key)) {
            badges.append(createBadge({ type: 'edit', label: 'Edited' }));
        }
        detectIssues(key).forEach((issue) => badges.append(createBadge(issue)));
        updateActiveRows();
    }

    function scrollToKey(key) {
        const row = el.pageCopyList.querySelector(`[data-row-key="${CSS.escape(key)}"]`);
        if (row) {
            row.scrollIntoView({ block: 'center', behavior: 'smooth' });
            const textarea = row.querySelector('textarea');
            if (textarea) textarea.focus();
        }
    }

    function renderStats() {
        const keys = getOrderedKeys();
        const issueKeys = keys.filter((key) => detectIssues(key).length);
        const missingKeys = keys.filter((key) => !Object.prototype.hasOwnProperty.call(state.km, key) || state.km[key] === '');
        el.statTotal.textContent = keys.length;
        el.statReview.textContent = issueKeys.length;
        el.statEdited.textContent = keys.filter(isEdited).length;
        el.statMissing.textContent = missingKeys.length;

        el.issueList.innerHTML = '';
        issueKeys.slice(0, 8).forEach((key) => {
            const issue = document.createElement('button');
            issue.type = 'button';
            issue.className = 'issue';
            issue.textContent = `${key}: ${detectIssues(key).map((item) => item.label).join(', ')}`;
            issue.addEventListener('click', () => {
                const group = PAGE_GROUPS.find((item) => item.match(key));
                state.page = group?.id || 'all';
                state.filter = 'all';
                state.selectedKey = key;
                document.querySelectorAll('[data-filter]').forEach((button) => {
                    button.classList.toggle('active', button.dataset.filter === 'all');
                });
                render();
                scrollToKey(key);
            });
            el.issueList.append(issue);
        });
        if (!issueKeys.length) {
            const clear = document.createElement('div');
            clear.className = 'issue';
            clear.style.background = '#dff8f5';
            clear.style.color = '#0b5b55';
            clear.textContent = 'All Khmer keys are synced.';
            el.issueList.append(clear);
        }
    }

    function render() {
        renderPageTabs();
        renderList();
        renderHeader();
        renderPageContent();
        renderStats();
        updateAutoSaveNote();
    }

    function generateSource() {
        const data = {};
        getOrderedKeys().forEach((key) => {
            data[key] = state.km[key] ?? '';
        });
        const lines = [
            'window.MEDHUB_LOCALES = window.MEDHUB_LOCALES || {};',
            'window.MEDHUB_LOCALES.km = {'
        ];
        Object.entries(data).forEach(([key, value], index, array) => {
            const comma = index === array.length - 1 ? '' : ',';
            lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(value)}${comma}`);
        });
        lines.push('};');
        return `${lines.join('\n')}\n`;
    }

    function parseLocaleSource(source) {
        const sandbox = { MEDHUB_LOCALES: {} };
        const runner = new Function('window', `${source}\nreturn window.MEDHUB_LOCALES && window.MEDHUB_LOCALES.km;`);
        const parsed = runner(sandbox);
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('No Khmer locale object found.');
        }
        return parsed;
    }

    async function requestWritePermission(handle) {
        if (!handle?.queryPermission || !handle?.requestPermission) {
            return true;
        }
        const options = { mode: 'readwrite' };
        if (await handle.queryPermission(options) === 'granted') {
            return true;
        }
        return await handle.requestPermission(options) === 'granted';
    }

    async function openSourceFile() {
        if (!window.showOpenFilePicker) {
            setStatus('Direct code auto-save needs Chrome or Edge on a local server. Use Download or Copy Code here.');
            return;
        }

        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'JavaScript locale', accept: { 'text/javascript': ['.js'], 'application/javascript': ['.js'] } }],
                multiple: false
            });
            const canWrite = await requestWritePermission(handle);
            const file = await handle.getFile();
            const text = await file.text();
            const parsed = parseLocaleSource(text);
            state.fileHandle = canWrite ? handle : null;
            state.km = { ...parsed };
            markSaved();
            publishDraft();
            el.sourceStatus.textContent = canWrite
                ? `Auto-saving to ${file.name}`
                : `Loaded ${file.name}; write permission was not granted`;
            setStatus(canWrite ? 'Connected. Every edit now syncs to preview and auto-saves to code.' : 'Loaded file. Click Save To Code to choose a writable target.');
            render();
        } catch (error) {
            if (error.name !== 'AbortError') {
                setStatus(`Could not connect code file: ${error.message}`);
            }
        }
    }

    async function writeSourceToHandle(handle) {
        const writable = await handle.createWritable();
        await writable.write(generateSource());
        await writable.close();
    }

    async function saveSourceFile() {
        try {
            if (!state.fileHandle && window.showSaveFilePicker) {
                state.fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'common.js',
                    types: [{ description: 'JavaScript locale', accept: { 'text/javascript': ['.js'], 'application/javascript': ['.js'] } }]
                });
            }

            if (!state.fileHandle) {
                downloadSource();
                setStatus('Downloaded generated Khmer locale code.');
                return;
            }

            await writeSourceToHandle(state.fileHandle);
            markSaved();
            setStatus('Saved directly to Khmer locale code.');
            render();
        } catch (error) {
            if (error.name !== 'AbortError') {
                setStatus(`Could not save file: ${error.message}`);
            }
        }
    }

    function scheduleAutoSave() {
        window.clearTimeout(state.autoSaveTimer);
        state.autoSaveTimer = window.setTimeout(async () => {
            if (!state.fileHandle) return;
            try {
                await writeSourceToHandle(state.fileHandle);
                markSaved();
                renderList();
                renderStats();
                renderHeader();
                setStatus('Auto-saved to Khmer locale code and preview synced.');
            } catch (error) {
                setStatus(`Auto-save paused: ${error.message}`);
            }
        }, 700);
    }

    async function copyText(value, successMessage) {
        try {
            await navigator.clipboard.writeText(value);
            setStatus(successMessage);
        } catch (error) {
            setStatus('Clipboard access was blocked.');
        }
    }

    function downloadSource() {
        const blob = new Blob([generateSource()], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'common.js';
        link.click();
        URL.revokeObjectURL(url);
    }

    function copyAiPrompt() {
        const key = state.selectedKey;
        const prompt = [
            'Rephrase and correct this Khmer website copy for MedHub24.',
            'Keep the meaning aligned with the English source.',
            'Preserve all HTML tags exactly.',
            'Return only the revised Khmer text.',
            '',
            `Key: ${key}`,
            `English: ${enLocale[key] || ''}`,
            `Khmer draft: ${state.km[key] || ''}`
        ].join('\n');
        copyText(prompt, 'AI prompt copied for the selected string.');
    }

    function applyBulkJson() {
        try {
            const parsed = JSON.parse(el.bulkJson.value || '{}');
            Object.entries(parsed).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    state.km[key] = cleanKhmer(value);
                    state.dirty.add(key);
                }
            });
            publishDraft();
            scheduleAutoSave();
            setStatus('Bulk Khmer JSON applied. Preview synced.');
            render();
        } catch (error) {
            setStatus(`JSON could not be read: ${error.message}`);
        }
    }

    function fixAll() {
        getOrderedKeys().forEach((key) => {
            const current = state.km[key] ?? '';
            const fixed = cleanKhmer(current);
            if (fixed !== current) {
                state.km[key] = fixed;
                state.dirty.add(key);
            }
        });
        publishDraft();
        scheduleAutoSave();
        setStatus('Common Khmer mistakes fixed across all keys. Preview synced.');
        render();
    }

    function addKey() {
        const key = (el.newKeyInput.value || '').trim();
        if (!key) {
            setStatus('Type a key name first.');
            return;
        }
        if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/i.test(key)) {
            setStatus('Use a simple key like home.newText or travel.route.note.');
            return;
        }
        if (Object.prototype.hasOwnProperty.call(state.km, key) || Object.prototype.hasOwnProperty.call(enLocale, key)) {
            setStatus('That key already exists.');
            return;
        }

        state.km[key] = '';
        state.selectedKey = key;
        state.page = 'all';
        state.dirty.add(key);
        el.newKeyInput.value = '';
        publishDraft();
        scheduleAutoSave();
        setStatus('New Khmer key added. Add matching HTML usage before expecting it on the website.');
        render();
        scrollToKey(key);
    }

    function updateSelectedWith(transform, message) {
        const key = state.selectedKey;
        if (!key) return;
        updateKeyValue(key, transform(state.km[key] || ''), message);
    }

    el.searchInput.addEventListener('input', (event) => {
        state.query = event.target.value.trim();
        render();
    });

    document.querySelectorAll('[data-filter]').forEach((button) => {
        button.addEventListener('click', () => {
            state.filter = button.dataset.filter || 'all';
            document.querySelectorAll('[data-filter]').forEach((item) => {
                item.classList.toggle('active', item === button);
            });
            render();
        });
    });

    el.openSource.addEventListener('click', openSourceFile);
    el.saveSource.addEventListener('click', saveSourceFile);
    el.smartFix.addEventListener('click', () => updateSelectedWith(cleanKhmer, 'Selected Khmer text fixed. Preview synced.'));
    el.polishText.addEventListener('click', () => updateSelectedWith((value) => polishKhmer(value, 'polished'), 'Selected Khmer text polished. Preview synced.'));
    el.conciseText.addEventListener('click', () => updateSelectedWith((value) => polishKhmer(value, 'concise'), 'Selected Khmer text shortened. Preview synced.'));
    el.copyPrompt.addEventListener('click', copyAiPrompt);
    el.revertText.addEventListener('click', () => updateSelectedWith(() => originalKmLocale[state.selectedKey] || '', 'Selected Khmer text reverted. Preview synced.'));
    el.applyJson.addEventListener('click', applyBulkJson);
    el.addKey.addEventListener('click', addKey);
    el.newKeyInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addKey();
        }
    });
    el.fixAll.addEventListener('click', fixAll);
    el.copyCode.addEventListener('click', () => copyText(generateSource(), 'Generated Khmer locale code copied.'));
    el.downloadCode.addEventListener('click', downloadSource);

    publishDraft();
    render();
})();
