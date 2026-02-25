// ═══════════════════════════════════════
//  quran.js — صفحة القرآن الكريم · Celestial Night V10
// ═══════════════════════════════════════
import { state, showToast, markUnsaved, FOOTER_HTML } from './state.js';

let surahList = [];
let quranInitialized = false;
let mushafCurrentPage = 1;
let selectedJuz = new Set();
let quranLogMode = 'pages';

// ─── HTML صفحة القرآن ──────────────────────────────
export function getQuranHTML() {
    const m = state.currentTheme === 'male';
    const panel = m ? 'glass-panel' : 'glass-card';
    const accentText = m ? 'text-sky-300' : 'text-fuchsia-400';
    const accentBorder = m ? 'border-sky-400/22' : 'border-fuchsia-500/22';
    const accentColor = m ? '#38bdf8' : '#d946ef';

    return `
    <div id="quran-view" class="hidden animate-fade-in pb-32 px-4 max-w-lg mx-auto space-y-4">
        <div class="text-center mt-4 mb-1 relative">
            <i class="fas fa-book-quran text-5xl ${accentText} mb-3 block animate-float relative z-10"></i>
            <h2 class="text-3xl font-amiri font-bold text-white relative z-10">القُرْآنُ الكَرِيم</h2>
            <div class="h-px w-14 bg-gradient-to-r from-transparent ${m ? 'via-sky-400' : 'via-fuchsia-500'} to-transparent mx-auto rounded-full mt-2"></div>
        </div>

        <!-- تسجيل القراءة -->
        <div class="${panel} rounded-3xl p-4 space-y-4">
            <div class="flex items-center gap-2 mb-1">
                <i class="fas fa-pencil-alt ${accentText} text-sm"></i>
                <span class="text-sm font-bold font-kufi text-white/65">سجّل ما قرأته اليوم</span>
            </div>
            <div class="flex gap-2 bg-black/28 p-1 rounded-xl">
                <button onclick="window.setQuranLogMode('pages')" id="qlog-pages-btn"
                    class="flex-1 py-2.5 rounded-lg font-kufi text-sm font-bold transition-all ${m ? 'bg-sky-500 text-white' : 'bg-fuchsia-500 text-white'} shadow-sm">صفحات</button>
                <button onclick="window.setQuranLogMode('juz')" id="qlog-juz-btn"
                    class="flex-1 py-2.5 rounded-lg font-kufi text-sm font-bold transition-all text-white/38">أجزاء</button>
            </div>

            <!-- وضع الصفحات -->
            <div id="qlog-pages-mode">
                <div class="flex items-center gap-3 bg-black/28 rounded-2xl p-4 border border-white/5">
                    <button onclick="window.adjustQuranPages(-5)" class="w-11 h-11 rounded-xl bg-white/10 text-white font-bold text-sm active:scale-90 transition-transform">-5</button>
                    <button onclick="window.adjustQuranPages(-1)" class="w-11 h-11 rounded-xl bg-white/10 text-white font-bold text-sm active:scale-90 transition-transform">-1</button>
                    <div class="flex-1 text-center">
                        <input type="number" id="quranLogPages" placeholder="0" inputmode="numeric"
                            class="w-full text-4xl font-bold text-center font-amiri leading-none highlight-input"
                            onchange="window.onInputChange()" oninput="window.onInputChange()">
                        <div class="text-xs text-white/40 font-amiri mt-2">صفحة</div>
                    </div>
                    <button onclick="window.adjustQuranPages(1)"  class="w-11 h-11 rounded-xl bg-white/10 text-white font-bold text-sm active:scale-90 transition-transform">+1</button>
                    <button onclick="window.adjustQuranPages(5)"  class="w-11 h-11 rounded-xl bg-white/10 text-white font-bold text-sm active:scale-90 transition-transform">+5</button>
                </div>
            </div>

            <!-- وضع الأجزاء -->
            <div id="qlog-juz-mode" class="hidden">
                <p class="text-xs text-white/35 font-kufi mb-3 text-center">اضغط على الأجزاء اللي قرأتها اليوم</p>
                <div class="juz-grid" id="juzGrid"></div>
                <p class="text-center text-xs ${accentText}/55 font-kufi mt-2" id="juzSumLabel">= 0 صفحة</p>
            </div>
        </div>

        <!-- اختيار السورة -->
        <div class="${panel} rounded-3xl p-4 space-y-3">
            <div class="flex items-center gap-2 mb-1">
                <i class="fas fa-book-open ${accentText} text-sm"></i>
                <span class="text-sm font-bold font-kufi text-white/65">اختر سورة لفتح المصحف</span>
            </div>
            <select id="surahSelect" onchange="window.loadSurah()"
                class="w-full bg-black/40 border ${accentBorder} rounded-xl px-4 py-3 text-white text-sm font-amiri focus:outline-none appearance-none text-right">
                <option value="">اختر السورة للبدء...</option>
            </select>

            <div id="quranLoading" class="hidden text-center py-6">
                <div class="w-10 h-10 border-3 border-white/10 border-t-sky-400 rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-white/35 text-sm font-amiri">جارٍ التحميل...</p>
            </div>

            <button id="openMushafBtn" onclick="window.openFullscreenMushaf()"
                class="hidden w-full py-4 rounded-2xl font-bold font-kufi text-base transition-all active:scale-95 flex items-center justify-center gap-3"
                style="background:linear-gradient(135deg,#4a2c0a,#7a4512);color:#fde68a;box-shadow:0 4px 18px rgba(74,44,10,0.7);border:1px solid rgba(251,215,140,0.25);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                افتح المصحف
            </button>

            <div id="surahQuickInfo" class="hidden text-center py-1">
                <div class="font-amiri text-xl font-bold text-white" id="surahNameAr"></div>
                <div class="text-xs ${accentText}/55 font-kufi mt-0.5" id="surahVerseCount"></div>
            </div>
        </div>
        ${FOOTER_HTML}
    </div>

    <!-- ══ المصحف الكامل (Overlay) ══ -->
    <div id="mushafOverlay" class="quran-fullscreen-overlay hidden">
        <div class="quran-fullscreen-topbar">
            <button onclick="window.closeFullscreenMushaf()"><i class="fas fa-times"></i> إغلاق</button>
            <div class="surah-title" id="fs-surah-title">...</div>
            <div style="font-family:'Reem Kufi',sans-serif;font-size:13px;opacity:0.8;font-weight:bold;" id="fs-juz-label">...</div>
        </div>
        <div class="quran-fs-page" id="fs-page-scroll">
            <div style="position:absolute;inset:10px;border:2px solid rgba(139,90,43,0.15);border-radius:4px;pointer-events:none;z-index:1;"></div>
            <div class="quran-fs-page-inner">
                <div id="fs-ayat-text" class="quran-fs-text"></div>
            </div>
        </div>
        <div class="quran-fs-footer">
            <button id="fs-prev-btn" onclick="window.fsPrevPage()">
                <i class="fas fa-chevron-right"></i> السابق
            </button>
            <div style="text-align:center">
                <div style="font-family:'Amiri',serif;font-size:20px;font-weight:bold;color:#fde68a" id="fs-page-num">...</div>
            </div>
            <button id="fs-next-btn" onclick="window.fsNextPage()">
                التالي <i class="fas fa-chevron-left"></i>
            </button>
        </div>
    </div>`;
}

// ─── تهيئة المصحف ──────────────────────────────────
export async function initQuran() {
    if (quranInitialized) return;
    const sel = document.getElementById('surahSelect');
    if (!sel || surahList.length) { quranInitialized = true; return; }
    try {
        const json = await (await fetch('https://api.alquran.cloud/v1/surah')).json();
        surahList = json.data;
        const frag = document.createDocumentFragment();
        surahList.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.number;
            opt.textContent = `${s.number}. ${s.name} — ${s.englishName}`;
            frag.appendChild(opt);
        });
        sel.appendChild(frag);
        quranInitialized = true;
    } catch { showToast('تعذّر تحميل قائمة السور، تحقق من الإنترنت'); }
}

// ─── تحميل سورة ────────────────────────────────────
export async function loadSurah() {
    const sel = document.getElementById('surahSelect');
    if (!sel?.value) return;
    const loading = document.getElementById('quranLoading');
    const openBtn = document.getElementById('openMushafBtn');
    const quickInfo = document.getElementById('surahQuickInfo');
    if (loading) loading.classList.remove('hidden');
    if (openBtn) openBtn.classList.add('hidden');
    if (quickInfo) quickInfo.classList.add('hidden');
    try {
        const json = await (await fetch(`https://api.alquran.cloud/v1/surah/${parseInt(sel.value)}`)).json();
        mushafCurrentPage = json.data.ayahs[0].page;
        if (loading) loading.classList.add('hidden');
        if (openBtn) openBtn.classList.remove('hidden');
        if (quickInfo) quickInfo.classList.remove('hidden');
        const nameEl = document.getElementById('surahNameAr');
        const countEl = document.getElementById('surahVerseCount');
        if (nameEl) nameEl.textContent = json.data.name;
        if (countEl) countEl.textContent = `تبدأ من صفحة ${mushafCurrentPage}`;
    } catch {
        if (loading) loading.classList.add('hidden');
        showToast('تعذّر تحميل السورة، تحقق من الإنترنت');
    }
}

// ─── فتح/إغلاق المصحف ──────────────────────────────
export async function openFullscreenMushaf() {
    const overlay = document.getElementById('mushafOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (!document.getElementById('surahSelect')?.value) mushafCurrentPage = 1;
    await loadMushafPage(mushafCurrentPage);
}

export function closeFullscreenMushaf() {
    document.getElementById('mushafOverlay')?.classList.add('hidden');
    document.body.style.overflow = '';
}

// ─── تحميل صفحة المصحف ─────────────────────────────
const toArabicNum = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

async function loadMushafPage(pageNum) {
    const textEl = document.getElementById('fs-ayat-text');
    const titleEl = document.getElementById('fs-surah-title');
    const juzEl = document.getElementById('fs-juz-label');
    const pageNumEl = document.getElementById('fs-page-num');
    const prevBtn = document.getElementById('fs-prev-btn');
    const nextBtn = document.getElementById('fs-next-btn');

    prevBtn.disabled = nextBtn.disabled = true;
    textEl.innerHTML = '<div class="flex justify-center items-center py-20"><div class="w-12 h-12 border-4 border-[#8b5a2b] border-t-transparent rounded-full animate-spin"></div></div>';

    try {
        const json = await (await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`)).json();
        const ayahs = json.data.ayahs;

        titleEl.textContent = [...new Set(ayahs.map(a => a.surah.name))].join(' ، ');
        juzEl.textContent = `الجزء ${toArabicNum(ayahs[0].juz)}`;
        pageNumEl.textContent = toArabicNum(pageNum);

        let html = '';
        ayahs.forEach(a => {
            const num = toArabicNum(a.numberInSurah);
            const isFirst = a.numberInSurah === 1;
            const surahNum = a.surah.number;

            if (isFirst) {
                html += `<div class="surah-header-ornament">
                    <span style="font-family:'Amiri Quran',serif;font-size:28px;color:#4a2c0a;font-weight:bold;">${a.surah.name}</span>
                </div>`;
                if (surahNum !== 1 && surahNum !== 9) {
                    html += `<div style="text-align:center;font-family:'Amiri Quran',serif;font-size:26px;color:#2D1A11;margin-bottom:16px;">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>`;
                }
            }

            let cleanText = a.text;
            if (isFirst && surahNum !== 1 && surahNum !== 9 && cleanText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ '))
                cleanText = cleanText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');

            const marker = `<span class="aya-marker">
                <svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="none" stroke="#8b5a2b" stroke-width="1.2"/><circle cx="14" cy="14" r="9" fill="none" stroke="#8b5a2b" stroke-width="0.5" opacity="0.5"/></svg>
                <span>${num}</span>
            </span>`;
            html += `${cleanText}${marker} `;
        });

        textEl.innerHTML = html;
        const scroll = document.getElementById('fs-page-scroll');
        if (scroll) scroll.scrollTop = 0;
        prevBtn.disabled = pageNum <= 1;
        nextBtn.disabled = pageNum >= 604;
    } catch {
        textEl.innerHTML = '<div class="text-center text-red-700 py-10 font-kufi font-bold">تعذر تحميل الصفحة. تأكد من اتصالك بالإنترنت.</div>';
        prevBtn.disabled = nextBtn.disabled = false;
    }
}

export function fsPrevPage() { if (mushafCurrentPage > 1) { mushafCurrentPage--; loadMushafPage(mushafCurrentPage); } }
export function fsNextPage() { if (mushafCurrentPage < 604) { mushafCurrentPage++; loadMushafPage(mushafCurrentPage); } }

// ─── وضع تسجيل القرآن ──────────────────────────────
export function setQuranLogMode(mode) {
    quranLogMode = mode;
    const m = state.currentTheme === 'male';
    const pageBtn = document.getElementById('qlog-pages-btn');
    const juzBtn = document.getElementById('qlog-juz-btn');
    const pageMod = document.getElementById('qlog-pages-mode');
    const juzMod = document.getElementById('qlog-juz-mode');
    const active = m ? ['bg-sky-500', 'text-white'] : ['bg-fuchsia-500', 'text-white'];
    const inactive = ['text-white/38'];

    if (mode === 'pages') {
        pageBtn?.classList.remove(...inactive); pageBtn?.classList.add(...active);
        juzBtn?.classList.add(...inactive); juzBtn?.classList.remove(...active);
        pageMod?.classList.remove('hidden'); juzMod?.classList.add('hidden');
    } else {
        juzBtn?.classList.remove(...inactive); juzBtn?.classList.add(...active);
        pageBtn?.classList.add(...inactive); pageBtn?.classList.remove(...active);
        juzMod?.classList.remove('hidden'); pageMod?.classList.add('hidden');
        renderJuzGrid();
    }
}

export function adjustQuranPages(delta) {
    const inp = document.getElementById('quranLogPages') || document.getElementById('quranInput');
    if (!inp) return;
    inp.value = Math.max(0, (parseInt(inp.value) || 0) + delta);
    markUnsaved();
}

function renderJuzGrid() {
    const grid = document.getElementById('juzGrid');
    if (!grid) return;
    const m = state.currentTheme === 'male';
    selectedJuz = new Set(state.appData[state.currentDate]?.juz || []);
    grid.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        const done = selectedJuz.has(i);
        const btn = document.createElement('button');
        btn.className = `juz-btn ${done ? (m ? 'done-m' : 'done-f') : ''}`;
        btn.textContent = i;
        btn.onclick = () => {
            if (selectedJuz.has(i)) selectedJuz.delete(i); else selectedJuz.add(i);
            const totalPages = selectedJuz.size * 20;
            if (!state.appData[state.currentDate]) state.appData[state.currentDate] = {};
            state.appData[state.currentDate].quran = totalPages;
            state.appData[state.currentDate].juz = [...selectedJuz];
            markUnsaved(); renderJuzGrid();
            const lbl = document.getElementById('juzSumLabel');
            if (lbl) lbl.textContent = `= ${totalPages} صفحة`;
        };
        grid.appendChild(btn);
    }
    const tp = selectedJuz.size * 20;
    const lbl = document.getElementById('juzSumLabel');
    if (lbl) lbl.textContent = `= ${tp} صفحة`;
}

// ─── Swipe للتنقل بين صفحات المصحف ────────────────
let touchStartX = 0;
document.addEventListener('touchstart', e => {
    if (!document.getElementById('mushafOverlay')?.classList.contains('hidden'))
        touchStartX = e.touches[0].clientX;
}, { passive: true });
document.addEventListener('touchend', e => {
    if (document.getElementById('mushafOverlay')?.classList.contains('hidden')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) { if (dx > 0) fsNextPage(); else fsPrevPage(); }
}, { passive: true });
