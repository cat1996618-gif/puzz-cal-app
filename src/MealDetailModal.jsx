import React, { useState, useEffect } from 'react';

export default function MealDetailModal({ meal, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    if (meal) {
      setEditForm({
        meal_name: meal.meal_name || '',
        total_calories: meal.total_calories || 0,
        carbs: meal.macros?.carbs ?? 0,
        protein: meal.macros?.protein ?? 0,
        fat: meal.macros?.fat ?? 0,
      });
      setIsEditing(false);
    }
  }, [meal]);

  if (!meal || !editForm) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...meal,
        meal_name: editForm.meal_name,
        total_calories: parseFloat(editForm.total_calories) || 0,
        macros: {
          carbs: parseFloat(editForm.carbs) || 0,
          protein: parseFloat(editForm.protein) || 0,
          fat: parseFloat(editForm.fat) || 0,
        },
      });
    }
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`確定要刪除「${meal.meal_name}」這筆紀錄嗎？沙盒裡的這道菜也會一起移除喔！`)) {
      if (onDelete) onDelete(meal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-stone-100 flex flex-col gap-4">
        
        {/* 標題與關閉按鈕 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 mr-2">
            <span className="text-3xl p-2 bg-stone-50 rounded-2xl border border-stone-100 shrink-0">
              {meal.emoji || '🍱'}
            </span>
            <div className="flex-1">
              {isEditing ? (
                <div>
                  <label className="text-[10px] text-stone-400 font-bold block">餐點名稱</label>
                  <input
                    type="text"
                    value={editForm.meal_name}
                    onChange={(e) => setEditForm({ ...editForm, meal_name: e.target.value })}
                    className="w-full font-bold text-sm text-stone-800 border-b border-amber-400 outline-none pb-0.5"
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-base text-stone-800 line-clamp-1">{meal.meal_name}</h3>
                  <p className="text-xs text-stone-400">{meal.time || '今日餐點'}</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* 數據區塊（檢視 / 編輯狀態切換） */}
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
            <div>
              <label className="text-[10px] text-stone-400 font-bold block mb-1">總熱量 (kcal)</label>
              <input
                type="number"
                step="any"
                value={editForm.total_calories}
                onChange={(e) => setEditForm({ ...editForm, total_calories: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-black text-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 font-bold block mb-1">碳水化合物 (g)</label>
              <input
                type="number"
                step="any"
                value={editForm.carbs}
                onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 font-bold block mb-1">蛋白質 (g)</label>
              <input
                type="number"
                step="any"
                value={editForm.protein}
                onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 font-bold block mb-1">油脂 / 脂肪 (g)</label>
              <input
                type="number"
                step="any"
                value={editForm.fat}
                onChange={(e) => setEditForm({ ...editForm, fat: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
              />
            </div>
          </div>
        ) : (
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
              <div className="text-sm font-bold text-stone-700">{meal.macros?.protein ?? 0}g</div>
            </div>
            <div>
              <div className="text-xs text-stone-400">碳水</div>
              <div className="text-sm font-bold text-stone-700">{meal.macros?.carbs ?? 0}g</div>
            </div>
            <div>
              <div className="text-xs text-stone-400">脂肪</div>
              <div className="text-sm font-bold text-stone-700">{meal.macros?.fat ?? 0}g</div>
            </div>
          </div>
        )}

        {/* 食材明細（僅檢視模式顯示） */}
        {!isEditing && meal.items && meal.items.length > 0 && (
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

        {/* 建議（僅檢視模式顯示） */}
        {!isEditing && meal.advice && (
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
            💡 {meal.advice}
          </div>
        )}

        {/* 底部操作按鈕 */}
        <div className="flex gap-2 pt-1 border-t border-stone-100">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold active:scale-95 transition shadow-sm cursor-pointer"
              >
                儲存確認
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-100 active:scale-95 transition cursor-pointer"
              >
                🗑️ 刪除紀錄
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold active:scale-95 transition shadow-sm cursor-pointer"
              >
                ✏️ 修改數值
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
