import React, { useState } from 'react';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const foodSchema = {
  type: SchemaType.OBJECT,
  properties: {
    meal_name: { type: SchemaType.STRING, description: "餐點名稱" },
    emoji: { type: SchemaType.STRING, description: "最合適的單一 Emoji，如 🥗, 🍗" },
    total_calories: { type: SchemaType.NUMBER, description: "總卡路里 (kcal)" },
    macros: {
      type: SchemaType.OBJECT,
      properties: {
        protein: { type: SchemaType.NUMBER, description: "蛋白質(g)" },
        carbs: { type: SchemaType.NUMBER, description: "碳水化合物(g)" },
        fat: { type: SchemaType.NUMBER, description: "脂肪/油脂(g)" },
      },
      required: ["protein", "carbs", "fat"],
    },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          portion: { type: SchemaType.STRING },
          calories: { type: SchemaType.NUMBER },
        },
      },
    },
    advice: { type: SchemaType.STRING, description: "簡短點評" },
  },
  required: ["meal_name", "emoji", "total_calories", "macros"],
};

export default function FoodScannerModal({ onMealLogged }) {
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recipe');
  const [loading, setLoading] = useState(false);

  const [mealName, setMealName] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [manualData, setManualData] = useState({ calories: '', protein: '', carbs: '', fat: '', emoji: '🍱' });

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxDim = 1000;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoPreview(dataUrl);
        setPhotoBase64(dataUrl.split(',')[1]);
        setIsOpen(true);
      };
    };
    e.target.value = '';
  };

  const callAI = async (prompt) => {
    if (!genAI) {
      throw new Error('未設定 VITE_GEMINI_API_KEY 環境變數！');
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: foodSchema,
      },
    });

    const parts = [prompt];
    if (photoBase64) {
      parts.push({
        inlineData: {
          data: photoBase64,
          mimeType: 'image/jpeg',
        },
      });
    }

    const result = await model.generateContent(parts);
    return JSON.parse(result.response.text());
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalMeal = null;

      if (activeTab === 'recipe') {
        const prompt = `使用者自己煮了這道菜：${mealName || '自製料理'}。
照片如附。詳細食材與重量清單如下：
${ingredientsText}
請根據這些精確的食材克數與照片，精準計算出總卡路里、三大營養素（蛋白質、碳水化合物、脂肪克數），並挑選一個最貼切的 Emoji。`;
        finalMeal = await callAI(prompt);
      } else if (activeTab === 'ai_photo') {
        const prompt = `請辨識這張食物照片（餐點備註：${mealName || '一般外食'}）。
請估算其熱量與蛋白質、碳水、油脂（脂肪）的克數，並挑選一個最合適的 Emoji。`;
        finalMeal = await callAI(prompt);
      } else if (activeTab === 'manual') {
        finalMeal = {
          meal_name: mealName || '外食記錄',
          emoji: manualData.emoji || '🥪',
          total_calories: Number(manualData.calories) || 0,
          macros: {
            protein: Number(manualData.protein) || 0,
            carbs: Number(manualData.carbs) || 0,
            fat: Number(manualData.fat) || 0,
          },
          items: [{ name: mealName || '包裝食品', portion: '1份', calories: Number(manualData.calories) || 0 }],
          advice: '手動輸入記錄',
        };
      }

      if (finalMeal) {
        onMealLogged(finalMeal);
        closeModal();
      }
    } catch (err) {
      console.error(err);
      alert('計算失敗：' + (err.message || '請確認 API 金鑰是否正確！'));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setPhotoBase64(null);
    setPhotoPreview(null);
    setIngredientsText('');
    setMealName('');
    setManualData({ calories: '', protein: '', carbs: '', fat: '', emoji: '🍱' });
  };

  return (
    <>
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
        <label className="flex items-center justify-center gap-3 w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl cursor-pointer font-bold text-base shadow-md shadow-amber-200 active:scale-95 transition-all">
          <span className="text-2xl">📸</span>
          <span>記錄這餐（拍照 / 上傳）</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
        </label>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-stone-800">選擇熱量計算方式</h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1">
                ✕ 取消
              </button>
            </div>

            {photoPreview && (
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-stone-100 bg-stone-100">
                <img src={photoPreview} alt="預覽" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] text-white">
                  已擷取食物照
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-stone-500 mb-1 block">餐點名稱（選填）</label>
              <input
                type="text"
                placeholder="例如：自製煎牛排配花椰菜 / 超商雞肉便當"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('recipe')}
                className={`py-2 rounded-xl transition ${
                  activeTab === 'recipe' ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500'
                }`}
              >
                1. 寫食材 AI 算
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`py-2 rounded-xl transition ${
                  activeTab === 'manual' ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500'
                }`}
              >
                2. 手動填數值
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai_photo')}
                className={`py-2 rounded-xl transition ${
                  activeTab === 'ai_photo' ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500'
                }`}
              >
                3. AI 看照片算
              </button>
            </div>

            {activeTab === 'recipe' && (
              <div className="flex flex-col gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                <span className="text-xs font-bold text-stone-600">📝 輸入食材名稱與克數：</span>
                <textarea
                  rows={3}
                  placeholder="例如：&#10;去皮雞胸肉 200g&#10;白飯 150g&#10;橄欖油 10ml&#10;花椰菜 100g"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  className="w-full text-xs border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
                <p className="text-[11px] text-stone-400">AI 會結合克數與照片，精準計算熱量與三大營養素。</p>
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="flex flex-col gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                <span className="text-xs font-bold text-stone-600">🏷️ 直接填寫外食包裝數值：</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">總熱量 (kcal)</label>
                    <input
                      type="number"
                      placeholder="例: 520"
                      value={manualData.calories}
                      onChange={(e) => setManualData({ ...manualData, calories: e.target.value })}
                      className="w-full text-xs border border-stone-200 rounded-xl p-2 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">自選 Emoji</label>
                    <input
                      type="text"
                      placeholder="例: 🍱"
                      value={manualData.emoji}
                      onChange={(e) => setManualData({ ...manualData, emoji: e.target.value })}
                      className="w-full text-xs border border-stone-200 rounded-xl p-2 bg-white outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">蛋白質 (g)</label>
                    <input
                      type="number"
                      placeholder="例: 32"
                      value={manualData.protein}
                      onChange={(e) => setManualData({ ...manualData, protein: e.target.value })}
                      className="w-full text-xs border border-stone-200 rounded-xl p-2 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">碳水化合物 (g)</label>
                    <input
                      type="number"
                      placeholder="例: 65"
                      value={manualData.carbs}
                      onChange={(e) => setManualData({ ...manualData, carbs: e.target.value })}
                      className="w-full text-xs border border-stone-200 rounded-xl p-2 bg-white outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-stone-500 block mb-0.5">油脂/脂肪 (g)</label>
                    <input
                      type="number"
                      placeholder="例: 12"
                      value={manualData.fat}
                      onChange={(e) => setManualData({ ...manualData, fat: e.target.value })}
                      className="w-full text-xs border border-stone-200 rounded-xl p-2 bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai_photo' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center flex flex-col items-center gap-1">
                <span className="text-3xl">✨</span>
                <span className="text-xs font-bold text-stone-700">由 AI 視覺模型直接推估</span>
                <p className="text-[11px] text-stone-400 mt-1">適合餐廳聚餐。AI 會自動推估份量並計算熱量與三大營養素。</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || (activeTab === 'recipe' && !ingredientsText.trim())}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-sm disabled:opacity-40 transition shadow-lg"
            >
              {loading ? 'AI 正在計算營養成分中...' : '確認並記錄此餐'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
