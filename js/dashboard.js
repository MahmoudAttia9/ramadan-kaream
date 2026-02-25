// ═══════════════════════════════════════
//  dashboard.js — الصفحة الرئيسية · Celestial Night V10
// ═══════════════════════════════════════
import {
    state, PRAYERS_CONFIG, PRAYER_ICONS,
    showToast, markUnsaved, markSaved, calcJuzPages, FOOTER_HTML
} from './state.js';
import { db, doc, updateDoc } from './firebase.js';

// ─── HTML الرئيسية ───────────────────────────────────
export function getDashboardHTML() {
    const m = state.currentTheme === 'male';
    const panel = m ? 'glass-panel' : 'glass-card';
    const accentText = m ? 'text-sky-300' : 'text-fuchsia-400';
    const accentBg = m ? 'bg-sky-400/10' : 'bg-fuchsia-500/10';
    const accentColor = m ? '#38bdf8' : '#d946ef';
    const borderColor = m ? 'border-sky-400/13' : 'border-fuchsia-500/13';
    const cardBg = m ? 'bg-[#0a0a0a]' : 'bg-[#220d3a]';
    const cardBorder = m ? 'border-sky-400/10' : 'border-fuchsia-500/10';
    const greeting = m ? `أهلاً بك ${state.currentUser} ✨` : `أهلاً بكِ ${state.currentUser} ✨`;
    const subtitle = m ? 'نور الله قلبك وتقبل طاعتك' : 'نور الله قلبكِ وتقبل طاعتكِ';

    return `
    <div id="dashboard-view" class="animate-fade-in px-4 max-w-lg mx-auto space-y-5 pb-36">
        <div class="text-center space-y-1.5 pt-2">
            <h2 class="text-2xl font-bold font-kufi text-white">${greeting}</h2>
            <p class="${m ? 'text-sky-200/55' : 'text-fuchsia-300/60'} font-amiri text-sm">${subtitle}</p>
        </div>

        <!-- مبدّل التاريخ -->
        <div class="flex items-center justify-between ${m ? 'bg-[#0a0a0a]/85 border-sky-400/15' : 'bg-[#220d3a]/85 border-fuchsia-500/18'} border rounded-2xl p-2 shadow-md backdrop-blur-sm">
            <button onclick="window.changeDate(1)" class="w-11 h-11 flex items-center justify-center rounded-xl ${m ? 'bg-[#111111] text-sky-200 active:bg-[#1a1a1a]' : 'bg-[#2d114d] text-fuchsia-300 active:bg-[#3a1663]'} transition-all active:scale-90">
                <i class="fas fa-chevron-right text-sm"></i>
            </button>
            <div class="text-center">
                <span id="dateDisplay" class="font-bold text-sm font-kufi text-white block">...</span>
                <span id="dateTag" class="text-xs ${m ? 'text-sky-300/55' : 'text-fuchsia-400/55'} font-amiri">اليوم</span>
            </div>
            <button onclick="window.changeDate(-1)" class="w-11 h-11 flex items-center justify-center rounded-xl ${m ? 'bg-[#111111] text-sky-200 active:bg-[#1a1a1a]' : 'bg-[#2d114d] text-fuchsia-300 active:bg-[#3a1663]'} transition-all active:scale-90">
                <i class="fas fa-chevron-left text-sm"></i>
            </button>
        </div>

        <!-- بطاقة الصلوات -->
        <div class="${panel} rounded-3xl p-5 space-y-4">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor}">
                <i class="fas fa-mosque text-xl ${accentText}"></i>
                <h3 class="font-bold text-xl font-kufi text-white">${m ? 'الصلوات' : 'صلواتكِ اليوم'}</h3>
                <span id="prayerProgress" class="mr-auto text-xs font-bold ${m ? 'text-sky-300/65 bg-sky-400/10' : 'text-fuchsia-300/65 bg-fuchsia-500/10'} px-2.5 py-1 rounded-lg font-kufi">0/5 فروض</span>
            </div>
            <div class="flex gap-3 text-xs font-kufi pb-0.5">
                <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full ${m ? 'bg-sky-400' : 'bg-fuchsia-400'}"></div><span class="text-white/38">فرض مؤدى</span></div>
                <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-green-400"></div><span class="text-white/38">سنة مؤداة</span></div>
            </div>
            <div id="prayersList" class="space-y-2.5"></div>
        </div>

        <!-- الأذكار والعادات -->
        <div class="${panel} rounded-3xl p-5 space-y-4">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor}">
                <i class="fas fa-gem text-xl ${accentText}"></i>
                <h3 class="font-bold text-xl font-kufi text-white">أذكارك ووِردك</h3>
            </div>
            <div class="space-y-3">
                <div id="${m ? 'm' : 'f'}_morning" onclick="window.toggleHabit('${m ? 'm' : 'f'}_morning')" class="prayer-row cursor-pointer select-none">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-cloud-sun ${accentText}"></i>
                        </div>
                        <span class="text-base font-amiri font-bold text-white">أذكار الصباح</span>
                    </div>
                    <div class="check-circle w-9 h-9 rounded-full border-2 border-white/18 flex items-center justify-center transition-all flex-shrink-0">
                        <i class="fas fa-check text-sm opacity-0 text-black"></i>
                    </div>
                </div>
                <div id="${m ? 'm' : 'f'}_evening" onclick="window.toggleHabit('${m ? 'm' : 'f'}_evening')" class="prayer-row cursor-pointer select-none">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-moon ${accentText}"></i>
                        </div>
                        <span class="text-base font-amiri font-bold text-white">أذكار المساء</span>
                    </div>
                    <div class="check-circle w-9 h-9 rounded-full border-2 border-white/18 flex items-center justify-center transition-all flex-shrink-0">
                        <i class="fas fa-check text-sm opacity-0 text-black"></i>
                    </div>
                </div>
                <div class="taraweeh-qiyam-grid">
                    <div id="${m ? 'm' : 'f'}_taraweeh" onclick="window.toggleHabit('${m ? 'm' : 'f'}_taraweeh')" class="night-prayer-card border border-white/7 ${cardBg} select-none">
                        <div class="w-10 h-10 rounded-full ${accentBg} flex items-center justify-center">
                            <i class="fas fa-star-and-crescent ${accentText} text-base"></i>
                        </div>
                        <span class="font-bold font-kufi text-white text-sm leading-tight">التراويح</span>
                        <span class="text-[10px] ${accentText}/55 font-amiri">صلاة الجماعة</span>
                        <div id="${m ? 'm' : 'f'}_taraweeh-check" class="w-7 h-7 rounded-full border-2 border-white/18 flex items-center justify-center transition-all">
                            <i class="fas fa-check text-xs opacity-0 text-black"></i>
                        </div>
                    </div>
                    <div id="${m ? 'm' : 'f'}_qiyam" onclick="window.toggleHabit('${m ? 'm' : 'f'}_qiyam')" class="night-prayer-card border border-white/7 ${cardBg} select-none">
                        <div class="w-10 h-10 rounded-full bg-purple-400/10 flex items-center justify-center">
                            <i class="fas fa-moon text-purple-300 text-base"></i>
                        </div>
                        <span class="font-bold font-kufi text-white text-sm leading-tight">قيام الليل</span>
                        <span class="text-[10px] text-purple-300/55 font-amiri">صلاة في البيت</span>
                        <div id="${m ? 'm' : 'f'}_qiyam-check" class="w-7 h-7 rounded-full border-2 border-white/18 flex items-center justify-center transition-all">
                            <i class="fas fa-check text-xs opacity-0 text-black"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- تسجيل اليوم -->
        <div class="${panel} rounded-3xl p-5 space-y-4">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor}">
                <i class="fas fa-book-open text-xl ${accentText}"></i>
                <h3 class="font-bold text-xl font-kufi text-white">تسجيل اليوم</h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="${cardBg} p-4 rounded-2xl border ${cardBorder} text-center">
                    <div class="text-xs font-bold ${accentText}/65 mb-2 font-kufi">صفحات القرآن</div>
                    <input type="number" id="quranInput" placeholder="0" inputmode="numeric"
                        class="w-full text-4xl font-bold text-center font-amiri leading-none highlight-input"
                        onchange="window.onInputChange()" oninput="window.onInputChange()">
                    <div class="text-xs text-white/40 mt-2 font-amiri">صفحة</div>
                </div>
                <div class="${cardBg} p-4 rounded-2xl border ${cardBorder} text-center flex flex-col items-center justify-between gap-2">
                    <div class="text-xs font-bold ${accentText}/65 font-kufi">أجزاء قرأت</div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.changeJuz(-1)" class="w-9 h-9 rounded-xl font-bold text-xl flex items-center justify-center active:scale-90 transition-transform ${m ? 'bg-sky-400/18 text-sky-200 border border-sky-400/25' : 'bg-fuchsia-500/22 text-fuchsia-300 border border-fuchsia-500/28'}">−</button>
                        <span id="juzCountDisplay" class="text-4xl font-bold font-amiri w-10 text-center leading-none text-white" style="transition:transform .18s ease">0</span>
                        <button onclick="window.changeJuz(1)" class="w-9 h-9 rounded-xl font-bold text-xl flex items-center justify-center active:scale-90 transition-transform ${m ? 'bg-sky-400/18 text-sky-200 border border-sky-400/25' : 'bg-fuchsia-500/22 text-fuchsia-300 border border-fuchsia-500/28'}">+</button>
                    </div>
                    <div class="text-xs text-white/40 font-amiri">جزء</div>
                </div>
            </div>

            <!-- شريط تقدم الختمة -->
            <div class="${cardBg} px-4 py-3 rounded-2xl border ${cardBorder}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-white/38 font-kufi">تقدمك نحو الختمة</span>
                    <span id="dashKhatmaLabel" class="text-xs font-bold ${accentText} font-kufi">الجزء 1</span>
                </div>
                <div class="h-2 bg-black/38 rounded-full overflow-hidden">
                    <div id="dashKhatmaBar" class="h-full rounded-full transition-all duration-700" style="width:0%;background:${accentColor};box-shadow:0 0 7px ${accentColor}55"></div>
                </div>
                <div class="flex justify-between mt-2 text-xs font-amiri">
                    <span id="dashPagesRead" class="text-white/45">0 صفحة</span>
                    <span class="${accentText}/65">فاضل <span id="dashPagesLeftNum">604</span> صفحة</span>
                </div>
            </div>

            <!-- ساعات العمل -->
            <div class="${cardBg} p-4 rounded-2xl border ${cardBorder} text-center">
                <div class="text-xs font-bold ${accentText}/65 mb-2 font-kufi">ساعات العمل / المذاكرة</div>
                <input type="number" id="workInput" placeholder="0" inputmode="decimal"
                    class="w-full text-4xl font-bold text-center font-amiri leading-none highlight-input"
                    onchange="window.onInputChange()" oninput="window.onInputChange()">
                <div class="text-xs text-white/40 mt-2 font-amiri">ساعة</div>
            </div>

            <!-- الدروس -->
            <div class="${cardBg} p-4 rounded-2xl border ${cardBorder}">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-headphones ${accentText} text-sm"></i>
                        <div class="text-xs font-bold ${accentText}/65 font-kufi">الدروس والبودكاست اليوم</div>
                    </div>
                    <span id="lessonsCount" class="text-xs ${accentText} bg-black/28 px-2 py-1 rounded-lg font-kufi font-bold">0 درس</span>
                </div>
                <div class="flex gap-2 mb-3">
                    <input type="text" id="lessonInput" placeholder="اكتب الدرس أو البودكاست..."
                        class="flex-1 min-w-0 highlight-input text-sm font-amiri text-right"
                        onkeydown="if(event.key==='Enter') window.addLesson()">
                    <button onclick="window.addLesson()" class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl transition-all active:scale-88 ${m ? 'bg-sky-500 text-white' : 'bg-fuchsia-500 text-white'}">+</button>
                </div>
                <div id="lessonsList" class="space-y-2 max-h-40 overflow-y-auto"></div>
            </div>
        </div>

        <!-- الأداء -->
        <div class="${panel} rounded-3xl p-5 space-y-5">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor}">
                <i class="fas fa-chart-line text-xl ${accentText}"></i>
                <h3 class="font-bold text-xl font-kufi text-white">أداؤك اليوم</h3>
            </div>
            <div class="flex flex-col items-center gap-3">
                <div class="relative w-44 h-44">
                    <svg class="progress-ring w-full h-full -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="14"/>
                        <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="11"/>
                        <circle id="fardRing"   cx="100" cy="100" r="88" fill="none" stroke="${accentColor}" stroke-width="14" stroke-linecap="round" stroke-dasharray="553" stroke-dashoffset="553"/>
                        <circle id="sunnahRing" cx="100" cy="100" r="68" fill="none" stroke="#4ade80"     stroke-width="11" stroke-linecap="round" stroke-dasharray="427" stroke-dashoffset="427"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span id="performancePct"   class="text-4xl font-bold text-white font-kufi">0%</span>
                        <span id="performanceLabel" class="text-xs font-amiri ${accentText} mt-0.5 text-center leading-tight">سعيٌ طيب</span>
                    </div>
                </div>
                <div class="flex gap-5 text-xs font-kufi">
                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full" style="background:${accentColor}"></div><span class="text-white/45">الفروض</span></div>
                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-green-400"></div><span class="text-white/45">السنن</span></div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2.5">
                <div class="perf-stat-card">
                    <div class="text-xs ${m ? 'text-sky-300/55' : 'text-fuchsia-300/55'} font-kufi mb-1">الفروض</div>
                    <div class="perf-stat-val ${m ? 'text-sky-300' : 'text-fuchsia-300'}" id="todayFardCount">0/5</div>
                    <div class="perf-bar-wrap"><div class="perf-bar-fill" style="background:${accentColor};width:0%" id="todayFardBar"></div></div>
                </div>
                <div class="perf-stat-card">
                    <div class="text-xs text-green-400/55 font-kufi mb-1">السنن</div>
                    <div class="perf-stat-val text-green-400" id="todaySunnahCount">0</div>
                    <div class="perf-bar-wrap"><div class="perf-bar-fill bg-green-400" style="width:0%" id="todaySunnahBar"></div></div>
                </div>
                <div class="perf-stat-card">
                    <div class="text-xs text-purple-400/55 font-kufi mb-1">الأذكار</div>
                    <div class="perf-stat-val text-purple-300" id="todayHabitsCount">0</div>
                    <div class="perf-bar-wrap"><div class="perf-bar-fill bg-purple-400" style="width:0%" id="todayHabitsBar"></div></div>
                </div>
            </div>

            <!-- ختمة القرآن -->
            <div class="${m ? 'bg-[#0a0a0a]' : 'bg-[#220d3a]'} p-4 rounded-2xl border ${m ? 'border-sky-400/10' : 'border-fuchsia-500/10'}">
                <div class="flex justify-between items-center mb-2.5">
                    <span class="text-sm font-bold text-white/55 font-kufi">مسار ختمة القرآن</span>
                    <span id="khatmaLabel" class="text-xs font-bold ${m ? 'text-sky-300 bg-sky-400/10' : 'text-fuchsia-300 bg-fuchsia-500/10'} px-2.5 py-1 rounded-lg font-kufi">الجزء 1</span>
                </div>
                <div class="relative h-2.5 bg-black/45 rounded-full overflow-hidden border border-white/4 mb-3">
                    <div id="khatmaBar" class="absolute top-0 right-0 h-full rounded-full transition-all duration-1000" style="width:0%;background:${accentColor};box-shadow:0 0 10px ${accentColor}44"></div>
                </div>
                <div class="flex justify-between text-center">
                    <div><div class="text-xs ${m ? 'text-sky-300/45' : 'text-fuchsia-300/45'} font-kufi">قُرئت</div><div id="currentPages" class="text-2xl font-bold text-white font-amiri">0</div></div>
                    <div><div class="text-xs ${accentText} font-kufi font-bold">المجموع</div><div id="totalPagesAll" class="text-xl font-bold ${accentText} font-amiri">0</div></div>
                    <div><div class="text-xs text-white/28 font-kufi">متبقي</div><div id="remainingPages" class="text-2xl font-bold text-white/38 font-amiri">604</div></div>
                </div>
            </div>

            <!-- حصاد الشهر -->
            <div>
                <div class="text-sm font-bold text-white/45 font-kufi mb-3 flex items-center gap-2">
                    <i class="fas fa-chart-bar ${accentText} text-sm"></i>
                    حصاد الشهر المبارك
                </div>
                <div class="grid grid-cols-2 gap-2.5">
                    <div class="${m ? 'bg-[#0a0a0a]' : 'bg-[#220d3a]'} p-3.5 rounded-2xl border ${m ? 'border-sky-400/10' : 'border-fuchsia-500/10'} text-center">
                        <div class="text-3xl font-bold text-white font-amiri" id="monthFard">0</div>
                        <div class="text-xs ${m ? 'text-sky-300/65' : 'text-fuchsia-300/65'} mt-1 font-kufi">فروض مؤداة</div>
                    </div>
                    <div class="${m ? 'bg-[#0a0a0a]' : 'bg-[#220d3a]'} p-3.5 rounded-2xl border ${m ? 'border-sky-400/10' : 'border-fuchsia-500/10'} text-center">
                        <div class="text-3xl font-bold text-white font-amiri" id="monthSunnah">0</div>
                        <div class="text-xs ${m ? 'text-sky-300/65' : 'text-fuchsia-300/65'} mt-1 font-kufi">سنن ونوافل</div>
                    </div>
                    <div class="${m ? 'bg-[#0a0a0a]' : 'bg-[#220d3a]'} p-3.5 rounded-2xl border ${m ? 'border-sky-400/10' : 'border-fuchsia-500/10'} text-center">
                        <div class="text-3xl font-bold text-white font-amiri" id="monthTaraweeh">0</div>
                        <div class="text-xs ${m ? 'text-sky-300/65' : 'text-fuchsia-300/65'} mt-1 font-kufi">أيام التراويح</div>
                    </div>
                    <div class="bg-gradient-to-br ${m ? 'from-sky-400/10' : 'from-fuchsia-500/13'} to-transparent p-3.5 rounded-2xl border ${m ? 'border-sky-400/20' : 'border-fuchsia-500/22'} text-center">
                        <div class="text-3xl font-bold ${m ? 'text-sky-300' : 'text-fuchsia-400'} font-amiri" id="monthScore">0%</div>
                        <div class="text-xs ${m ? 'text-sky-300' : 'text-fuchsia-400'} mt-1 font-kufi font-bold">الالتزام العام</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- زر الحفظ -->
        <button onclick="window.saveData()" id="saveBtn"
            class="w-full font-extrabold font-kufi py-4 rounded-2xl text-lg transition-all active:scale-95 ${m ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_4px_18px_rgba(56,189,248,0.32)] border-b-4 border-sky-700' : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-[0_4px_18px_rgba(217,70,239,0.32)] border-b-4 border-purple-900'}">
            ${m ? '💾' : '✨'} حفظ يومياتي
        </button>

        <div class="flex justify-center gap-8 py-1">
            <button onclick="window.goHome()"   class="text-sm text-white/35 font-kufi active:text-white transition-colors">تعديل الملف الشخصي</button>
            <button onclick="window.resetData()" class="text-sm text-red-500/45 font-kufi active:text-red-400 transition-colors">تصفير السجل</button>
        </div>
        ${FOOTER_HTML}
    </div>`;
}

// ─── تهيئة أزرار الصلوات ────────────────────────────
export function initPrayersUI() {
    const list = document.getElementById('prayersList');
    if (!list) return;
    const m = state.currentTheme === 'male';
    const iconBg = m ? 'bg-sky-400/10' : 'bg-fuchsia-500/10';
    const iconColor = m ? 'text-sky-300' : 'text-fuchsia-400';
    list.innerHTML = Object.keys(PRAYERS_CONFIG).map(key => {
        const p = PRAYERS_CONFIG[key];
        const icon = PRAYER_ICONS[key] || 'fa-circle';
        return `
        <div class="prayer-row" id="row-${key}">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}">
                    <i class="fas ${icon} ${iconColor} text-sm"></i>
                </div>
                <span class="text-base font-bold font-amiri text-white">${p.label}</span>
            </div>
            <div class="flex gap-2">
                ${p.fard ? `<button onclick="window.togglePrayer('${key}','fard')"   id="btn-${key}-fard"   class="prayer-btn font-kufi">فرض</button>` : ''}
                ${p.sunnah ? `<button onclick="window.togglePrayer('${key}','sunnah')" id="btn-${key}-sunnah" class="prayer-btn font-amiri"><span class="sunnah-check">سنة</span></button>` : ''}
            </div>
        </div>`;
    }).join('');
}

// ─── تحديث واجهة الرئيسية ───────────────────────────
export function updateDashboardUI() {
    const today = new Date().toISOString().split('T')[0];
    const dateObj = new Date(state.currentDate);
    const dateEl = document.getElementById('dateDisplay');
    const tagEl = document.getElementById('dateTag');
    if (dateEl) dateEl.textContent = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
    if (tagEl) tagEl.textContent = state.currentDate === today ? 'اليوم' : state.currentDate < today ? 'يوم سابق' : 'يوم قادم';

    const day = state.appData[state.currentDate] || {};
    const prayers = day.prayers || {};
    let fardDone = 0, fardTotal = 0, sunnahDone = 0;

    Object.keys(PRAYERS_CONFIG).forEach(key => {
        const st = prayers[key] || {};
        const p = PRAYERS_CONFIG[key];
        if (p.fard) fardTotal++;

        const fBtn = document.getElementById(`btn-${key}-fard`);
        const sBtn = document.getElementById(`btn-${key}-sunnah`);
        const row = document.getElementById(`row-${key}`);
        const doneClass = state.currentTheme === 'male' ? 'row-done-m' : 'row-done-f';

        if (fBtn) {
            if (st.fard) {
                fardDone++;
                fBtn.className = `prayer-btn font-kufi ${state.currentTheme === 'male' ? 'btn-fard-done' : 'btn-fard-done-f'}`;
                fBtn.innerHTML = '<i class="fas fa-check ml-1 text-xs"></i> فرض';
            } else {
                fBtn.className = 'prayer-btn font-kufi';
                fBtn.innerHTML = 'فرض';
            }
        }
        if (sBtn) {
            if (st.sunnah) {
                sunnahDone++;
                sBtn.className = `prayer-btn font-amiri ${state.currentTheme === 'male' ? 'btn-sunnah-done' : 'btn-sunnah-done-f'}`;
                sBtn.innerHTML = '<i class="fas fa-check ml-1 text-xs"></i> سنة';
            } else {
                sBtn.className = 'prayer-btn font-amiri';
                sBtn.innerHTML = '<span class="sunnah-check">سنة</span>';
            }
        }
        if (row) { if (st.fard) row.classList.add(doneClass); else row.classList.remove(doneClass); }
    });

    const ppEl = document.getElementById('prayerProgress');
    if (ppEl) ppEl.textContent = `${fardDone}/${fardTotal} فروض`;

    // ─── الأذكار ─────────────────────────────────────
    const prefix = state.currentTheme === 'male' ? 'm' : 'f';
    ['morning', 'evening', 'taraweeh', 'qiyam'].forEach(h => {
        const id = `${prefix}_${h}`;
        const el = document.getElementById(id);
        if (!el) return;
        const isDone = !!day[id];

        if (h === 'taraweeh' || h === 'qiyam') {
            const checkEl = document.getElementById(`${id}-check`);
            const checkIcon = checkEl?.querySelector('i.fa-check');
            if (isDone) {
                el.style.borderColor = state.currentTheme === 'male' ? 'rgba(56,189,248,0.5)' : 'rgba(240,171,252,0.55)';
                el.style.background = state.currentTheme === 'male' ? 'rgba(56,189,248,0.08)' : 'rgba(240,171,252,0.08)';
                if (checkEl) { checkEl.style.background = h === 'qiyam' ? '#a78bfa' : (state.currentTheme === 'male' ? '#38bdf8' : '#d946ef'); checkEl.style.borderColor = 'transparent'; }
                if (checkIcon) { checkIcon.style.opacity = '1'; checkIcon.style.color = '#000'; }
            } else {
                el.style.borderColor = ''; el.style.background = '';
                if (checkEl) { checkEl.style.background = ''; checkEl.style.borderColor = ''; }
                if (checkIcon) checkIcon.style.opacity = '0';
            }
            return;
        }

        const circleBg = state.currentTheme === 'male' ? 'bg-sky-400' : 'bg-fuchsia-400';
        const circleBorder = state.currentTheme === 'male' ? 'border-sky-400' : 'border-fuchsia-400';
        const activeClass = state.currentTheme === 'male' ? 'habit-active-m' : 'habit-active-f';
        const circle = el.querySelector('.check-circle');
        const cIcon = el.querySelector('i.fa-check');
        if (isDone) {
            el.classList.add(activeClass);
            circle?.classList.add(circleBg, circleBorder);
            if (cIcon) { cIcon.classList.remove('opacity-0'); cIcon.classList.add('opacity-100'); }
        } else {
            el.classList.remove(activeClass);
            circle?.classList.remove(circleBg, circleBorder);
            if (cIcon) { cIcon.classList.add('opacity-0'); cIcon.classList.remove('opacity-100'); }
        }
    });

    // ─── القرآن ──────────────────────────────────────
    const qi = document.getElementById('quranInput');
    const wi = document.getElementById('workInput');
    if (qi) qi.value = day.quran || '';
    if (wi) wi.value = day.work || '';

    renderLessonsList();
    updatePerformanceStats(fardDone, fardTotal, sunnahDone);
}

// ─── شريط الختمة ────────────────────────────────────
export function refreshDashKhatma(precomputedTotal) {
    let total = precomputedTotal;
    if (total === undefined) {
        total = 0;
        Object.values(state.appData).forEach(d => { total += (d.quran || 0) + calcJuzPages(d.juzCount || 0); });
    }
    const inCycle = total % 604;
    const khatmaNum = Math.floor(total / 604) + 1;
    const juzNum = Math.min(30, Math.floor(inCycle / 20) + 1);
    const pct = (inCycle / 604 * 100).toFixed(1);

    const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    const setW = (id, w) => { const e = document.getElementById(id); if (e) e.style.width = w; };

    setW('dashKhatmaBar', pct + '%');
    setEl('dashKhatmaLabel', khatmaNum > 1 ? `الختمة ${khatmaNum} · الجزء ${juzNum}` : `الجزء ${juzNum}`);
    setEl('dashPagesRead', `${inCycle} صفحة`);
    setEl('dashPagesLeftNum', 604 - inCycle);

    const juzEl = document.getElementById('juzCountDisplay');
    if (juzEl) juzEl.textContent = state.appData[state.currentDate]?.juzCount || 0;
}

// ─── إحصاءات الأداء ─────────────────────────────────
function updatePerformanceStats(fardDoneToday = 0, fardTotalToday = 5, sunnahDoneToday = 0) {
    const cd = state.appData[state.currentDate] || {};
    const hasMorning = !!(cd.m_morning || cd.f_morning);
    const hasEvening = !!(cd.m_evening || cd.f_evening);
    const hasTaraweeh = !!(cd.m_taraweeh || cd.f_taraweeh);
    const hasQiyam = !!(cd.m_qiyam || cd.f_qiyam);
    const habitsCount = [hasMorning, hasEvening, hasTaraweeh, hasQiyam].filter(Boolean).length;

    let totalFard = 0, totalSunnah = 0, totalTaraweeh = 0, totalQiyam = 0, totalQ = 0;
    const daysTracked = Math.max(Object.keys(state.appData).length, 1);

    Object.values(state.appData).forEach(d => {
        totalQ += (d.quran || 0) + calcJuzPages(d.juzCount || 0);
        if (d.prayers) {
            Object.keys(PRAYERS_CONFIG).forEach(k => {
                if (PRAYERS_CONFIG[k].fard && d.prayers[k]?.fard) totalFard++;
                if (PRAYERS_CONFIG[k].sunnah && d.prayers[k]?.sunnah) totalSunnah++;
            });
        }
        if (d.m_taraweeh || d.f_taraweeh) totalTaraweeh++;
        if (d.m_qiyam || d.f_qiyam) totalQiyam++;
    });

    const quranScore = Math.min((cd.quran || 0) / 10, 1);
    const dailyPerf = Math.round(
        (fardDoneToday / Math.max(fardTotalToday, 1)) * 50 +
        (sunnahDoneToday / 5) * 20 +
        (habitsCount / 4) * 20 +
        quranScore * 10
    );

    const fardRing = document.getElementById('fardRing');
    const sunnahRing = document.getElementById('sunnahRing');
    if (fardRing) fardRing.style.strokeDashoffset = 553 - 553 * (fardDoneToday / Math.max(fardTotalToday, 1));
    if (sunnahRing) sunnahRing.style.strokeDashoffset = 427 - 427 * Math.min(sunnahDoneToday / 5, 1);

    const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    const setW = (id, p) => { const e = document.getElementById(id); if (e) e.style.width = p + '%'; };

    setEl('performancePct', Math.min(dailyPerf, 100) + '%');
    let lbl = 'سعيٌ طيِّب';
    if (dailyPerf >= 30) lbl = 'أنتَ في الطريق';
    if (dailyPerf >= 55) lbl = 'قُربٌ جميل';
    if (dailyPerf >= 75) lbl = 'نورٌ على نور';
    if (dailyPerf >= 90) lbl = 'رُوحٌ وريحان ✨';
    setEl('performanceLabel', lbl);

    setEl('todayFardCount', `${fardDoneToday}/${fardTotalToday}`);
    setW('todayFardBar', fardDoneToday / Math.max(fardTotalToday, 1) * 100);
    setEl('todaySunnahCount', sunnahDoneToday);
    setW('todaySunnahBar', Math.min(sunnahDoneToday / 5 * 100, 100));
    setEl('todayHabitsCount', `${habitsCount}/4`);
    setW('todayHabitsBar', habitsCount / 4 * 100);
    setEl('monthFard', totalFard);
    setEl('monthSunnah', totalSunnah);
    setEl('monthTaraweeh', totalTaraweeh + totalQiyam);

    const score = Math.round(
        (totalFard / (daysTracked * 5)) * 50 +
        (totalSunnah / (daysTracked * 5)) * 20 +
        ((totalTaraweeh + totalQiyam) / (daysTracked * 2)) * 20 +
        Math.min(totalQ / (daysTracked * 10), 1) * 10
    );
    setEl('monthScore', Math.min(score, 100) + '%');

    const cQ = totalQ % 604;
    const kBar = document.getElementById('khatmaBar');
    if (kBar) kBar.style.width = (cQ / 604 * 100) + '%';
    setEl('currentPages', cQ);
    setEl('remainingPages', 604 - cQ);
    setEl('totalPagesAll', totalQ);
    // Pass totalQ to refreshDashKhatma to avoid a second full loop
    refreshDashKhatma(totalQ);
    const kLabel = document.getElementById('khatmaLabel');
    if (kLabel) { const j = Math.floor(totalQ / 20) + 1; kLabel.textContent = `الجزء ${j <= 30 ? j : '30+'}`; }

    let streak = 0;
    const dates = Object.keys(state.appData).sort().reverse();
    for (const d of dates) {
        const fc = Object.keys(PRAYERS_CONFIG).filter(k => PRAYERS_CONFIG[k].fard && state.appData[d].prayers?.[k]?.fard).length;
        if (fc >= 3) streak++; else break;
    }
    setEl('streakCount', streak);
}

// ─── الدروس ─────────────────────────────────────────
export function renderLessonsList() {
    const listEl = document.getElementById('lessonsList');
    const countEl = document.getElementById('lessonsCount');
    if (!listEl) return;
    const lessons = state.appData[state.currentDate]?.lessons || [];
    if (countEl) countEl.textContent = lessons.length + ' درس';
    const m = state.currentTheme === 'male';
    if (!lessons.length) {
        listEl.innerHTML = `<p class="text-xs text-white/22 text-center font-amiri py-1.5">لم تسجّل دروساً بعد</p>`;
        return;
    }
    listEl.innerHTML = lessons.map((l, i) => `
        <div class="flex items-center gap-2 bg-black/22 rounded-xl px-3 py-2.5 border border-white/5">
            <i class="fas fa-podcast ${m ? 'text-sky-300' : 'text-fuchsia-400'} text-xs flex-shrink-0"></i>
            <span class="flex-1 text-sm font-amiri text-white/88 text-right leading-snug">${l.text}</span>
            <span class="text-[10px] text-white/22 font-kufi flex-shrink-0">${l.time || ''}</span>
            <button onclick="window.removeLesson(${i})" class="opacity-38 active:opacity-100 transition-opacity flex-shrink-0 p-1">
                <i class="fas fa-times text-red-400 text-xs"></i>
            </button>
        </div>`).join('');
}

// ─── حفظ البيانات ────────────────────────────────────
export async function saveData() {
    const qi = document.getElementById('quranInput');
    const wi = document.getElementById('workInput');
    const quran = parseInt(qi?.value) || (state.appData[state.currentDate]?.quran || 0);
    const work = parseFloat(wi?.value) || 0;
    if (!state.appData[state.currentDate]) state.appData[state.currentDate] = {};
    state.appData[state.currentDate].quran = quran;
    state.appData[state.currentDate].work = work;

    const btn = document.getElementById('saveBtn');
    if (btn) { btn.textContent = '⏳ يُسجَّل سعيُك..'; btn.disabled = true; }

    try {
        await updateDoc(doc(db, "users", state.currentUser), { appData: state.appData });
        localStorage.setItem('ramadanTrackerData_v5', JSON.stringify(state.appData));
        showToast('تقبل الله منك صالح الأعمال ✨');
        if (quran > 0 && typeof confetti === 'function') confetti({ particleCount: 110, spread: 65, origin: { y: 0.7 }, colors: ['#38bdf8', '#c084fc', '#fff'] });
        markSaved();
    } catch {
        localStorage.setItem('ramadanTrackerData_v5', JSON.stringify(state.appData));
        showToast('تم الحفظ على الجهاز بنجاح ✓');
        markSaved();
    } finally {
        if (btn) { btn.textContent = state.currentTheme === 'male' ? '💾 حفظ يومياتي' : '✨ حفظ يومياتي'; btn.disabled = false; }
        updateDashboardUI();
    }
}

let _autoSaveTimer = null;
export async function autoSave() {
    const qi = document.getElementById('quranInput');
    const wi = document.getElementById('workInput');
    if (!state.appData[state.currentDate]) state.appData[state.currentDate] = {};
    if (qi) state.appData[state.currentDate].quran = parseInt(qi.value) || 0;
    if (wi) state.appData[state.currentDate].work = parseFloat(wi.value) || 0;

    // Immediately save to localStorage (instant, no network)
    localStorage.setItem('ramadanTrackerData_v5', JSON.stringify(state.appData));

    // Debounce Firebase write — wait 1500ms of inactivity
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(async () => {
        try {
            await updateDoc(doc(db, "users", state.currentUser), { appData: state.appData });
        } catch {
            // Already saved to localStorage above
        }
    }, 1500);
}

