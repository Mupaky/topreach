'use client';

import { useState } from 'react';

export default function InvestmentForm() {
  const [formData, setFormData] = useState({
    name: '',
    idea_summary: '',
    product_description: '',
    experience: '',
    has_competition: false,
    competitive_advantage: '',
    equity_percentage: '',
    investment_amount: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/investment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setMessage('✅ Успешно изпратено!');
      setFormData({
        name: '',
        idea_summary: '',
        product_description: '',
        experience: '',
        has_competition: false,
        competitive_advantage: '',
        equity_percentage: '',
        investment_amount: '',
      });
    } else {
      const errorData = await response.json();
      setMessage(`❌ Грешка: ${errorData.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 mt-10">
      <h2 className="text-2xl font-bold text-accent mb-4">Форма за Инвестиция</h2>

      <input
        type="text"
        name="name"
        placeholder="Име"
        value={formData.name}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <textarea
        name="idea_summary"
        placeholder="Идеята за бизнеса ти накратко"
        value={formData.idea_summary}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <textarea
        name="product_description"
        placeholder="Какъв е продукта ти?"
        value={formData.product_description}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <textarea
        name="experience"
        placeholder="Имаш ли опит в този бизнес и идеята която си се захванал?"
        value={formData.experience}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          name="has_competition"
          checked={formData.has_competition}
          onChange={handleChange}
          className="accent-accent"
        />
        <span>Имаш ли конкуренция?</span>
      </label>

      <textarea
        name="competitive_advantage"
        placeholder="С какво си по-добър от конкуренцията (ако имаш)?"
        value={formData.competitive_advantage}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <input
        type="number"
        name="equity_percentage"
        placeholder="Какъв % от бизнеса продаваш?"
        value={formData.equity_percentage}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <input
        type="number"
        name="investment_amount"
        placeholder="Колко лева търсиш в замяна на % та който даваш?"
        value={formData.investment_amount}
        onChange={handleChange}
        className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-accent hover:bg-accentLighter transition-colors text-white font-semibold py-2 rounded"
      >
        Изпрати
      </button>

      {message && (
        <p className="mt-3 text-center text-sm text-accent">{message}</p>
      )}
    </form>
  );
}
