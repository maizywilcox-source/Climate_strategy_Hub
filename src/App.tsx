import { GameProvider } from './store/gameState';
import ControlPanel from './components/UI/ControlPanel';
import Dashboard from './components/UI/Dashboard';
import USAMap from './components/Map/USAMap';
import ExportButton from './components/UI/ExportButton';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-black text-gray-100 font-sans p-6 selection:bg-indigo-500/30">
        <header className="mb-6 flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              The Climate Strategy Hub
            </h1>
            <p className="text-gray-400 mt-1">USA 2D Atmospheric & Socio-Economic Simulator</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-gray-500">Temporal Context</span>
            <div className="text-xl font-mono text-indigo-300">April 2026</div>
          </div>
        </header>

        <main className="flex gap-6">
          {/* Main Map View */}
          <section className="flex-grow flex flex-col gap-6">
            <div id="map-container" className="rounded-lg shadow-[0_0_40px_rgba(30,27,75,0.4)]">
               <USAMap />
            </div>
            {/* Optional lower auxiliary section if needed */}
          </section>

          {/* Right Sidebar Controls & Dashboard */}
          <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
            <ControlPanel />
            <Dashboard />
            <ExportButton />
          </aside>
        </main>
      </div>
    </GameProvider>
  );
}

export default App;
