// ═══════════════════════════════════════
//  duaa.js — صفحة الدعاء وأوقات الصلاة
// ═══════════════════════════════════════
import { state, showToast, FOOTER_HTML } from './state.js';

let selectedCity = 'alex';
let iftarTimerInterval = null;

const CITIES = {
    alex: { lat: 31.2001, lng: 29.9187, name: 'الإسكندرية' },
    cairo: { lat: 30.0444, lng: 31.2357, name: 'القاهرة' },
    giza: { lat: 30.0131, lng: 31.2089, name: 'الجيزة' },
    sharkia: { lat: 30.5965, lng: 31.5041, name: 'الشرقية' },
    dakahlia: { lat: 31.0409, lng: 31.3785, name: 'الدقهلية' },
    beheira: { lat: 30.8481, lng: 30.3436, name: 'البحيرة' },
    gharbia: { lat: 30.8754, lng: 31.0335, name: 'الغربية' },
    kafr: { lat: 30.9395, lng: 31.1109, name: 'كفر الشيخ' },
    monufia: { lat: 30.5972, lng: 30.9876, name: 'المنوفية' },
    qalyubia: { lat: 30.1792, lng: 31.2117, name: 'القليوبية' },
    port: { lat: 31.2653, lng: 32.3019, name: 'بورسعيد' },
    ismailia: { lat: 30.5833, lng: 32.2667, name: 'الإسماعيلية' },
    suez: { lat: 29.9668, lng: 32.5498, name: 'السويس' },
    damietta: { lat: 31.4175, lng: 31.8144, name: 'دمياط' },
    aswan: { lat: 24.0889, lng: 32.8998, name: 'أسوان' },
    luxor: { lat: 25.6872, lng: 32.6396, name: 'الأقصر' },
    asyut: { lat: 27.1809, lng: 31.1837, name: 'أسيوط' },
    sohag: { lat: 26.5569, lng: 31.6948, name: 'سوهاج' },
    qena: { lat: 26.1551, lng: 32.7160, name: 'قنا' },
    minya: { lat: 28.0871, lng: 30.7618, name: 'المنيا' },
    fayoum: { lat: 29.3084, lng: 30.8428, name: 'الفيوم' },
    benisuef: { lat: 29.0661, lng: 31.0994, name: 'بني سويف' },
};

// ─── HTML صفحة الدعاء ──────────────────────────────
export function getDuaaHTML() {
    const m = state.currentTheme === 'male';
    const panel = m ? 'glass-panel' : 'glass-card';
    const accentText = m ? 'text-sky-300' : 'text-fuchsia-400';
    const borderColor = m ? 'border-sky-400/13' : 'border-fuchsia-500/13';
    const iftarText = m ? 'text-sky-300' : 'text-fuchsia-300';
    const cardBorder = m ? 'border-sky-400/8' : 'border-fuchsia-500/8';
    const cardBg2 = m ? 'bg-[#0a0a0a]' : 'bg-[#220d3a]';

    const duas = [
        "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّار",
        "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ",
        "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        "رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي * وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي * يَفْقَهُوا قَوْلِي",
        "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِك",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَل، وَأَعُوذُ بِكَ مِنَ النَّارِ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَل",
        "اللَّهُمَّ تَقَبَّلْ صِيَامَنَا وَقِيَامَنَا وَرُكُوعَنَا وَسُجُودَنَا، وَاجْعَلْنَا مِنْ عُتَقَائِكَ مِنَ النَّار",
        "اللَّهُمَّ بَلِّغْنَا رَمَضَان، وَبَلِّغْنَا لَيْلَةَ الْقَدْر، وَاجْعَلْنَا مِنَ الْفَائِزِينَ فِيهَا",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
        "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْت، وَعَافِنِي فِيمَنْ عَافَيْت، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْت",
        "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ، وَدَرَكِ الشَّقَاءِ، وَسُوءِ الْقَضَاءِ، وَشَمَاتَةِ الْأَعْدَاء",
        "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَىٰ وَالتُّقَىٰ وَالْعَفَافَ وَالْغِنَىٰ",
        "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَاب",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ",
        "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ، وَحُبَّ مَنْ يُحِبُّكَ، وَحُبَّ عَمَلٍ يُقَرِّبُنِي إِلَىٰ حُبِّك",
        "رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا",
        "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِين",
        "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيم، وَتُبْ عَلَيْنَا إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيم",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الْأَمْرِ، وَالْعَزِيمَةَ عَلَى الرُّشْد",
        "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِين",
        "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاك",
    ];

    return `
    <div id="duaa-view" class="hidden animate-fade-in pb-32 px-4 max-w-lg mx-auto space-y-4">
        <div class="text-center mt-4 mb-1">
            <i class="fas fa-kaaba text-5xl ${accentText} mb-3 block animate-float"></i>
            <h2 class="text-3xl font-amiri font-bold text-white">الدُّعَاءُ وَالأَوْقَات</h2>
        </div>

        <!-- اختيار المدينة -->
        <div class="${panel} rounded-2xl p-4">
            <div class="text-sm font-bold ${accentText} mb-3 font-kufi text-center">اختر محافظتك</div>
            <select id="citySelect" onchange="window.selectCity(this.value)" 
                class="w-full bg-[#0a0a0a] border-2 ${m ? 'border-sky-400/30' : 'border-fuchsia-500/30'} rounded-xl px-4 py-3.5 text-white font-kufi text-base font-bold focus:outline-none focus:${m ? 'border-sky-400' : 'border-fuchsia-500'} transition-all appearance-none cursor-pointer"
                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2338bdf8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: left 12px center; background-size: 20px; padding-left: 40px;">
                <option value="alex">الإسكندرية</option>
                <option value="cairo">القاهرة</option>
                <option value="giza">الجيزة</option>
                <option value="sharkia">الشرقية</option>
                <option value="dakahlia">الدقهلية</option>
                <option value="beheira">البحيرة</option>
                <option value="gharbia">الغربية</option>
                <option value="kafr">كفر الشيخ</option>
                <option value="monufia">المنوفية</option>
                <option value="qalyubia">القليوبية</option>
                <option value="port">بورسعيد</option>
                <option value="ismailia">الإسماعيلية</option>
                <option value="suez">السويس</option>
                <option value="damietta">دمياط</option>
                <option value="aswan">أسوان</option>
                <option value="luxor">الأقصر</option>
                <option value="asyut">أسيوط</option>
                <option value="sohag">سوهاج</option>
                <option value="qena">قنا</option>
                <option value="minya">المنيا</option>
                <option value="fayoum">الفيوم</option>
                <option value="benisuef">بني سويف</option>
            </select>
        </div>

        <!-- أوقات الصلاة -->
        <div class="${panel} rounded-3xl p-4 space-y-4">
            <div class="flex items-center gap-2 pb-2 border-b ${borderColor}">
                <i class="fas fa-clock ${accentText} text-sm"></i>
                <span class="text-sm font-bold font-kufi text-white/65" id="azanDateLabel">...</span>
            </div>
            <div class="grid grid-cols-3 gap-2.5">
                ${[['fajr', 'الفَجْر 🌙'], ['sunrise', 'الشُّرُوق ☀️'], ['dhuhr', 'الظُّهْر 🕛'], ['asr', 'العَصْر 🌤️'], ['maghrib', 'المَغْرِب 🌅'], ['isha', 'العِشَاء 🌃']].map(([k, lbl]) => `
                <div class="bg-black/28 border ${cardBorder} rounded-xl p-3 text-center">
                    <div class="text-xs ${accentText}/55 font-kufi mb-1">${lbl}</div>
                    <div class="text-lg font-bold text-white font-amiri" id="az-${k}">--:--</div>
                </div>`).join('')}
            </div>
            <div id="iftarCountdown" class="text-center py-1.5 text-sm font-kufi ${accentText}/65 hidden">
                <i class="fas fa-hourglass-half ml-1 ${accentText}"></i>
                <span id="iftarCountdownText"></span>
            </div>
        </div>

        <!-- دعاء الإفطار -->
        <div class="${panel} rounded-3xl p-5 relative overflow-hidden">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor} mb-4">
                <span class="text-2xl">🌅</span>
                <h3 class="font-bold text-xl font-kufi ${iftarText}">دُعَاءُ الإِفْطَار</h3>
            </div>
            <p class="font-amiri text-xl text-white leading-[2.4] text-center mb-3 tracking-wide">
                اللَّهُمَّ لَكَ صُمْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ،<br>
                ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ،<br>
                وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّه
            </p>
            <div class="text-center text-xs ${accentText}/45 font-amiri">رواه أبو داود</div>
        </div>

        <!-- دعاء ليلة القدر -->
        <div class="${panel} rounded-3xl p-5 relative overflow-hidden">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor} mb-4">
                <span class="text-2xl">🌙</span>
                <h3 class="font-bold text-xl font-kufi ${iftarText}">دُعَاءُ لَيْلَةِ الْقَدْر</h3>
            </div>
            <p class="font-amiri text-xl text-white leading-[2.4] text-center tracking-wide">
                اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيم،<br>
                تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
            </p>
            <div class="text-center text-xs ${accentText}/45 font-amiri mt-3">رواه الترمذي وصححه</div>
        </div>

        <!-- أدعية مختارة -->
        <div class="${panel} rounded-3xl p-5 space-y-4">
            <div class="flex items-center gap-3 pb-3 border-b ${borderColor}">
                <i class="fas fa-book-open text-xl ${accentText}"></i>
                <h3 class="font-bold text-xl font-kufi text-white">أَدْعِيَةٌ مُخْتَارَة</h3>
            </div>
            <div class="space-y-3">
                ${duas.map(d => `
                <div class="p-4 bg-black/22 rounded-2xl border border-white/5 active:scale-[0.98] transition-transform cursor-pointer text-right" onclick="window.copyDua(this)">
                    <p class="font-amiri text-lg text-white leading-[2.2]">${d}</p>
                    <div class="text-xs ${accentText}/35 font-kufi mt-2 flex items-center gap-1">
                        <i class="fas fa-copy text-[10px]"></i> اضغط للنسخ
                    </div>
                </div>`).join('')}
            </div>
        </div>

        <!-- صدقة جارية -->
        <div class="${panel} p-5 rounded-3xl text-center relative overflow-hidden">
            <div class="text-sm font-bold ${accentText} mb-4 font-kufi">${m ? '💙' : '💜'} صَدَقَةٌ جَارِيَة</div>
            <p class="font-amiri text-lg text-white/82 leading-[2.4] mb-5 tracking-wide">
                اللَّهُمَّ اغْفِرْ لِمَوْتَانَا وَمَوْتَى الْمُسْلِمِين،<br>
                وَارْحَمْهُمْ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْء
            </p>
            <div class="font-amiri text-lg font-bold text-white space-y-2.5 leading-relaxed">
                <div class="py-2 border-b ${m ? 'border-sky-400/13' : 'border-fuchsia-500/13'}">عَطِيَّة إِبْرَاهِيم</div>
                <div class="${m ? 'text-sky-200' : 'text-fuchsia-200'} py-2 border-b ${m ? 'border-sky-400/13' : 'border-fuchsia-500/13'}">أَحْمَد مُحَمَّد السَّيِّد عَلِيوَه</div>
                <div class="py-2">حَمْزَة مُحَمَّد إِبْرَاهِيم</div>
            </div>
        </div>
        ${FOOTER_HTML}
    </div>`;
}

// ─── حساب أوقات الصلاة باستخدام Aladhan API ──────────
async function calcPrayerTimes(lat, lng, dateObj) {
    try {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();

        // استخدام Aladhan API - طريقة الحساب المصرية (method=5)
        const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=5`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.timings) {
            const timings = data.data.timings;

            const convertTo12Hour = (time24) => {
                const [h, m] = time24.split(':').map(Number);
                const period = h >= 12 ? 'م' : 'ص';
                const h12 = h % 12 || 12;
                return `${h12}:${String(m).padStart(2, '0')} ${period}`;
            };

            const parseTime = (timeStr) => {
                const [h, m] = timeStr.split(':').map(Number);
                return h + m / 60;
            };

            return {
                fajr: { fmt: convertTo12Hour(timings.Fajr), raw: parseTime(timings.Fajr) },
                sunrise: { fmt: convertTo12Hour(timings.Sunrise), raw: parseTime(timings.Sunrise) },
                dhuhr: { fmt: convertTo12Hour(timings.Dhuhr), raw: parseTime(timings.Dhuhr) },
                asr: { fmt: convertTo12Hour(timings.Asr), raw: parseTime(timings.Asr) },
                maghrib: { fmt: convertTo12Hour(timings.Maghrib), raw: parseTime(timings.Maghrib) },
                isha: { fmt: convertTo12Hour(timings.Isha), raw: parseTime(timings.Isha) },
            };
        }
    } catch (error) {
        console.error('خطأ في جلب مواقيت الصلاة:', error);
    }

    // في حالة الفشل، نرجع قيم افتراضية
    return {
        fajr: { fmt: '--:--', raw: 0 },
        sunrise: { fmt: '--:--', raw: 0 },
        dhuhr: { fmt: '--:--', raw: 0 },
        asr: { fmt: '--:--', raw: 0 },
        maghrib: { fmt: '--:--', raw: 0 },
        isha: { fmt: '--:--', raw: 0 },
    };
}

// ─── عرض أوقات الصلاة ──────────────────────────────
export async function renderPrayerTimes(city) {
    const c = CITIES[city];
    const now = new Date();
    const times = await calcPrayerTimes(c.lat, c.lng, now);
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(k => {
        const el = document.getElementById(`az-${k}`);
        if (el) el.textContent = times[k].fmt;
    });
    const dl = document.getElementById('azanDateLabel');
    if (dl) dl.textContent = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
    startIftarCountdown(times.maghrib.raw);
}

// ─── عداد الإفطار ────────────────────────────────────
function startIftarCountdown(maghribRaw) {
    if (iftarTimerInterval) clearInterval(iftarTimerInterval);
    const cdEl = document.getElementById('iftarCountdown');
    const cdText = document.getElementById('iftarCountdownText');
    if (!cdEl || !cdText) return;
    function tick() {
        const now = new Date();
        const nowH = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        const diff = maghribRaw - nowH;
        if (diff > 0 && diff < 12) {
            const s = Math.round(diff * 3600), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
            cdEl.classList.remove('hidden');
            cdText.textContent = h > 0 ? `متبقي للإفطار: ${h} س ${m} د` : `متبقي للإفطار: ${m} د ${sec} ث`;
        } else if (diff <= 0 && diff > -0.5) {
            cdEl.classList.remove('hidden');
            cdText.textContent = '🌅 حان وقت الإفطار! أَفْطِرْ هَنِيئاً مريئاً';
        } else { cdEl.classList.add('hidden'); }
    }
    tick();
    iftarTimerInterval = setInterval(tick, 1000);
}

// ─── اختيار المدينة ─────────────────────────────────
export function selectCity(city) {
    selectedCity = city;
    const select = document.getElementById('citySelect');
    if (select) select.value = city;
    renderPrayerTimes(city);
}

// ─── نسخ الدعاء ─────────────────────────────────────
export function copyDua(el) {
    const t = el.querySelector('p')?.textContent?.trim();
    if (!t) return;
    navigator.clipboard.writeText(t)
        .then(() => showToast('تم نسخ الدعاء ✨'))
        .catch(() => showToast('الدعاء في قلبك 🤍'));
}

// ─── تنظيف المؤقتات عند مغادرة الصفحة ────────────────
export function cleanupDuaaTimers() {
    if (iftarTimerInterval) {
        clearInterval(iftarTimerInterval);
        iftarTimerInterval = null;
    }
}

