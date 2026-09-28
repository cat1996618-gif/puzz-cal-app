import React, { useState, useEffect, useRef } from 'react';
import PhysicsBox from './PhysicsBox';
import MealDetailModal from './MealDetailModal';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Gemini AI 初始化
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// 8 款完整主題
const THEMES = {
  cookie: {
    id: 'cookie',
    name: '焦糖奶油餅乾',
    emoji: '🍪',
    desc: '現烤奶油餅乾焦糖香，溫暖燕麥奶白',
    bg: 'bg-[#FAF6EE]',
    card: 'bg-white',
    primary: 'bg-[#C67D34] text-white hover:bg-[#B36B24]',
    accent: 'text-[#C67D34]',
    border: 'border-[#EADCC8]',
    ring: 'stroke-[#C67D34]',
    tag: 'bg-[#F4ECE1] text-[#8C531B]',
    navIcons: { home: '🛖', trends: '🧁', add: '🍪', coach: '☕', settings: '🥨' },
    navLabels: { home: '烘焙屋', trends: '烘焙記錄', coach: '點心茶歇', settings: '食譜設定' },
  },
  cat: {
    id: 'cat',
    name: '軟萌肉球貓貓',
    emoji: '🐾',
    desc: '小貓粉嫩肉球橘粉，暖暖日光米白',
    bg: 'bg-[#FFF9F5]',
    card: 'bg-white',
    primary: 'bg-[#F97316] text-white hover:bg-[#EA580C]',
    accent: 'text-[#F97316]',
    border: 'border-[#FED7AA]',
    ring: 'stroke-[#F97316]',
    tag: 'bg-[#FFEDD5] text-[#9A3412]',
    navIcons: { home: '🐱', trends: '🐾', add: '🐟', coach: '💭', settings: '🧶' },
    navLabels: { home: '貓窩', trends: '腳印記錄', coach: '喵喵對話', settings: '逗貓設定' },
  },
  ribbon: {
    id: 'ribbon',
    name: '芭蕾粉紅絲帶',
    emoji: '🎀',
    desc: '法式浪漫芭蕾粉，微甜玫瑰花瓣',
    bg: 'bg-[#FFF1F2]',
    card: 'bg-white',
    primary: 'bg-[#F43F5E] text-white hover:bg-[#E11D48]',
    accent: 'text-[#F43F5E]',
    border: 'border-[#FECDD3]',
    ring: 'stroke-[#F43F5E]',
    tag: 'bg-[#FFE4E6] text-[#9F1239]',
    navIcons: { home: '🩰', trends: '🎀', add: '💖', coach: '🐰', settings: '💄' },
    navLabels: { home: '舞坊', trends: '優雅進程', coach: '兔兔密語', settings: '梳妝設定' },
  },
  sunset: {
    id: 'sunset',
    name: '日落海邊餘暉',
    emoji: '🌅',
    desc: '夏夜暮色暖霞橙，微風微醺蜜桃',
    bg: 'bg-[#FFF7ED]',
    card: 'bg-white',
    primary: 'bg-[#EA580C] text-white hover:bg-[#C2410C]',
    accent: 'text-[#EA580C]',
    border: 'border-[#FDBA74]',
    ring: 'stroke-[#EA580C]',
    tag: 'bg-[#FFEDD5] text-[#7C2D12]',
    navIcons: { home: '🏖️', trends: '📊', add: '🌇', coach: '✨', settings: '🌙' },
    navLabels: { home: '暮岸', trends: '霞光走勢', coach: '星語小憩', settings: '落日設定' },
  },
  matcha: {
    id: 'matcha',
    name: '靜岡手刷抹茶',
    emoji: '🍵',
    desc: '現刷濃郁宇治抹茶綠，玄米茶淡雅白',
    bg: 'bg-[#F4F7F2]',
    card: 'bg-white',
    primary: 'bg-[#4D7C0F] text-white hover:bg-[#3F6212]',
    accent: 'text-[#4D7C0F]',
    border: 'border-[#D9E5D0]',
    ring: 'stroke-[#4D7C0F]',
    tag: 'bg-[#ECF2E6] text-[#365314]',
    navIcons: { home: '🍵', trends: '🎋', add: '🍃', coach: '🌱', settings: '🎋' },
    navLabels: { home: '茶室', trends: '茶道軌跡', coach: '禪意營養', settings: '茶舍設定' },
  },
  blueberry: {
    id: 'blueberry',
    name: '藍莓芝士蛋糕',
    emoji: '🫐',
    desc: '野莓紫藍雙重奏，法式生乳酪底蘊',
    bg: 'bg-[#F5F3FF]',
    card: 'bg-white',
    primary: 'bg-[#6366F1] text-white hover:bg-[#4F46E5]',
    accent: 'text-[#6366F1]',
    border: 'border-[#DDD6FE]',
    ring: 'stroke-[#6366F1]',
    tag: 'bg-[#EDE9FE] text-[#4338CA]',
    navIcons: { home: '🫐', trends: '🍇', add: '🧀', coach: '🫐', settings: '🔮' },
    navLabels: { home: '莓莊', trends: '果實進展', coach: '果香密友', settings: '莊園設定' },
  },
  soda: {
    id: 'soda',
    name: '蘇打薄荷泡泡',
    emoji: '🫧',
    desc: '清涼氣泡蘇打海藍，夏日微風沁涼',
    bg: 'bg-[#F0F9FF]',
    card: 'bg-white',
    primary: 'bg-[#0284C7] text-white hover:bg-[#0369A1]',
    accent: 'text-[#0284C7]',
    border: 'border-[#BAE6FD]',
    ring: 'stroke-[#0284C7]',
    tag: 'bg-[#E0F2FE] text-[#075985]',
    navIcons: { home: '🫧', trends: '🌊', add: '🐬', coach: '🧊', settings: '🤿' },
    navLabels: { home: '海灣', trends: '氣泡波動', coach: '沁涼叮嚀', settings: '潛航設定' },
  },
  dark: {
    id: 'dark',
    name: '極簡冷灰純黑',
    emoji: '🖤',
    desc: '高質感冷黑石板灰，純粹極簡低調',
    bg: 'bg-[#F8F9FA]',
    card: 'bg-white',
    primary: 'bg-[#18181B] text-white hover:bg-[#27272A]',
    accent: 'text-[#18181B]',
    border: 'border-[#E4E4E7]',
    ring: 'stroke-[#18181B]',
    tag: 'bg-[#F4F4F5] text-[#27272A]',
    navIcons: { home: '⬛', trends: '◼️', add: '➕', coach: '◾', settings: '▪️' },
    navLabels: { home: '控制台', trends: '數據', coach: 'AI分析', settings: '核心' },
  },
};

const EXERCISE_TYPES = [
  { id: 'none', name: '無運動 / 休息', emoji: '🛋️', calPerMin: 0 },
  { id: 'gym', name: '健身房重訓', emoji: '🏋️', calPerMin: 6.5 },
  { id: 'pilates', name: '機械式皮拉提斯', emoji: '🤸', calPerMin: 5.5 },
  { id: 'yoga', name: '瑜珈伸展', emoji: '🧘', calPerMin: 3.5 },
  { id: 'hiit', name: '高強度間歇 HIIT', emoji: '⚡', calPerMin: 11.0 },
  { id: 'run', name: '戶外跑步', emoji: '🏃', calPerMin: 9.5 },
  { id: 'swim', name: '游泳訓練', emoji: '🏊', calPerMin: 8.5 },
];

// 本地年月日格式化 YYYY-MM-DD
const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('app_theme') || 'cookie');
  const theme = THEMES[themeKey] || THEMES.cookie;
  const [showThemeModal, setShowThemeModal] = useState(false);

  // 使用者基本檔案
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved
      ? JSON.parse(saved)
      : {
          restDay: { calories: 1600, carbs: 160, protein: 110, fat: 50 },
          workoutDay: { calories: 2000, carbs: 230, protein: 135, fat: 55 },
          waterGoal: 2000,
          weight: 54.5,
          targetWeight: 50.0,
          height: 162,
        };
  });

  const [weightHistory, setWeightHistory] = useState(() => {
    const saved = localStorage.getItem('weight_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [dayType, setDayType] = useState('rest');
  const currentTarget = dayType === 'workout' ? userProfile.workoutDay : userProfile.restDay;

  // 當前選擇日期
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 獨立載入特定日期資料的 Helper 函式
  const readDailyData = (date) => {
    try {
      const savedMeals = localStorage.getItem(`meals_${date}`);
      const savedWater = localStorage.getItem(`water_${date}`);
      const savedSteps = localStorage.getItem(`steps_${date}`);
      const savedEx = localStorage.getItem(`exercise_${date}`);
      const savedMin = localStorage.getItem(`exercise_min_${date}`);

      return {
        meals: savedMeals ? JSON.parse(savedMeals) : [],
        water: savedWater !== null ? Number(savedWater) : 0,
        steps: savedSteps !== null ? Number(savedSteps) : 0,
        exercise: savedEx || 'none',
        minutes: savedMin !== null ? Number(savedMin) : 0,
      };
    } catch (e) {
      return { meals: [], water: 0, steps: 0, exercise: 'none', minutes: 0 };
    }
  };

  // 狀態宣告：預設皆讀取今天 (todayStr) 的獨立資料
  const initialTodayData = readDailyData(todayStr);
  const [meals, setMeals] = useState(initialTodayData.meals);
  const [waterIntake, setWaterIntake] = useState(initialTodayData.water);
  const [steps, setSteps] = useState(initialTodayData.steps);
  const [selectedExercise, setSelectedExercise] = useState(initialTodayData.exercise);
  const [exerciseMinutes, setExerciseMinutes] = useState(initialTodayData.minutes);
  const [selectedMealDetail, setSelectedMealDetail] = useState(null);

  // 切換日期的純淨處理函式
  const handleDateChange = (newDate) => {
    // 1. 先儲存切換前當前日期的最後狀態，確保不丟失
    localStorage.setItem(`meals_${selectedDate}`, JSON.stringify(meals));
    localStorage.setItem(`water_${selectedDate}`, waterIntake.toString());
    localStorage.setItem(`steps_${selectedDate}`, steps.toString());
    localStorage.setItem(`exercise_${selectedDate}`, selectedExercise);
    localStorage.setItem(`exercise_min_${selectedDate}`, exerciseMinutes.toString());

    // 2. 載入新日期的獨立資料（如果是全新的日子，就會乾淨歸零！）
    const data = readDailyData(newDate);
    setMeals(data.meals);
    setWaterIntake(data.water);
    setSteps(data.steps);
    setSelectedExercise(data.exercise);
    setExerciseMinutes(data.minutes);

    // 3. 更新當前日期
    setSelectedDate(newDate);
  };

  // 即時資料自動儲存至當前 selectedDate 的 Key
  useEffect(() => {
    localStorage.setItem(`meals_${selectedDate}`, JSON.stringify(meals));
  }, [meals, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`water_${selectedDate}`, waterIntake.toString());
  }, [waterIntake, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`steps_${selectedDate}`, steps.toString());
  }, [steps, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`exercise_${selectedDate}`, selectedExercise);
  }, [selectedExercise, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`exercise_min_${selectedDate}`, exerciseMinutes.toString());
  }, [exerciseMinutes, selectedDate]);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('weight_history', JSON.stringify(weightHistory));
  }, [weightHistory]);

  useEffect(() => {
    localStorage.setItem('app_theme', themeKey);
  }, [themeKey]);

  // 熱量計算
  const consumedCalories = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const consumedCarbs = meals.reduce((s, m) => s + (m.macros?.carbs || 0), 0);
  const consumedProtein = meals.reduce((s, m) => s + (m.macros?.protein || 0), 0);
  const consumedFat = meals.reduce((s, m) => s + (m.macros?.fat || 0), 0);

  const remainCalories = currentTarget.calories - consumedCalories;
  const remainCarbs = currentTarget.carbs - consumedCarbs;
  const remainProtein = currentTarget.protein - consumedProtein;
  const remainFat = currentTarget.fat - consumedFat;

  const stepBurn = Math.round(steps * 0.04);
  const exConfig = EXERCISE_TYPES.find((e) => e.id === selectedExercise) || EXERCISE_TYPES[0];
  const workoutBurn = Math.round(exConfig.calPerMin * exerciseMinutes);
  const totalBurn = stepBurn + workoutBurn;

  const formattedDateString = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const localDate = new Date(y, m - 1, d);
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${m}月${d}日 ${weekdays[localDate.getDay()]}`;
  })();

  const handleUpdateWeight = (newWeight) => {
    const w = parseFloat(newWeight);
    if (!w || isNaN(w)) return;
    setUserProfile((prev) => ({ ...prev, weight: w }));
    setWeightHistory((prev) => ({ ...prev, [selectedDate]: w }));
  };

  return (
    <div className={`min-h-screen ${theme.bg} pb-28 text-stone-800 transition-colors duration-300 font-sans`}>
      <div className="max-w-md mx-auto px-4 pt-3 flex flex-col gap-4">
        {/* ===================== 1. 首頁 ===================== */}
        {activeTab === 'home' && (
          <>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white shadow-sm border border-stone-200/80 active:scale-95 transition"
              >
                <span className="text-base">{theme.navIcons.home}</span>
                <span className="text-xs font-black tracking-wide text-stone-700">{formattedDateString}</span>
                <span className="text-[10px] text-stone-400">▼</span>
              </button>

              <div className="relative">
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value)}
                  className={`text-xs font-bold rounded-2xl px-3 py-1.5 outline-none shadow-sm border border-stone-200/80 appearance-none pr-7 cursor-pointer ${
                    dayType === 'workout' ? 'bg-orange-50 text-orange-600' : 'bg-white text-stone-600'
                  }`}
                >
                  <option value="rest">☕ 休息日目標</option>
                  <option value="workout">⚡ 運動日目標</option>
                </select>
                <span className="absolute right-2.5 top-2 text-[10px] pointer-events-none text-stone-400">▼</span>
              </div>
            </div>

            {showDatePicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-2xl flex flex-col gap-4 border border-stone-100">
                  <h3 className="font-bold text-base text-stone-800">選擇想查看的日期</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) handleDateChange(e.target.value);
                    }}
                    className="border border-stone-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleDateChange(getLocalDateString());
                        setShowDatePicker(false);
                      }}
                      className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-stone-100 text-stone-600"
                    >
                      回到今天
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl ${theme.primary}`}
                    >
                      確定
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 加入 key={selectedDate}：切換日期時銷毀舊沙盒，徹底重新初始化物理世界 */}
            <PhysicsBox key={selectedDate} items={meals} onSelectItem={(meal) => setSelectedMealDetail(meal)} />

            {/* 每日熱量儀表板 */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-400 block">剩餘熱量</span>
                <div className="text-3xl font-black tracking-tight text-stone-800">
                  {remainCalories > 0 ? remainCalories : 0}
                  <span className="text-xs font-medium text-stone-400 ml-1">kcal</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">每日總目標: {currentTarget.calories} kcal</div>
              </div>

              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={theme.ring}
                    strokeDasharray={`${Math.min((consumedCalories / currentTarget.calories) * 100, 100)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl">{theme.navIcons.trends}</span>
                  <span className="text-[10px] font-extrabold text-stone-600 -mt-1">{consumedCalories}</span>
                </div>
              </div>
            </div>

            {/* 三大營養素 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: '碳水', emoji: '🍞', remain: remainCarbs, total: currentTarget.carbs, consumed: consumedCarbs },
                { name: '蛋白質', emoji: '🥩', remain: remainProtein, total: currentTarget.protein, consumed: consumedProtein },
                { name: '油脂', emoji: '🥑', remain: remainFat, total: currentTarget.fat, consumed: consumedFat },
              ].map((m, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-400 leading-tight">
                      {m.name}<br />剩餘
                    </span>
                    <div className="text-base font-black text-stone-800 my-0.5 tracking-tight">
                      {m.remain > 0 ? (Number.isInteger(m.remain) ? m.remain : m.remain.toFixed(1)) : 0}g
                    </div>
                    <span className="text-[9px] text-stone-400">目標 {m.total}g</span>
                  </div>
                  <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-stone-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={theme?.ring || 'text-amber-500'}
                        strokeDasharray={`${Math.min((m.consumed / m.total) * 100, 100)}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm select-none">{m.emoji}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 運動量與消耗 */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400">今日運動與消耗</span>
                <div className="flex items-center gap-1">
                  {[1000, 3000, 5000].map((addStep) => (
                    <button
                      key={addStep}
                      onClick={() => setSteps((prev) => prev + addStep)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[10px] font-bold active:scale-90 transition"
                    >
                      +{addStep / 1000}k步
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="flex flex-col">
                  <span className="text-[11px] text-stone-400">累積步數</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-lg">👟</span>
                    <input
                      type="number"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-16 font-black text-sm text-stone-800 outline-none border-b border-stone-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] text-stone-400">運動類別</span>
                  <select
                    value={selectedExercise}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedExercise(val);
                      if (val === 'none') {
                        setExerciseMinutes(0);
                      } else if (exerciseMinutes === 0) {
                        setExerciseMinutes(30);
                      }
                    }}
                    className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl p-1 mt-0.5 outline-none"
                  >
                    {EXERCISE_TYPES.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.emoji} {ex.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 mt-1">
                    {selectedExercise === 'none' ? (
                      <span className="text-[10px] text-stone-400 py-0.5">今天好好休息 ☕</span>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={exerciseMinutes}
                          onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                          className="w-10 text-xs font-bold border-b text-center border-stone-200 outline-none"
                        />
                        <span className="text-[10px] text-stone-400">分鐘</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-stone-400">總消耗</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-lg">🔥</span>
                    <span className="text-lg font-black text-orange-500">{totalBurn}</span>
                    <span className="text-[10px] text-stone-400">kcal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 喝水記錄 */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-400 block">今日飲水量</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl">💧</span>
                  <span className="text-xl font-black text-sky-600">{waterIntake}</span>
                  <span className="text-xs text-stone-400">/ {userProfile.waterGoal} ml</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[200, 500, 750].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setWaterIntake((prev) => prev + amt)}
                    className="px-2.5 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-xs font-black active:scale-90 transition border border-sky-100"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 餐點清單 */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-stone-500">今日餐點總覽</span>
              {meals.length === 0 ? (
                <div className="text-center py-6 bg-white/60 rounded-3xl border border-dashed border-stone-200 text-stone-400 text-xs">
                  今天還沒記錄餐點，按下方中間按鈕新增拍照吧！
                </div>
              ) : (
                meals.map((meal) => (
                  <div
                    key={meal.id}
                    onClick={() => setSelectedMealDetail(meal)}
                    className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-3">
                      {meal.photoUrl ? (
                        <img src={meal.photoUrl} alt="餐點" className="w-12 h-12 rounded-xl object-cover border border-stone-100 shadow-xs" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl">
                          🍱
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-stone-800">{meal.meal_name}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <span>🍞 {meal.macros?.carbs || 0}g</span>
                          <span>•</span>
                          <span>🥩 {meal.macros?.protein || 0}g</span>
                          <span>•</span>
                          <span>🥑 {meal.macros?.fat || 0}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-600">{meal.total_calories} kcal</div>
                      <div className="text-[10px] text-stone-400">{meal.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ===================== 2. 趨勢 ===================== */}
        {activeTab === 'trends' && (
          <TrendsView
            userProfile={userProfile}
            weightHistory={weightHistory}
            onUpdateWeight={handleUpdateWeight}
            theme={theme}
          />
        )}

        {/* ===================== 3. 新增餐點 ===================== */}
        {activeTab === 'add' && (
          <AddMealView
            theme={theme}
            onMealLogged={(newMeal) => {
              setMeals((prev) => [
                ...prev,
                {
                  ...newMeal,
                  id: Date.now(),
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
              setActiveTab('home');
            }}
          />
        )}

        {/* ===================== 4. 貓貓教練 ===================== */}
        {activeTab === 'coach' && (
          <AICoachView
            theme={theme}
            statusContext={{
              remainCalories,
              remainCarbs,
              remainProtein,
              remainFat,
              consumedCalories,
              dayType,
              totalBurn,
            }}
          />
        )}

        {/* ===================== 5. 設定 ===================== */}
        {activeTab === 'settings' && (
          <SettingsView
            theme={theme}
            onOpenThemeModal={() => setShowThemeModal(true)}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            selectedDate={selectedDate}
          />
        )}
      </div>

      {/* 底部導覽列 */}
      <nav className="fixed bottom-4 inset-x-4 max-w-md mx-auto glass rounded-3xl border border-white/60 shadow-xl p-2 flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl transition ${
            activeTab === 'home' ? 'font-black scale-105 ' + theme.accent : 'text-stone-400'
          }`}
        >
          <span className="text-xl">{theme.navIcons.home}</span>
          <span className="text-[10px]">首頁</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl transition ${
            activeTab === 'trends' ? 'font-black scale-105 ' + theme.accent : 'text-stone-400'
          }`}
        >
          <span className="text-xl">{theme.navIcons.trends}</span>
          <span className="text-[10px]">趨勢</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`w-12 h-12 -mt-5 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition ${theme.primary}`}
        >
          <span className="text-xl">{theme.navIcons.add}</span>
        </button>

        <button
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl transition ${
            activeTab === 'coach' ? 'font-black scale-105 ' + theme.accent : 'text-stone-400'
          }`}
        >
          <span className="text-xl">{theme.navIcons.coach}</span>
          <span className="text-[10px]">建議</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl transition ${
            activeTab === 'settings' ? 'font-black scale-105 ' + theme.accent : 'text-stone-400'
          }`}
        >
          <span className="text-xl">{theme.navIcons.settings}</span>
          <span className="text-[10px]">設定</span>
        </button>
      </nav>

      {/* 主題選擇彈窗 */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto border border-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-stone-800">風格主題庫 🎨</h3>
                <p className="text-xs text-stone-400 mt-0.5">整套圖示與色調連動切換</p>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(THEMES).map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setThemeKey(t.id);
                    setShowThemeModal(false);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    themeKey === t.id
                      ? 'border-stone-800 bg-stone-50 shadow-md scale-[1.01]'
                      : 'border-stone-100 hover:border-stone-200 bg-white'
                  }`}
                >
                  <div className="text-3xl p-2 rounded-xl bg-stone-50 shadow-xs border border-stone-100">
                    {t.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-800">{t.name}</span>
                      {themeKey === t.id && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-800 text-white">
                          使用中
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <MealDetailModal meal={selectedMealDetail} onClose={() => setSelectedMealDetail(null)} />
    </div>
  );
}

/* =========================================================================
   新增餐點視圖
   ========================================================================= */
function AddMealView({ theme, onMealLogged }) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [activeMode, setActiveMode] = useState('recipe');
  const [mealName, setMealName] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [manual, setManual] = useState({ calories: '', carbs: '', protein: '', fat: '' });
  const [loading, setLoading] = useState(false);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, startX, startY, size, size, 0, 0, 600, 600);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(dataUrl);
        setPhotoBase64(dataUrl.split(',')[1]);
      };
    };
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      let result = null;

      if (activeMode === 'manual') {
        result = {
          meal_name: mealName || '外食記錄',
          photoUrl: photoPreview,
          total_calories: Number(manual.calories) || 0,
          macros: {
            carbs: Number(manual.carbs) || 0,
            protein: Number(manual.protein) || 0,
            fat: Number(manual.fat) || 0,
          },
          items: [{ name: mealName || '外食品項', portion: '1份', calories: Number(manual.calories) || 0 }],
          advice: '手動填寫數值',
        };
      } else {
        if (!genAI) throw new Error('未偵測到 Gemini API Key，請先在設定中填入金鑰！');

        const prompt =
          activeMode === 'recipe'
            ? `使用者自己煮了這道菜：${mealName || '自製料理'}。詳細食材與重量：\n${recipeText}\n請精算總熱量、碳水、蛋白質、油脂(g)。`
            : `請辨識這張食物照片（備註：${mealName || '外食餐點'}），推估熱量、碳水、蛋白質、油脂(g)。`;

        const parts = [prompt];
        if (photoBase64) {
          parts.push({ inlineData: { data: photoBase64, mimeType: 'image/jpeg' } });
        }

        const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];
        let lastError = null;

        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: SchemaType.OBJECT,
                  properties: {
                    meal_name: { type: SchemaType.STRING },
                    total_calories: { type: SchemaType.NUMBER },
                    macros: {
                      type: SchemaType.OBJECT,
                      properties: {
                        carbs: { type: SchemaType.NUMBER },
                        protein: { type: SchemaType.NUMBER },
                        fat: { type: SchemaType.NUMBER },
                      },
                      required: ['carbs', 'protein', 'fat'],
                    },
                    advice: { type: SchemaType.STRING },
                  },
                  required: ['meal_name', 'total_calories', 'macros'],
                },
              },
            });

            const resp = await model.generateContent(parts);
            const data = JSON.parse(resp.response.text());
            result = { ...data, photoUrl: photoPreview };
            break;
          } catch (err) {
            console.warn(`模型 ${modelName} 呼叫失敗，嘗試備用模型...`, err);
            lastError = err;
            if (err.message?.includes('429')) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (!result) {
          throw lastError || new Error('AI 分析失敗，請稍候重試！');
        }
      }
      if (result) onMealLogged(result);
    } catch (err) {
      console.error(err);
      alert('計算失敗：' + (err.message || '請確認 API Key！'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-stone-800">拍照與新增餐點</h2>

      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col items-center gap-3">
        {photoPreview ? (
          <div className="relative w-40 h-40 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-md">
            <img src={photoPreview} alt="食物截圖" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <label className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded-full cursor-pointer text-[10px] font-bold">
                📷 重拍
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
              </label>
              <label className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded-full cursor-pointer text-[10px] font-bold">
                🖼️ 重選
                <input type="file" accept="image/*" className="hidden" onChange={handleCapture} />
              </label>
            </div>
          </div>
        ) : (
          <div className="w-full flex gap-3">
            <label className="flex-1 py-7 border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition active:scale-95">
              <span className="text-3xl">📷</span>
              <span className="text-xs font-bold text-amber-800">直接拍照</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/heic,image/*"
                capture="environment"
                className="hidden"
                onChange={handleCapture}
              />
            </label>

            <label className="flex-1 py-7 border-2 border-dashed border-stone-300 bg-stone-50/50 hover:bg-stone-100 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition active:scale-95">
              <span className="text-3xl">🖼️</span>
              <span className="text-xs font-bold text-stone-700">從相簿挑選</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCapture}
              />
            </label>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="餐點名稱（例如：香煎鱸魚配十穀飯 / 超商烤雞沙拉）"
        value={mealName}
        onChange={(e) => setMealName(e.target.value)}
        className="bg-white p-3.5 rounded-2xl border border-stone-200/80 text-sm outline-none shadow-sm"
      />

      <div className="grid grid-cols-3 gap-1 bg-stone-200/60 p-1 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveMode('recipe')}
          className={`py-2 rounded-xl transition ${activeMode === 'recipe' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
        >
          1. 寫食材 AI 算
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('manual')}
          className={`py-2 rounded-xl transition ${activeMode === 'manual' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
        >
          2. 手動填克數
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('ai_photo')}
          className={`py-2 rounded-xl transition ${activeMode === 'ai_photo' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
        >
          3. 純照片 AI 算
        </button>
      </div>

      {activeMode === 'recipe' && (
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold text-stone-600">📝 填寫食材與重量克數：</span>
          <textarea
            rows={3}
            placeholder="例如：&#10;去皮雞胸肉 180g&#10;白飯 140g&#10;特級初榨橄欖油 5ml&#10;綠花椰菜 100g"
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            className="w-full text-xs border border-stone-200 rounded-xl p-3 outline-none"
          />
        </div>
      )}

      {activeMode === 'manual' && (
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] text-stone-400 block font-bold">總熱量 (kcal)</label>
            <input
              type="number"
              value={manual.calories}
              onChange={(e) => setManual({ ...manual, calories: e.target.value })}
              placeholder="例如 450"
              className="w-full text-xs border border-stone-200 rounded-xl p-2.5 mt-1 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-stone-400 block font-bold">碳水化合物 (g)</label>
            <input
              type="number"
              value={manual.carbs}
              onChange={(e) => setManual({ ...manual, carbs: e.target.value })}
              placeholder="例如 50"
              className="w-full text-xs border border-stone-200 rounded-xl p-2.5 mt-1 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-stone-400 block font-bold">蛋白質 (g)</label>
            <input
              type="number"
              value={manual.protein}
              onChange={(e) => setManual({ ...manual, protein: e.target.value })}
              placeholder="例如 25"
              className="w-full text-xs border border-stone-200 rounded-xl p-2.5 mt-1 outline-none font-bold"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[11px] text-stone-400 block font-bold">油脂 / 脂肪 (g)</label>
            <input
              type="number"
              value={manual.fat}
              onChange={(e) => setManual({ ...manual, fat: e.target.value })}
              placeholder="例如 12"
              className="w-full text-xs border border-stone-200 rounded-xl p-2.5 mt-1 outline-none font-bold"
            />
          </div>
        </div>
      )}

      {activeMode === 'ai_photo' && (
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm text-center text-xs text-stone-500">
          ✨ 將直接透過 Gemini 視覺 AI 辨識照片，推估熱量與三大營養素。
        </div>
      )}

      <button
        onClick={handleCalculate}
        disabled={loading || (activeMode === 'recipe' && !recipeText.trim())}
        className={`w-full py-4 rounded-2xl font-black text-sm shadow-md active:scale-95 transition disabled:opacity-40 ${theme.primary}`}
      >
        {loading ? 'AI 正精算營養成分中...' : '確認並丟入沙盒 🚀'}
      </button>
    </div>
  );
}

/* =========================================================================
   貓貓營養師教練 (MewCal 🐾)
   ========================================================================= */
function AICoachView({ theme, statusContext }) {
  const [catMood, setCatMood] = useState('happy');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `喵嗚～！我是你的專屬貓貓營養管家「喵卡」🐾✨\n\n今天不管是想躺平還是動起來，我都陪著你喔！\n目前看小筆記本：\n▸ 剩餘熱量：${statusContext.remainCalories} kcal 🍯\n▸ 蛋白質還差：${statusContext.remainProtein} g 🐟\n\n肚子餓了嗎？想要外食超商攻略、還是想自己煮好吃的呢？隨時喵我！(=^･ω･^=)`,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const userText = textToSend || inputMsg;
    if (!userText.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user', text: userText }];
    setMessages(newMsgs);
    setInputMsg('');
    setLoading(true);
    setCatMood('thinking');

    try {
      if (!genAI) throw new Error('喵！找不到 API Key，請在設定確認一下金鑰喔～');

      const cutePrompt = `你是一隻熱愛美食、溫柔又專業的貓咪營養教練，名字叫「喵卡（MewCal）」🐾。
你的說話風格：
1. 語氣超級可愛、暖心、元氣滿滿，句尾常自然地帶「喵～」、「(=^･ω･^=)」、「✨」、「🐾」。
2. 絕對不批判使用者的飲食，永遠給予滿滿的情緒價值與鼓勵！
3. 根據使用者的真實數據給出精準但好吃的具體建議（例如超商具體品名、快速料理作法）。

使用者今日即時狀態：
- 今日型態：${statusContext.dayType === 'workout' ? '⚡ 運動日（可以吃多一點點碳水喵！）' : '☕ 休息日（清淡舒服為主喵～）'}
- 剩餘熱量額度：${statusContext.remainCalories} kcal
- 剩餘碳水：${statusContext.remainCarbs} g
- 剩餘蛋白質：${statusContext.remainProtein} g
- 剩餘油脂：${statusContext.remainFat} g
- 今日運動消耗：${statusContext.totalBurn} kcal

使用者說：${userText}

請用活潑可愛、排版清晰的口氣回答，適當使用列點與可愛 Emoji，讓使用者看了食慾與心情都超好喵！`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];
      let replyText = null;
      let lastError = null;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const resp = await model.generateContent(cutePrompt);
          replyText = resp.response.text();
          break;
        } catch (err) {
          console.warn(`貓貓教練呼叫 ${modelName} 失敗，嘗試備用模型...`, err);
          lastError = err;
          if (err.message?.includes('429')) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      if (!replyText) {
        throw lastError || new Error('貓貓暫時分心了，請再問一次喵！');
      }

      setMessages([...newMsgs, { role: 'assistant', text: replyText }]);
      setCatMood('cheering');
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', text: `嗚喵...訊號被毛線球纏住了(つд⊂)：${err.message}` }]);
      setCatMood('happy');
    } finally {
      setLoading(false);
      setTimeout(() => setCatMood('happy'), 3000);
    }
  };

  const catStatus = {
    happy: { icon: '🐱', title: '喵卡管家在線上', desc: '今天也有好好吃飯嗎？喵～' },
    thinking: { icon: '🐾', title: '正在翻食譜小魚乾...', desc: '嗅嗅～正在為你精算最好吃的搭配！' },
    cheering: { icon: '😻', title: '美味建議出爐啦！', desc: '吃飽飽才有力氣變健康喵！' },
  }[catMood];

  return (
    <div className="flex flex-col h-[76vh] bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden">
      <div className="p-3 bg-amber-50/60 border-b border-amber-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-2xl shadow-sm animate-bounce">
            {catStatus.icon}
          </div>
          <div>
            <div className="text-xs font-black text-stone-800 flex items-center gap-1">
              <span>{catStatus.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-200/70 text-amber-800 rounded-full font-bold">PRO</span>
            </div>
            <div className="text-[10px] text-amber-700/80 font-medium">{catStatus.desc}</div>
          </div>
        </div>

        <div className="text-right bg-white/80 px-2.5 py-1 rounded-xl border border-amber-100">
          <span className="text-[9px] text-stone-400 block -mb-0.5">剩餘額度</span>
          <span className="text-xs font-black text-amber-600">{statusContext.remainCalories} kcal</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#FCFAF7]/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] rounded-3xl p-3.5 text-xs leading-relaxed shadow-sm transition-all whitespace-pre-wrap ${
              m.role === 'user'
                ? `${theme.primary} self-end rounded-br-xs`
                : 'bg-white text-stone-700 self-start rounded-bl-xs border border-stone-100'
            }`}
          >
            {m.role === 'assistant' && (
              <span className="text-[10px] font-bold text-amber-500 block mb-1">🐾 喵卡說：</span>
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-white border border-stone-100 text-stone-400 px-3.5 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
            <span className="animate-spin text-sm">🐟</span>
            <span>貓貓努力算熱量中，等我一下下喵...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-2 border-t border-stone-100 bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          '🐟 救救蛋白質！外食選什麼？',
          '🧁 嘴饞想吃甜點怎麼補救？',
          '🥗 今晚想自己煮10分鐘減脂餐',
          '🔥 今天熱量吃超標了怎麼辦喵？',
          '✨ 誇獎我！我今天有乖乖喝水',
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(q)}
            className="text-[11px] whitespace-nowrap bg-amber-50/70 hover:bg-amber-100 text-amber-800 border border-amber-200/50 px-3 py-1.5 rounded-full font-bold active:scale-95 transition"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="p-2.5 bg-white border-t border-stone-100 flex gap-2 items-center">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="問問貓貓：下一餐吃什麼好呢？喵～"
          className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm active:scale-90 transition disabled:opacity-40 ${theme.primary}`}
        >
          🐾
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   趨勢視圖
   ========================================================================= */
function TrendsView({ userProfile = {}, setUserProfile, weightHistory = {}, onUpdateWeight, theme = {} }) {
  const [timeSpan, setTimeSpan] = useState('week');
  const [showWeightInput, setShowWeightInput] = useState(false);

  const currentWeight = Number(userProfile?.weight) || 55;
  const userHeight = Number(userProfile?.height) || 160;
  const waterGoal = Number(userProfile?.waterGoal) || 2000;
  const primaryTheme = theme?.primary || 'bg-amber-500 text-white';

  const [targetWeight, setTargetWeight] = useState(() => {
    return Number(userProfile?.targetWeight) || Number(localStorage.getItem('target_weight')) || 50;
  });

  const [inputWeightVal, setInputWeightVal] = useState(currentWeight.toString());
  const [inputTargetWeightVal, setInputTargetWeightVal] = useState(targetWeight.toString());

  const currentBMI = (currentWeight / Math.pow(userHeight / 100, 2)).toFixed(1);

  // 安全讀取歷史紀錄
  let storedDaily = {};
  try {
    storedDaily = JSON.parse(localStorage.getItem('daily_records') || '{}');
  } catch (e) {
    storedDaily = {};
  }

  const getDayConfig = () => {
    const list = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = getLocalDateString(d);
      const lbl = i === 0 ? '今天' : i === 1 ? '昨天' : '前天';
      list.push({ date: iso, label: lbl });
    }
    return {
      labels: list.map((item) => item.label),
      weights: list.map((item) => {
        return weightHistory[item.date] || storedDaily[item.date]?.weight || (item.label === '今天' ? currentWeight : null);
      }),
      waters: list.map((item) => {
        const val = localStorage.getItem(`water_${item.date}`);
        return val !== null ? Number(val) : (storedDaily[item.date]?.water ?? null);
      }),
      steps: list.map((item) => {
        const val = localStorage.getItem(`steps_${item.date}`);
        return val !== null ? Number(val) : (storedDaily[item.date]?.steps ?? null);
      }),
      desc: '近 3 天變化',
    };
  };

  const getWeekConfig = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = getLocalDateString(d);
      const weekday = d.toLocaleDateString('zh-TW', { weekday: 'narrow' });
      list.push({ date: iso, label: i === 0 ? '今天' : `週${weekday}` });
    }
    return {
      labels: list.map((item) => item.label),
      weights: list.map((item) => {
        return weightHistory[item.date] || storedDaily[item.date]?.weight || (item.label === '今天' ? currentWeight : null);
      }),
      waters: list.map((item) => {
        const val = localStorage.getItem(`water_${item.date}`);
        return val !== null ? Number(val) : (storedDaily[item.date]?.water ?? null);
      }),
      steps: list.map((item) => {
        const val = localStorage.getItem(`steps_${item.date}`);
        return val !== null ? Number(val) : (storedDaily[item.date]?.steps ?? null);
      }),
      desc: '近 7 天走勢',
    };
  };

  const getMonthConfig = () => {
    const labels = ['3週前', '2週前', '上週', '本週'];
    return {
      labels,
      weights: [null, null, null, currentWeight],
      waters: [null, null, null, Number(localStorage.getItem(`water_${getLocalDateString()}`)) || null],
      steps: [null, null, null, Number(localStorage.getItem(`steps_${getLocalDateString()}`)) || null],
      desc: '近 4 週平均走勢',
    };
  };

  const getYearConfig = () => {
    const labels = ['1月', '3月', '5月', '7月', '9月', '11月'];
    return {
      labels,
      weights: [null, null, null, null, currentWeight, null],
      waters: [null, null, null, null, Number(localStorage.getItem(`water_${getLocalDateString()}`)) || null, null],
      steps: [null, null, null, null, Number(localStorage.getItem(`steps_${getLocalDateString()}`)) || null, null],
      desc: '整年度走勢',
    };
  };

  const currentConfig = {
    day: getDayConfig(),
    week: getWeekConfig(),
    month: getMonthConfig(),
    year: getYearConfig(),
  }[timeSpan];

  const handleSaveWeights = () => {
    const w = parseFloat(inputWeightVal);
    const tw = parseFloat(inputTargetWeightVal);

    if (!isNaN(w) && onUpdateWeight) onUpdateWeight(w);

    if (!isNaN(tw)) {
      setTargetWeight(tw);
      localStorage.setItem('target_weight', tw.toString());

      let existingProfile = {};
      try {
        existingProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      } catch (e) {
        existingProfile = {};
      }

      const updatedProfile = {
        ...existingProfile,
        ...(userProfile || {}),
        weight: !isNaN(w) ? w : (userProfile?.weight || 55),
        targetWeight: tw,
      };

      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      if (typeof setUserProfile === 'function') {
        setUserProfile(updatedProfile);
      }
    }

    setShowWeightInput(false);
  };

  const validWeights = currentConfig.weights.filter((v) => v !== null && !isNaN(v));
  const minW = validWeights.length > 0 ? Math.min(...validWeights) - 0.5 : 40;
  const maxW = validWeights.length > 0 ? Math.max(...validWeights) + 0.5 : 80;
  const rangeW = maxW - minW || 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-1 bg-stone-200/60 p-1 rounded-2xl text-xs font-bold">
        {[
          { key: 'day', label: '日' },
          { key: 'week', label: '週' },
          { key: 'month', label: '月' },
          { key: 'year', label: '年' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTimeSpan(tab.key)}
            className={`py-1.5 rounded-xl transition cursor-pointer ${
              timeSpan === tab.key ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 text-center items-center">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">目前體重</span>
            <div className="text-xl font-black text-stone-800 mt-0.5">{currentWeight} kg</div>
          </div>
          <div className="border-x border-stone-100">
            <span className="text-[10px] text-stone-400 font-bold block">目前 BMI</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{currentBMI}</div>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">目標體重</span>
            <div className="text-xl font-black text-stone-500 mt-0.5">{targetWeight} kg</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputWeightVal(currentWeight.toString());
            setInputTargetWeightVal(targetWeight.toString());
            setShowWeightInput(true);
          }}
          className={`w-full py-2.5 rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer ${primaryTheme}`}
        >
          ⚖️ 修改目前 / 目標體重
        </button>
      </div>

      {showWeightInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-2xl flex flex-col gap-3 border border-stone-100">
            <h3 className="font-bold text-sm text-stone-800">體重目標管理</h3>
            <div>
              <label className="text-[11px] text-stone-400 font-bold block mb-1">目前體重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={inputWeightVal}
                onChange={(e) => setInputWeightVal(e.target.value)}
                className="w-full border border-stone-200 rounded-xl p-2.5 text-base font-black text-center outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-stone-400 font-bold block mb-1">目標體重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={inputTargetWeightVal}
                onChange={(e) => setInputTargetWeightVal(e.target.value)}
                className="w-full border border-stone-200 rounded-xl p-2.5 text-base font-black text-center outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowWeightInput(false)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-stone-100 text-stone-600 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveWeights}
                className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${primaryTheme}`}
              >
                確定儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 體重變化 */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-xs font-bold text-stone-700">⚖️ 體重變化</span>
            <span className="text-[10px] text-stone-400 ml-1.5 font-normal">({currentConfig.desc})</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">
            距離目標還差 {(currentWeight - targetWeight).toFixed(1)} kg
          </span>
        </div>
        <div className="h-32 flex items-end justify-between pt-5 px-1 gap-2 border-b border-stone-100 pb-2">
          {currentConfig.weights.map((val, idx) => {
            const hasVal = val !== null && !isNaN(val);
            const h = hasVal ? Math.max(20, Math.min(100, ((val - minW) / rangeW) * 100)) : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                {hasVal ? (
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      idx === currentConfig.weights.length - 1 ? 'bg-amber-500' : 'bg-amber-300/80'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-200 my-auto" />
                )}
                <span className="text-[9px] text-stone-400 font-mono font-bold">
                  {hasVal ? Number(val).toFixed(1) : '--'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-stone-400 px-0.5 mt-0.5 font-medium">
          {currentConfig.labels.map((lbl, idx) => (
            <span key={idx} className="text-center flex-1">{lbl}</span>
          ))}
        </div>
      </div>

      {/* 飲水走勢 */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-xs font-bold text-sky-700">💧 飲水走勢</span>
            <span className="text-[10px] text-stone-400 ml-1.5 font-normal">({currentConfig.desc})</span>
          </div>
          <span className="text-[11px] text-sky-600 font-bold">每日目標 {waterGoal} ml</span>
        </div>
        <div className="h-32 flex items-end justify-between pt-5 px-1 gap-2 border-b border-stone-100 pb-2">
          {currentConfig.waters.map((val, idx) => {
            const hasVal = val !== null && val > 0;
            const h = hasVal ? Math.max(15, Math.min(100, (val / (waterGoal * 1.3)) * 100)) : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                {hasVal ? (
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      val >= waterGoal ? 'bg-sky-500' : 'bg-sky-300/80'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-200 my-auto" />
                )}
                <span className="text-[9px] text-stone-400 font-mono font-bold">
                  {hasVal ? val : '--'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-stone-400 px-0.5 mt-0.5 font-medium">
          {currentConfig.labels.map((lbl, idx) => (
            <span key={idx} className="text-center flex-1">{lbl}</span>
          ))}
        </div>
      </div>

      {/* 步數走勢 */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-xs font-bold text-emerald-700">👟 步數走勢</span>
            <span className="text-[10px] text-stone-400 ml-1.5 font-normal">({currentConfig.desc})</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">健康基準 8,000 步</span>
        </div>
        <div className="h-32 flex items-end justify-between pt-5 px-1 gap-2 border-b border-stone-100 pb-2">
          {currentConfig.steps.map((val, idx) => {
            const hasVal = val !== null && val > 0;
            const h = hasVal ? Math.max(15, Math.min(100, (val / 12000) * 100)) : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                {hasVal ? (
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      val >= 8000 ? 'bg-emerald-500' : 'bg-emerald-300/80'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-200 my-auto" />
                )}
                <span className="text-[9px] text-stone-400 font-mono font-bold">
                  {hasVal ? (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val) : '--'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-stone-400 px-0.5 mt-0.5 font-medium">
          {currentConfig.labels.map((lbl, idx) => (
            <span key={idx} className="text-center flex-1">{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   設定視圖 (內建清空今日快取按鈕)
   ========================================================================= */
function SettingsView({ theme, onOpenThemeModal, userProfile, setUserProfile, selectedDate }) {
  const [profile, setProfile] = useState(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  const handleSave = () => {
    setUserProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetCurrentDay = () => {
    if (window.confirm(`確定要徹底清空 ${selectedDate} 當天的飲食、沙盒、步數與運動紀錄嗎？`)) {
      // 1. 清空當日飲食、沙盒、步數等紀錄
      localStorage.removeItem(`meals_${selectedDate}`);
      localStorage.removeItem(`water_${selectedDate}`);
      localStorage.removeItem(`steps_${selectedDate}`);
      localStorage.removeItem(`exercise_${selectedDate}`);
      localStorage.removeItem(`exercise_min_${selectedDate}`);
      
      // 2. 徹底抹除以前殘留的體重假資料
      localStorage.removeItem('weight_history');
      localStorage.removeItem('daily_records');
      
      alert(`${selectedDate} 紀錄已重設歸零！`);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-stone-800">個人化設定</h2>

      <div
        onClick={() => setShowPwaModal(true)}
        className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-3xl border border-amber-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs border border-amber-100">
            📱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-stone-800">加到手機主畫面</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                推薦
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">免下載安裝，一鍵變身全螢幕 App！</p>
          </div>
        </div>
        <span className="text-sm font-bold text-amber-600">❯</span>
      </div>

      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-stone-100 text-center">
            <span className="text-4xl">📲</span>
            <div>
              <h3 className="font-black text-base text-stone-800">如何加到主畫面？</h3>
              <p className="text-xs text-stone-400 mt-1">享受像原生 App 一樣的全螢幕體驗</p>
            </div>

            <div className="text-left bg-stone-50 p-3.5 rounded-2xl flex flex-col gap-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600">iOS:</span>
                <span>點擊 Safari 底部「分享按鈕（長方形向上箭頭）」➔ 往下找到並點擊<strong>「加入主畫面」</strong>。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600">Android:</span>
                <span>點擊 Chrome 右上角「三個點選單」➔ 點擊<strong>「加到主螢幕」</strong>或「安裝應用程式」。</span>
              </div>
            </div>

            <button
              onClick={() => setShowPwaModal(false)}
              className={`w-full py-2.5 text-xs font-bold rounded-xl ${theme.primary}`}
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      <div
        onClick={onOpenThemeModal}
        className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl shadow-xs">
            {theme.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-stone-800">{theme.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                目前主題
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">點擊瀏覽並切換 8 款風格主題庫 ✨</p>
          </div>
        </div>
        <span className="text-sm font-bold text-stone-300">❯</span>
      </div>

      {/* 👤 個人基本身體數據 */}
     <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-3">
      <span className="text-xs font-bold text-stone-700">👤 個人身體數據 (計算 BMI 與每日基準)</span>
      <div className="grid grid-cols-2 gap-2 text-xs">
       <div>
         <label className="text-[10px] text-stone-400 font-bold block">身高 (cm)</label>
         <input
           type="number"
           step="0.1"
           value={profile.height || ''}
           onChange={(e) =>
             setProfile({ ...profile, height: Number(e.target.value) })
          }
          placeholder="例如 160"
          className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
        />
      </div>
      <div>
        <label className="text-[10px] text-stone-400 font-bold block">目前體重 (kg)</label>
        <input
          type="number"
          step="0.1"
          value={profile.weight || ''}
          onChange={(e) =>
            setProfile({ ...profile, weight: Number(e.target.value) })
          }
          placeholder="例如 52"
          className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
        />
      </div>
      <div>
         <label className="text-[10px] text-stone-400 font-bold block">目標體重 (kg)</label>
         <input
          type="number"
          step="0.1"
          value={profile.targetWeight || ''}
          onChange={(e) =>
            setProfile({ ...profile, targetWeight: Number(e.target.value) })
          }
          placeholder="例如 48"
          className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
        />
      </div>
      <div>
        <label className="text-[10px] text-stone-400 font-bold block">每日飲水目標 (ml)</label>
        <input
          type="number"
          step="50"
          value={profile.waterGoal || ''}
          onChange={(e) =>
            setProfile({ ...profile, waterGoal: Number(e.target.value) })
          }
          placeholder="例如 2000"
          className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
        />
      </div>
    </div>
  </div>

      {/* 休息日目標 */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-3">
        <span className="text-xs font-bold text-stone-700">☕ 休息日 (Rest Day) 目標設定</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-stone-400">總熱量 (kcal)</label>
            <input
              type="number"
              value={profile.restDay.calories}
              onChange={(e) =>
                setProfile({ ...profile, restDay: { ...profile.restDay, calories: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400">碳水化合物 (g)</label>
            <input
              type="number"
              value={profile.restDay.carbs}
              onChange={(e) =>
                setProfile({ ...profile, restDay: { ...profile.restDay, carbs: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400">蛋白質 (g)</label>
            <input
              type="number"
              value={profile.restDay.protein}
              onChange={(e) =>
                setProfile({ ...profile, restDay: { ...profile.restDay, protein: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400">油脂 / 脂肪 (g)</label>
            <input
              type="number"
              value={profile.restDay.fat}
              onChange={(e) =>
                setProfile({ ...profile, restDay: { ...profile.restDay, fat: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
        </div>
      </div>

      {/* 運動日目標 */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col gap-3">
        <span className="text-xs font-bold text-orange-600">⚡ 運動日 (Workout Day) 目標設定</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-stone-400">總熱量 (kcal)</label>
            <input
              type="number"
              value={profile.workoutDay.calories}
              onChange={(e) =>
                setProfile({ ...profile, workoutDay: { ...profile.workoutDay, calories: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400">碳水化合物 (g)</label>
            <input
              type="number"
              value={profile.workoutDay.carbs}
              onChange={(e) =>
                setProfile({ ...profile, workoutDay: { ...profile.workoutDay, carbs: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400">蛋白質 (g)</label>
            <input
              type="number"
              value={profile.workoutDay.protein}
              onChange={(e) =>
                setProfile({ ...profile, workoutDay: { ...profile.workoutDay, protein: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400">油脂 / 脂肪 (g)</label>
            <input
              type="number"
              value={profile.workoutDay.fat}
              onChange={(e) =>
                setProfile({ ...profile, workoutDay: { ...profile.workoutDay, fat: Number(e.target.value) } })
              }
              className="w-full border border-stone-200 rounded-xl p-2 mt-0.5 outline-none font-bold"
            />
          </div>
        </div>
      </div>

      {/* 🗑️ 重設當天紀錄按鈕 */}
      <button
        type="button"
        onClick={handleResetCurrentDay}
        className="w-full py-3 rounded-2xl font-bold text-xs bg-red-50 text-red-600 border border-red-200 active:scale-95 transition cursor-pointer"
      >
        🗑️ 清空 {selectedDate} 紀錄（重設為 0）
      </button>

      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-black text-sm shadow-md active:scale-95 transition ${theme.primary}`}
      >
        {savedSuccess ? '儲存成功！已同步至首頁 ✓' : '儲存所有設定'}
      </button>
    </div>
  );
}
