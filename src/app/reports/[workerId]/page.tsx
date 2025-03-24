"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import WorkTimer from "@/components/WorkTimer";

interface Worker {
  id: string;
  name: string;
}

interface Report {
  id: string;
  productCode: string;
  boxType: string;
  currentFraction: number;
  previousFraction: number;
  totalFraction: number;
  lotNumber: string | null;
  workingTimeSeconds?: number; // 作業時間を追加
  createdAt: string;
  workerId: string;
  worker: Worker;
}

export default function ReportsPage() {
  const params = useParams<{ workerId: string }>();
  const workerId = params.workerId;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workTimeSeconds, setWorkTimeSeconds] = useState<number>(0); // 作業時間を記録

  // フォーム状態
  const [formData, setFormData] = useState({
    productCode: "",
    boxType: "",
    currentFraction: "",
    previousFraction: "",
    lotNumber: "",
    workingTimeSeconds: 0,
  });

  // 合計端数（計算済み）
  const totalFraction =
    (parseInt(formData.currentFraction) || 0) +
    (parseInt(formData.previousFraction) || 0);

  useEffect(() => {
    if (workerId) {
      fetchWorkerData();
      fetchReports();
    }
  }, [workerId]);

  const fetchWorkerData = async () => {
    try {
      const response = await fetch(`/api/workers`);
      if (!response.ok) {
        throw new Error("作業者データの取得に失敗しました");
      }
      const workers = await response.json();
      const currentWorker = workers.find((w: Worker) => w.id === workerId);

      if (!currentWorker) {
        throw new Error("作業者が見つかりません");
      }

      setWorker(currentWorker);
    } catch (error) {
      console.error("Error fetching worker:", error);
      setError("作業者データの取得中にエラーが発生しました");
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log(`Fetching reports for workerId: ${workerId}`);

      const response = await fetch(`/api/reports?workerId=${workerId}`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(
          `日報データの取得に失敗しました (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`Received ${data.length} reports:`, data);

      setReports(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(
        error instanceof Error
          ? error.message
          : "日報データの取得中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // 数値フィールドの場合、整数のみを許可
    if (name === "currentFraction" || name === "previousFraction") {
      const numValue =
        value === "" ? "" : Math.floor(parseFloat(value)).toString();
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 作業時間の更新ハンドラー
  const handleTimeUpdate = (seconds: number) => {
    setWorkTimeSeconds(seconds);
    setFormData((prev) => ({
      ...prev,
      workingTimeSeconds: seconds,
    }));
  };

  // 作業終了ハンドラー
  const handleWorkComplete = (seconds: number) => {
    setWorkTimeSeconds(seconds);
    setFormData((prev) => ({
      ...prev,
      workingTimeSeconds: seconds,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productCode || !formData.boxType) {
      setError("品番と箱種は必須項目です");
      return;
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          currentFraction: parseInt(formData.currentFraction) || 0,
          previousFraction: parseInt(formData.previousFraction) || 0,
          workerId,
        }),
      });

      if (!response.ok) {
        throw new Error("日報の登録に失敗しました");
      }

      // 登録成功後にフォームをリセットし、日報リストを更新
      setFormData({
        productCode: "",
        boxType: "",
        currentFraction: "",
        previousFraction: "",
        lotNumber: "",
        workingTimeSeconds: 0,
      });
      setWorkTimeSeconds(0);
      fetchReports();
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("日報の登録中にエラーが発生しました");
    }
  };

  if (!worker && !loading) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">作業者が見つかりません</p>
        <Link href="/" className="text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 作業時間のフォーマット（時:分:秒）
  const formatWorkTime = (seconds: number | undefined) => {
    if (!seconds) return "-";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 作業者情報 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b-2 border-blue-500">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">作業者: {worker?.name}</h2>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← 作業者選択に戻る
          </Link>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* 作業時間計測コンポーネント */}
      <WorkTimer
        onTimeUpdate={handleTimeUpdate}
        onComplete={handleWorkComplete}
      />

      {/* 入力フォーム */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">端数合わせ入力</h3>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                品番 *
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                箱種 *
              </label>
              <select
                name="boxType"
                value={formData.boxType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleInputChange(e)
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="G">G</option>
                <option value="J">J</option>
                <option value="E">E</option>
                <option value="L">L</option>
                <option value="K">K</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                今回端数
              </label>
              <input
                type="number"
                name="currentFraction"
                value={formData.currentFraction}
                onChange={handleInputChange}
                min="0"
                step="1"
                onKeyDown={(e) => {
                  // 小数点の入力を禁止
                  if (e.key === ".") {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                前回端数
              </label>
              <input
                type="number"
                name="previousFraction"
                value={formData.previousFraction}
                onChange={handleInputChange}
                min="0"
                step="1"
                onKeyDown={(e) => {
                  // 小数点の入力を禁止
                  if (e.key === ".") {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                合計端数 (自動計算)
              </label>
              <input
                type="text"
                value={Math.floor(totalFraction)}
                className="w-full px-3 py-2 border bg-gray-100 rounded"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロット
              </label>
              <input
                type="text"
                name="lotNumber"
                value={formData.lotNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                作業時間
              </label>
              <input
                type="text"
                value={formatWorkTime(workTimeSeconds)}
                className="w-full px-3 py-2 border bg-gray-100 rounded"
                readOnly
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>

      {/* 日報一覧 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">日報一覧</h3>

        {loading ? (
          <p className="text-center py-4">読み込み中...</p>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    品番
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    箱種
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    今回端数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    前回端数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    合計端数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作業時間
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロット
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.productCode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {report.boxType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(report.currentFraction)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(report.previousFraction)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {Math.floor(report.totalFraction)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatWorkTime(report.workingTimeSeconds)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {report.lotNumber || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4">日報がありません</p>
        )}
      </div>
    </div>
  );
}
