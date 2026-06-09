// ScanConfig.jsx
// Left panel — lets user pick scenario, categories, and launch a scan

import { useState } from 'react'


// Available deployment scenarios
const SCENARIOS = [
  { id: 'general_assistant', label: 'General Assistant' },
  { id: 'customer_service', label: 'Customer Service Bot' },
  { id: 'coding_assistant', label: 'Coding Assistant' },
  { id: 'data_analyst', label: 'Data Analyst' },
]

// Attack categories
const CATEGORIES = [
  { id: 'jailbreak', label: 'Jailbreak', color: 'text-orange-400' },
  { id: 'role_hijacking', label: 'Role Hijacking', color: 'text-yellow-400' },
  { id: 'data_exfiltration', label: 'Data Exfiltration', color: 'text-red-400' },
  { id: 'indirect_injection', label: 'Indirect Injection', color: 'text-red-500' },
  { id: 'encoding_bypass', label: 'Encoding Bypass', color: 'text-purple-400' },
  { id: 'system_prompt_leak', label: 'System Prompt Leak', color: 'text-pink-400' },
]

function ScanConfig({ onScanStart, isScanning, scanHistory }) {
  // State for selected scenario
  const [scenario, setScenario] = useState('general_assistant')

  // State for selected categories — starts with all selected
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES.map(c => c.id)
  )

  // State for advanced options
  const [useMutations, setUseMutations] = useState(true)
  const [numMutations, setNumMutations] = useState(1)
   
  const [targetMode, setTargetMode] = useState('demo')
const [customEndpoint, setCustomEndpoint] = useState('')
const [customApiKey, setCustomApiKey] = useState('')

  // Toggle a category on/off
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)  // remove if already selected
        : [...prev, categoryId]                  // add if not selected
    )
  }

  // Select all / deselect all
  const toggleAll = () => {
    if (selectedCategories.length === CATEGORIES.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(CATEGORIES.map(c => c.id))
    }
  }

  // Handle scan launch
  const handleScan = () => {
  if (selectedCategories.length === 0) return
  onScanStart({
    scenario,
    categories: selectedCategories,
    use_mutations: useMutations,
    num_mutations: numMutations,
    target_mode: targetMode,
    custom_endpoint: targetMode === 'custom' ? customEndpoint : null,
    custom_api_key: targetMode === 'custom' ? customApiKey : null,
  })
}

  return (
    <div className="w-72 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">

      {/* Scenario Selection */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Target Scenario
        </h2>
        <div className="space-y-2">
          {SCENARIOS.map(s => (
            <label
              key={s.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="scenario"
                value={s.id}
                checked={scenario === s.id}
                onChange={() => setScenario(s.id)}
                className="accent-red-500"
              />
              <span className={`text-sm ${
                scenario === s.id ? 'text-white' : 'text-gray-400'
              } group-hover:text-white transition-colors`}>
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Attack Categories
          </h2>
          <button
            onClick={toggleAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {selectedCategories.length === CATEGORIES.length ? 'None' : 'All'}
          </button>
        </div>

        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="accent-red-500"
              />
              <span className={`text-sm ${
                selectedCategories.includes(cat.id)
                  ? cat.color
                  : 'text-gray-500'
              } group-hover:text-white transition-colors`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Mutation Settings */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Mutation Engine
        </h2>

        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={useMutations}
            onChange={() => setUseMutations(!useMutations)}
            className="accent-red-500"
          />
          <span className="text-sm text-gray-300">Enable mutations</span>
        </label>

        {useMutations && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Mutations per attack: {numMutations}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={numMutations}
              onChange={e => setNumMutations(parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1 (fast)</span>
              <span>10 (thorough)</span>
            </div>
          </div>
        )}
      </div>

      {/* Custom Endpoint */}
<div className="p-4 border-b border-gray-800">
  <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
    Target
  </h2>

  <div className="space-y-3">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="target"
        value="demo"
        checked={targetMode === 'demo'}
        onChange={() => setTargetMode('demo')}
        className="accent-red-500"
      />
      <span className={`text-sm ${targetMode === 'demo' ? 'text-white' : 'text-gray-400'}`}>
        Demo mode (LLaMA 3.3)
      </span>
    </label>

    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="target"
        value="custom"
        checked={targetMode === 'custom'}
        onChange={() => setTargetMode('custom')}
        className="accent-red-500"
      />
      <span className={`text-sm ${targetMode === 'custom' ? 'text-white' : 'text-gray-400'}`}>
        Custom endpoint
      </span>
    </label>

    {targetMode === 'custom' && (
      <div className="space-y-2 mt-2">
        <input
          type="text"
          placeholder="https://your-api.com/chat"
          value={customEndpoint}
          onChange={e => setCustomEndpoint(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
        />
        <input
          type="password"
          placeholder="API key (optional)"
          value={customApiKey}
          onChange={e => setCustomApiKey(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
        />
        <p className="text-gray-600 text-xs">
          Endpoint must accept POST with JSON body: {`{"message": "..."}`}
        </p>
      </div>
    )}
  </div>
</div>

      {/* Launch Button */}
      <div className="p-4">
        <button
          onClick={handleScan}
          disabled={isScanning || selectedCategories.length === 0}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
            isScanning || selectedCategories.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
          }`}
        >
          {isScanning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span>
              Scanning...
            </span>
          ) : (
            '⚡ Run Scan'
          )}
        </button>

        {selectedCategories.length === 0 && (
          <p className="text-red-400 text-xs text-center mt-2">
            Select at least one category
          </p>
        )}
      </div>

      {/* Scan History */}
      {scanHistory && scanHistory.length > 0 && (
        <div className="p-4 border-t border-gray-800 flex-1">
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Recent Scans
          </h2>
          <div className="space-y-2">
            {scanHistory.map(scan => (
              <div
                key={scan.id}
                className="bg-gray-800 rounded p-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${
                    scan.risk_level === 'CRITICAL' ? 'text-red-400' :
                    scan.risk_level === 'VULNERABLE' ? 'text-orange-400' :
                    scan.risk_level === 'MODERATE' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {scan.risk_level}
                  </span>
                  <span className="text-gray-500">
                    {scan.security_score}/100
                  </span>
                </div>
                <div className="text-gray-500 mt-1">
                  {new Date(scan.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default ScanConfig