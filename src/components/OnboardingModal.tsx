import React, { useState } from "react";
import { CATEGORIES_ONBOARDING } from "@/constants";

interface OnboardingModalProps {
  onComplete: (selectedCategories: string[]) => void;
}

const CategoryCard: React.FC<{
  name: string;
  icon: string;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ name, icon, onSelect, isSelected }) => {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 aspect-square ${isSelected ? "border-slate-600 bg-slate-100 dark:border-slate-400 dark:bg-slate-700 scale-105 shadow-lg" : "border-gray-200 bg-white hover:border-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500"}`}
    >
      <span className="text-5xl mb-2">{icon}</span>
      <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
        {name}
      </span>
    </button>
  );
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleComplete = () => {
    onComplete(selectedCategories);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-slate-900 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Chào mừng tới AgentFashion!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          Hãy cho chúng tôi biết phong cách của bạn. Chọn những danh mục bạn yêu
          thích.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {CATEGORIES_ONBOARDING.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
              isSelected={selectedCategories.includes(category.name)}
              onSelect={() => toggleCategory(category.name)}
            />
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={selectedCategories.length === 0}
          className="px-12 py-4 bg-slate-700 text-white rounded-lg font-semibold text-lg hover:bg-slate-800 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed dark:hover:bg-slate-600 dark:disabled:bg-gray-600 disabled:scale-100"
        >
          Bắt đầu mua sắm
        </button>
      </div>
      <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default OnboardingModal;
