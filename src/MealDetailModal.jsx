import React from 'react';

export default function MealDetailModal({ meal, onClose }) {
  if (!meal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-stone-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 bg-stone-50 rounded-2xl border border-stone-100">
              {meal.emoji}
            </span>
            <div>
              <h3 className="font-bold text-lg text-stone-800">{meal.meal_name}</h3>
              <p className="text-xs text-stone-400">{meal.time || '今日餐點'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200"
          >
            ✕
          </button>
        </div>

        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex justify-around text-center">
          <div>
            <div className="text-xs text-stone-400">總熱量</div>
            <div className="text-lg font-black text-amber-600">
              {meal.total_calories} <span className="text-xs font-normal">kcal</span>
            </div>
          </div>
          <div className="w-[1px] bg-stone-200 my-1" />
          <div>
            <div className="text-xs text-stone-400">蛋白質</div>
            <div className="text-sm font-bold text-stone-700">{meal.macros?.protein || 0}g</div>
          </div>
          <div>
            <div className="text-xs text-stone-400">碳水</div>
            <div className="text-sm font-bold text-stone-700">{meal.macros?.carbs || 0}g</div>
          </div>
          <div>
            <div className="text-xs text-stone-400">脂肪</div>
            <div className="text-sm font-bold text-stone-700">{meal.macros?.fat || 0}g</div>
          </div>
        </div>

        {meal.items && meal.items.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-stone-500">食材明細</span>
            <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {meal.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs bg-white p-2 rounded-xl border border-stone-100"
                >
                  <span className="font-medium text-stone-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">{item.portion}</span>
                    <span className="font-bold text-stone-600">{item.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {meal.advice && (
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
            💡 {meal.advice}
          </div>
        )}
      </div>
    </div>
  );
}