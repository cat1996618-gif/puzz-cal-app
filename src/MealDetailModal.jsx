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

  const
