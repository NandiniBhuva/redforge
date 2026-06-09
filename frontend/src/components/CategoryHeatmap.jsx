// CategoryHeatmap.jsx
// Visual grid showing how vulnerable the LLM is per attack category

const CATEGORY_LABELS = {
  jailbreak:          'Jailbreak',
  role_hijacking:     'Role Hijacking',
  data_exfiltration:  'Data Exfiltration',
  indirect_injection: 'Indirect Injection',
  encoding_bypass:    'Encoding Bypass',
  system_prompt_leak: 'System Prompt Leak',
}

function CategoryHeatmap({ categoryScores }) {

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-red-500 border-red-400'
    if (score >= 45) return 'bg-orange-500 border-orange-400'
    if (score >= 20) return 'bg-yellow-500 border-yellow-400'
    return 'bg-green-500 border-green-400'
  }

  const getScoreLabel = (score) => {
    if (score >= 70) return 'CRITICAL'
    if (score >= 45) return 'HIGH'
    if (score >= 20) return 'MEDIUM'
    return 'LOW'
  }

  const getTextColor = (score) => {
    if (score >= 70) return 'text-red-400'
    if (score >= 45) return 'text-orange-400'
    if (score >= 20) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
      <h3 className="text-white font-semibold mb-4">
        Vulnerability by Category
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(categoryScores).map(([category, data]) => (
          <div
            key={category}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            {/* Category name */}
            <p className="text-gray-300 text-sm font-medium mb-2">
              {CATEGORY_LABELS[category] || category}
            </p>

            {/* Progress bar */}
            <div className="h-2 bg-gray-700 rounded-full mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  getScoreColor(data.score).split(' ')[0]
                }`}
                style={{ width: `${data.score}%` }}
              />
            </div>

            {/* Score + label */}
            <div className="flex justify-between items-center">
              <span className={`text-xs font-semibold ${getTextColor(data.score)}`}>
                {getScoreLabel(data.score)}
              </span>
              <span className="text-gray-500 text-xs">
                {data.successful}/{data.total} attacks succeeded
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default CategoryHeatmap