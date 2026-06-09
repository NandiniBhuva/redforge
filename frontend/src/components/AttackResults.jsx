// AttackResults.jsx
// Table showing every individual attack that was fired during the scan
// Each row is expandable to show the full prompt and LLM response

import { useState } from 'react'

const SEVERITY_COLORS = {
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/20',
  HIGH:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  MEDIUM:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  LOW:      'text-green-400 bg-green-400/10 border-green-400/20',
}

function AttackResults({ results }) {
  // Track which row is expanded — stores the attack_id of the expanded row
  // null means no row is expanded
  const [expandedId, setExpandedId] = useState(null)

  // Toggle a row open/closed
  const toggleRow = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Separate successful and failed attacks
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Attack Results</h3>
        <div className="flex gap-3">
          <span className="text-red-400 text-sm">
            {successful.length} succeeded
          </span>
          <span className="text-gray-500 text-sm">
            {failed.length} blocked
          </span>
        </div>
      </div>

      {/* Results table */}
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.attack_id} className="border border-gray-800 rounded-lg overflow-hidden">

            {/* Row header — always visible */}
            <div
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                result.success ? 'bg-red-500/5' : 'bg-gray-800/20'
              }`}
              onClick={() => toggleRow(result.attack_id)}
            >
              {/* Success/fail indicator */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                result.success ? 'bg-red-400' : 'bg-green-400'
              }`} />

              {/* Attack name */}
              <span className="text-sm text-gray-200 flex-1 font-medium">
                {result.name}
              </span>

              {/* Strategy badge (original vs mutation) */}
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                {result.strategy === 'original' ? 'original' : `mutation`}
              </span>

              {/* Severity badge */}
              <span className={`text-xs px-2 py-0.5 rounded border ${
                SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.MEDIUM
              }`}>
                {result.severity}
              </span>

              {/* Confidence score */}
              <span className={`text-sm font-semibold w-12 text-right ${
                result.success ? 'text-red-400' : 'text-gray-500'
              }`}>
                {result.confidence}%
              </span>

              {/* Expand arrow */}
              <span className="text-gray-600 text-xs">
                {expandedId === result.attack_id ? '▲' : '▼'}
              </span>
            </div>

            {/* Expanded row — only shown when this row is clicked */}
            {expandedId === result.attack_id && (
              <div className="border-t border-gray-800 p-4 bg-gray-950 space-y-4">

                {/* Reasoning */}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                    Scorer Reasoning
                  </p>
                  <p className={`text-sm ${result.success ? 'text-red-300' : 'text-green-300'}`}>
                    {result.reasoning}
                  </p>
                </div>

                {/* Attack prompt */}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                    Attack Prompt
                  </p>
                  <div className="bg-gray-900 rounded p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap border border-gray-800">
                    {result.prompt}
                  </div>
                </div>

                {/* LLM Response */}
                {result.response && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                      LLM Response
                    </p>
                    <div className={`bg-gray-900 rounded p-3 text-sm font-mono whitespace-pre-wrap border ${
                      result.success
                        ? 'text-red-200 border-red-900'
                        : 'text-gray-400 border-gray-800'
                    }`}>
                      {result.response}
                    </div>
                  </div>
                )}

                {/* Matched indicators */}
                {result.matched_indicators && result.matched_indicators.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                      Matched Indicators
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_indicators.map((ind, i) => (
                        <span key={i} className="text-xs bg-red-900/30 text-red-300 px-2 py-0.5 rounded border border-red-800/30">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AttackResults