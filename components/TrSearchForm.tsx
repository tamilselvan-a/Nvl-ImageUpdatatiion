"use client";

import { useState } from "react";
import { getTranCust } from "@/lib/cameo-api";
import { TranCustResponse } from "@/types/tran-cust";

type Zone = "live" | "dev";

export default function TrSearchForm() {
  const [zone, setZone] = useState<Zone>("live");
  const [trNumber, setTrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranCustResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getTranCust(trNumber.trim(), zone);
      setResult(response);
    } catch {
      setError("Failed to fetch data. Please check the TR Number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTrNumber("");
    setResult(null);
    setError(null);
  };

  const isLive = zone === "live";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CAMEO Transaction</h1>
            <p className="text-sm text-gray-500">Enter a TR Number to fetch customer transaction details.</p>
          </div>

          {/* Zone Toggle */}
          <button
            type="button"
            onClick={() => { setZone(isLive ? "dev" : "live"); setResult(null); setError(null); }}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${
              isLive
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-orange-50 border-orange-400 text-orange-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500" : "bg-orange-500"}`} />
            {isLive ? "Live Zone" : "Dev Zone"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="trNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Enter TR Number
            </label>
            <input
              id="trNumber"
              type="text"
              value={trNumber}
              onChange={(e) => setTrNumber(e.target.value)}
              placeholder="e.g. T260000001"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !trNumber.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Fetching..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-5">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
              {result.message}
            </div>

            {result.data.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                      {Object.keys(result.data[0]).map((key) => (
                        <th key={key} className="px-4 py-2 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 whitespace-nowrap">{String(val ?? "-")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No records found.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
