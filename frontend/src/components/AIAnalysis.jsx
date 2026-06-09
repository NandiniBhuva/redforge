function AIAnalysis({ aiAnalysis }) {

  if (!aiAnalysis || !aiAnalysis.success) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <p className="text-gray-500">AI analysis unavailable.</p>
      </div>
    )
  }

  const sections = [
    {
      key: 'executive_summary',
      title: 'Executive Summary',
      border: 'border-cyan-500/30',
      titleColor: 'text-cyan-400',
      bg: 'bg-cyan-500/5',
    },
    {
      key: 'vulnerability_analysis',
      title: 'Vulnerability Analysis',
      border: 'border-red-500/30',
      titleColor: 'text-red-400',
      bg: 'bg-red-500/5',
    },
    {
      key: 'attack_patterns',
      title: 'Attack Patterns',
      border: 'border-orange-500/30',
      titleColor: 'text-orange-400',
      bg: 'bg-orange-500/5',
    },
    {
      key: 'remediation',
      title: 'Prioritized Fixes',
      border: 'border-green-500/30',
      titleColor: 'text-green-400',
      bg: 'bg-green-500/5',
    },
    {
      key: 'comparison',
      title: 'Comparison to Hardened Model',
      border: 'border-purple-500/30',
      titleColor: 'text-purple-400',
      bg: 'bg-purple-500/5',
    },
  ]

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-4">
        AI Security Analysis
      </h3>
      <div className="space-y-4">
        {sections.map(section => (
          aiAnalysis[section.key] ? (
            <div
              key={section.key}
              className={`rounded-xl border ${section.border} ${section.bg} p-5`}
            >
              <h4 className={`font-semibold text-sm mb-3 ${section.titleColor}`}>
                {section.title}
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnalysis[section.key]}
              </p>
            </div>
          ) : null
        ))}
        {aiAnalysis.verdict && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">
            <h4 className="font-semibold text-sm mb-2 text-yellow-400">
              Verdict
            </h4>
            <p className="text-yellow-200 text-sm font-medium">
              → {aiAnalysis.verdict}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAnalysis