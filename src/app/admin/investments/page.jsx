'use client';

import { useEffect, useState } from 'react';
import AdminLayout from "@/components/dashboard/AdminLayout";

export default function AdminInvestmentsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch('/api/admin/investments');
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Грешка при зареждане');

        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  return (
    <AdminLayout>
        <div className="p-8 text-white max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-accent">Инвестиционни заявки</h1>

        {loading ? (
            <p className="text-gray-400">Зареждане...</p>
        ) : error ? (
            <p className="text-red-400">❌ {error}</p>
        ) : submissions.length === 0 ? (
            <p className="text-gray-400">Няма подадени заявки.</p>
        ) : (
            <div className="space-y-6">
            {submissions.map((submission) => (
                <div
                key={submission.id}
                className="bg-gray-800 border border-gray-700 p-4 rounded-lg space-y-2"
                >
                <h2 className="text-lg font-semibold text-accent">
                    {submission.name}
                </h2>
                <p>
                    <strong>Идея:</strong> {submission.idea_summary}
                </p>
                <p>
                    <strong>Продукт:</strong> {submission.product_description}
                </p>
                <p>
                    <strong>Опит:</strong> {submission.experience}
                </p>
                <p>
                    <strong>Има конкуренция:</strong>{' '}
                    {submission.has_competition ? 'Да' : 'Не'}
                </p>
                <p>
                    <strong>Предимство:</strong> {submission.competitive_advantage}
                </p>
                <p>
                    <strong>% от бизнеса:</strong> {submission.equity_percentage}%
                </p>
                <p>
                    <strong>Инвестиция търси:</strong> {submission.investment_amount} лв.
                </p>
                <p className="text-sm text-gray-500">
                    Подадено на: {new Date(submission.created_at).toLocaleDateString('bg-BG')}
                </p>
                </div>
            ))}
            </div>
        )}
        </div>
    </AdminLayout>
  );
}
