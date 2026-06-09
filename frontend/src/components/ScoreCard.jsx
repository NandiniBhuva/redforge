// ScoreCard.jsx
// Displays the overall security score and risk level after a scan

function ScoreCard({ overallScore, totalAttacks, successfulAttacks }) {

  // Pick colors based on risk level
  const levelConfig = {
    SECURE:     { color: 'text-green-400',  bg: 'bg-green-400',  border: 'border-green-500',  label: 'Secure' },
    MODERATE:   { color: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-500', label: 'Moderate Risk' },
    VULNERABLE: { color: 'text-orange-400', bg: 'bg-orange-400', border: 'border-orange-500', label: 'Vulnerable' },
    CRITICAL:   { color: 'text-red-400',    bg: 'bg-red-400',    border: 'border-red-500',    label: 'Critical' },
  }

  const config = levelConfig[overallScore?.level] || levelConfig.CRITICAL
  const score = overallScore?.score || 0
  const successRate = totalAttacks > 0
    ? Math.round((successfulAttacks / totalAttacks) * 100)
    : 0

  return (
    <div className={`bg-gray-900 rounded-xl border ${config.border} p-6 mb-6`}>
      <div className="flex items-center justify-between">

        {/* Score display */}
        <div>
          <p className="text-gray-500 text-sm mb-1">Security Score</p>
          <div className="flex items-end gap-2">
            <span className={`text-6xl font-bold ${config.color}`}>
              {score}
            </span>
            <span className="text-gray-500 text-2xl mb-2">/100</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-2 ${config.color} bg-gray-800`}>
            <div className={`w-2 h-2 rounded-full ${config.bg}`} />
            {config.label}
          </div>
        </div>

        {/* Score ring visualization */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#1f2937"
              strokeWidth="10"
            />
            {/* Score arc */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={
                score >= 80 ? '#4ade80' :
                score >= 60 ? '#facc15' :
                score >= 40 ? '#fb923c' :
                '#f87171'
              }
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${score * 3.14} 314`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${config.color}`}>{score}</span>
          </div>
        </div>

      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{totalAttacks}</p>
          <p className="text-gray-500 text-xs mt-1">Total Attacks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{successfulAttacks}</p>
          <p className="text-gray-500 text-xs mt-1">Succeeded</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">{successRate}%</p>
          <p className="text-gray-500 text-xs mt-1">Success Rate</p>
        </div>
      </div>

    </div>
  )
}

export default ScoreCard