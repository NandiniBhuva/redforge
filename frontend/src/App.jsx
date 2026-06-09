import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/Header'
import ScanConfig from './components/ScanConfig'
import ScoreCard from './components/ScoreCard'
import CategoryHeatmap from './components/CategoryHeatmap'
import AIAnalysis from './components/AIAnalysis'
import AttackResults from './components/AttackResults'
import FlowDiagram from './components/FlowDiagram'

const API_URL = 'http://localhost:8000'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [scanHistory, setScanHistory] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/api/health`)
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false))

    axios.get(`${API_URL}/api/history`)
      .then(res => setScanHistory(res.data.scans))
      .catch(() => {})
  }, [])

  const handleScanStart = async (config) => {
    setIsScanning(true)
    setScanResults(null)

    try {
      const response = await axios.post(`${API_URL}/api/scan`, config)
      setScanResults(response.data)

      const history = await axios.get(`${API_URL}/api/history`)
      setScanHistory(history.data.scans)
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header isConnected={isConnected} />

      <div className="flex">
        <ScanConfig
          onScanStart={handleScanStart}
          isScanning={isScanning}
          scanHistory={scanHistory}
        />

        <main className="flex-1 p-8 overflow-y-auto">

          {/* Empty state */}
          {!scanResults && !isScanning && (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="text-6xl mb-4">🔴</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready to test your LLM
              </h2>
              <p className="text-gray-500 max-w-md">
                Select a scenario and attack categories on the left,
                then click Run Scan to test your LLM for prompt injection vulnerabilities.
              </p>
            </div>
          )}

          {/* Scanning state */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="text-4xl animate-spin mb-4">⟳</div>
              <p className="text-gray-400 text-lg">Running attack suite...</p>
              <p className="text-gray-600 text-sm mt-2">
                Firing attacks + generating mutations. This takes 2-5 minutes.
              </p>
            </div>
          )}

          {/* Results state */}
          {/* Results state */}
{scanResults && (
  <div>
    <FlowDiagram
      results={scanResults.results}
      isScanning={false}
    />
    <ScoreCard
      overallScore={scanResults.overall_score}
      totalAttacks={scanResults.total_attacks}
      successfulAttacks={scanResults.successful_attacks}
    />
    <CategoryHeatmap
      categoryScores={scanResults.category_scores}
    />
    <AIAnalysis
      aiAnalysis={scanResults.ai_analysis}
    />
    <AttackResults
      results={scanResults.results}
    />
  </div>
)}

        </main>
      </div>
    </div>
  )
}

export default App