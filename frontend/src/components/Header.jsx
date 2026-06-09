// Header.jsx
// This is the top navigation bar of RedForge
// It shows the logo, tagline, and backend connection status

function Header({ isConnected }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">

        {/* Logo + tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RF</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">
              RedForge
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              LLM Security Testing Platform
            </p>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-gray-400 text-sm">
            {isConnected ? 'Backend connected' : 'Backend offline'}
          </span>
        </div>

      </div>
    </header>
  )
}

export default Header