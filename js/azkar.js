// ═══════════════════════════════════════
//  azkar.js — صفحة الأذكار · Celestial Night V10
// ═══════════════════════════════════════
import { state, AZKAR_SABAH, AZKAR_MASAA, showToast, markUnsaved, FOOTER_HTML } from './state.js';
import { db, doc, updateDoc } from './firebase.js';

let currentAzkarTab = 'sabah';
export const azkarProgress = {};

// ─── HTML صفحة الأذكار ──────────────────────────────
export function getAzkarHTML() {
    const m = state.currentTheme === 'male';
    const panel = m ? 'glass-panel' : 'glass-card';
    const accentText = m ? 'text-sky-300' : 'text-fuchsia-400';
    return `
    <div id="azkar-view" class="hidden animate-fade-in pb-32 px-4 max-w-lg mx-auto space-y-4">
        <div class="text-center mt-4 mb-1 relative">
            <i class="fas fa-hands-praying text-5xl ${accentText} mb-3 block animate-float relative z-10"></i>
            <h2 class="text-3xl font-amiri font-bold text-white relative z-10">الأَذْكَارُ اليَوْمِيَّة</h2>
            <p class="text-sm font-kufi mt-1 relative z-10">
                <span class="text-white/28">أتممت </span>
                <span id="azkarProgressText" class="font-bold text-white/65">0</span>
                <span class="text-white/28"> من الأذكار</span>
            </p>
        </div>

        <div class="${panel} rounded-2xl p-2">
            <div class="flex gap-2 bg-black/28 p-1.5 rounded-xl">
                <button onclick="window.switchAzkarTab('sabah')" id="azkar-tab-sabah"
                    class="azkar-tab-btn ${m ? 'active-m' : 'active-f'}">🌅 أذكار الصباح</button>
                <button onclick="window.switchAzkarTab('masaa')" id="azkar-tab-masaa"
                    class="azkar-tab-btn">🌙 أذكار المساء</button>
            </div>
        </div>

        <div id="azkarList" class="${panel} rounded-3xl p-4"></div>

        <button onclick="window.markAllAzkarDone()"
            class="w-full py-4 rounded-2xl font-bold font-kufi text-lg transition-all active:scale-95 ${m ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white border-b-4 border-sky-700 shadow-[0_4px_18px_rgba(56,189,248,0.3)]' : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white border-b-4 border-purple-900'}">
            ✅ أتممت الأذكار
        </button>
        ${FOOTER_HTML}
    </div>`;
}

// ─── تبديل التبويب ──────────────────────────────────
export function switchAzkarTab(tab) {
    currentAzkarTab = tab;
    const m = state.currentTheme === 'male';
    const sabah = document.getElementById('azkar-tab-sabah');
    const masaa = document.getElementById('azkar-tab-masaa');
    const actClass = m ? 'active-m' : 'active-f';
    if (tab === 'sabah') {
        sabah?.classList.add(actClass); masaa?.classList.remove('active-m', 'active-f');
    } else {
        masaa?.classList.add(actClass); sabah?.classList.remove('active-m', 'active-f');
    }
    renderAzkarList(tab);
}

// ─── عرض قائمة الأذكار ──────────────────────────────
export function renderAzkarList(tab) {
    const list = document.getElementById('azkarList');
    if (!list) return;
    const data = tab === 'sabah' ? AZKAR_SABAH : AZKAR_MASAA;
    const m = state.currentTheme === 'male';
    const accentColor = m ? '#38bdf8' : '#f0abfc';
    const accentText = m ? 'text-sky-300' : 'text-fuchsia-400';
    const doneBg = m ? 'rgba(56,189,248,0.08)' : 'rgba(217,70,239,0.08)';
    const doneBorder = m ? 'rgba(56,189,248,0.35)' : 'rgba(217,70,239,0.38)';

    const doneCount = data.filter((_, i) => (azkarProgress[`${tab}-${i}`] || 0) >= data[i].count).length;
    const hdr = document.getElementById('azkarProgressText');
    if (hdr) hdr.textContent = `${doneCount}/${data.length}`;

    list.innerHTML = data.map((item, idx) => {
        const key = `${tab}-${idx}`;
        const progress = azkarProgress[key] || 0;
        const isDone = progress >= item.count;
        const pct = item.count > 1 ? Math.round(progress / item.count * 100) : (isDone ? 100 : 0);
        return `
        <div class="azkar-item" style="${isDone ? `background:${doneBg};border-color:${doneBorder};` : ''}">
            <p class="font-amiri text-xl text-white leading-[1.95] text-right mb-3">${item.text}</p>
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                    ${item.src ? `<span class="text-[10px] text-white/22 font-kufi border border-white/8 px-1.5 py-0.5 rounded">${item.src}</span>` : ''}
                    <span class="text-xs ${accentText}/65 font-kufi font-bold">${item.label}</span>
                </div>
                <button onclick="window.tapAzkar('${tab}',${idx},${item.count})"
                    class="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold font-kufi text-sm transition-transform active:scale-90 flex-shrink-0"
                    style="${isDone
                ? `background:${accentColor};color:#000;box-shadow:0 3px 12px ${accentColor}44;`
                : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.09);'}">
                    ${isDone ? '<i class="fas fa-check text-sm"></i>'
                : progress > 0 ? `<span>${progress}/${item.count}</span>`
                    : '<span>ابدأ</span>'}
                </button>
            </div>
            ${item.count > 1 && progress > 0 && !isDone ? `
            <div class="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300" style="width:${pct}%;background:${accentColor}"></div>
            </div>` : ''}
        </div>`;
    }).join('');
}

// ─── تنفيذ ذِكر ─────────────────────────────────────
export function tapAzkar(tab, idx, total) {
    const key = `${tab}-${idx}`;
    const cur = azkarProgress[key] || 0;
    if (cur < total) {
        azkarProgress[key] = cur + 1;
        const justCompleted = azkarProgress[key] >= total;
        if (justCompleted) {
            if (typeof confetti === 'function') confetti({ particleCount: 55, spread: 55, origin: { y: 0.6 }, colors: ['#38bdf8', '#c084fc', '#fff'] });
        }
        // Targeted update: only rebuild the tapped item's button + progress bar
        _updateSingleAzkar(tab, idx, total);
        // Update header count
        const data = tab === 'sabah' ? AZKAR_SABAH : AZKAR_MASAA;
        const doneCount = data.filter((_, i) => (azkarProgress[`${tab}-${i}`] || 0) >= data[i].count).length;
        const hdr = document.getElementById('azkarProgressText');
        if (hdr) hdr.textContent = `${doneCount}/${data.length}`;
    } else {
        azkarProgress[key] = 0;
        _updateSingleAzkar(tab, idx, total);
    }
}

// ─── Targeted single-item update (avoid full list rebuild) ──
function _updateSingleAzkar(tab, idx, total) {
    const list = document.getElementById('azkarList');
    if (!list) return;
    const item = list.children[idx];
    if (!item) { renderAzkarList(tab); return; } // fallback to full rebuild
    const progress = azkarProgress[`${tab}-${idx}`] || 0;
    const isDone = progress >= total;
    const m = state.currentTheme === 'male';
    const accentColor = m ? '#38bdf8' : '#f0abfc';
    const doneBg = m ? 'rgba(56,189,248,0.08)' : 'rgba(217,70,239,0.08)';
    const doneBorder = m ? 'rgba(56,189,248,0.35)' : 'rgba(217,70,239,0.38)';

    // Update item background
    item.style.background = isDone ? doneBg : '';
    item.style.borderColor = isDone ? doneBorder : '';

    // Update button
    const btn = item.querySelector('button');
    if (btn) {
        btn.style.cssText = isDone
            ? `background:${accentColor};color:#000;box-shadow:0 3px 12px ${accentColor}44;`
            : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.09);';
        btn.innerHTML = isDone ? '<i class="fas fa-check text-sm"></i>'
            : progress > 0 ? `<span>${progress}/${total}</span>` : '<span>ابدأ</span>';
    }

    // Update progress bar
    const existingBar = item.querySelector('.mt-2.h-1');
    if (total > 1 && progress > 0 && !isDone) {
        const pct = Math.round(progress / total * 100);
        if (existingBar) {
            const fill = existingBar.querySelector('div');
            if (fill) fill.style.width = pct + '%';
        } else {
            const barHtml = `<div class="mt-2 h-1 bg-white/8 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-300" style="width:${pct}%;background:${accentColor}"></div></div>`;
            item.insertAdjacentHTML('beforeend', barHtml);
        }
    } else if (existingBar) {
        existingBar.remove();
    }
}

// ─── إتمام الأذكار ───────────────────────────────────
export function markAllAzkarDone() {
    const data = currentAzkarTab === 'sabah' ? AZKAR_SABAH : AZKAR_MASAA;
    data.forEach((item, idx) => { azkarProgress[`${currentAzkarTab}-${idx}`] = item.count; });

    const habitId = currentAzkarTab === 'sabah'
        ? (state.currentTheme === 'male' ? 'm_morning' : 'f_morning')
        : (state.currentTheme === 'male' ? 'm_evening' : 'f_evening');

    if (!state.appData[state.currentDate]) state.appData[state.currentDate] = {};
    state.appData[state.currentDate][habitId] = true;
    markUnsaved();

    // حفظ تلقائي
    updateDoc(doc(db, "users", state.currentUser), { appData: state.appData })
        .catch(() => localStorage.setItem('ramadanTrackerData_v5', JSON.stringify(state.appData)));
    localStorage.setItem('ramadanTrackerData_v5', JSON.stringify(state.appData));

    if (typeof confetti === 'function') confetti({ particleCount: 140, spread: 78, origin: { y: 0.5 }, colors: ['#38bdf8', '#c084fc', '#4ade80'] });
    showToast('أحسنت! بارك الله في ذكرك ✨');
    renderAzkarList(currentAzkarTab);
}
