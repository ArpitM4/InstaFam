'use client';

import { useState } from 'react';

export default function DiscountCodeTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const initializeCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/init-discount-codes', {
        method: 'POST'
      });
      const data = await response.json();
      setResult({ type: 'init', data });
    } catch (error) {
      setResult({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/init-discount-codes');
      const data = await response.json();
      setResult({ type: 'check', data });
    } catch (error) {
      setResult({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testApply = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discount-codes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'FIRST50' })
      });
      const data = await response.json();
      setResult({ type: 'apply', data, status: response.status });
    } catch (error) {
      setResult({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Discount Code Debug Panel</h1>
      
      <div className="space-x-4">
        <button
          onClick={initializeCode}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Initialize FIRST50 Code
        </button>
        
        <button
          onClick={checkCodes}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Check All Codes
        </button>
        
        <button
          onClick={testApply}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          Test Apply FIRST50
        </button>
      </div>

      {loading && (
        <div className="p-4 bg-gray-100 rounded">
          Loading...
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Result ({result.type}):</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
