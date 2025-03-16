"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Worker {
  id: string;
  name: string;
}

export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workers");
      if (!response.ok) {
        throw new Error("作業者データの取得に失敗しました");
      }
      const data = await response.json();
      setWorkers(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError("作業者データの取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) {
      setError("作業者名を入力してください");
      return;
    }

    try {
      const response = await fetch("/api/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newWorkerName }),
      });

      if (!response.ok) {
        throw new Error("作業者の登録に失敗しました");
      }

      // 登録成功後にフォームをリセットし、作業者リストを更新
      setNewWorkerName("");
      fetchWorkers();
    } catch (error) {
      console.error("Error creating worker:", error);
      setError("作業者の登録中にエラーが発生しました");
    }
  };

  const selectWorker = (workerId: string) => {
    router.push(`/reports/${workerId}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">作業者選択</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <>
            {workers.length > 0 ? (
              <ul className="space-y-2 mb-6">
                {workers.map((worker) => (
                  <li
                    key={worker.id}
                    className="border rounded p-3 hover:bg-gray-50"
                  >
                    <button
                      onClick={() => selectWorker(worker.id)}
                      className="w-full text-left font-medium text-blue-600"
                    >
                      {worker.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-6 text-gray-500">
                作業者が登録されていません。下のフォームから新しい作業者を登録してください。
              </p>
            )}
          </>
        )}

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">新しい作業者を登録</h3>
          <form onSubmit={createWorker} className="flex gap-2">
            <input
              type="text"
              value={newWorkerName}
              onChange={(e) => setNewWorkerName(e.target.value)}
              placeholder="作業者名を入力"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              登録
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
