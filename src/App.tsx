import { GameProvider } from './store/gameState';
import ControlPanel from './components/UI/ControlPanel';
import Dashboard from './components/UI/Dashboard';
import USAMap from './components/Map/USAMap';
import ExportButton from './components/UI/ExportButton';

function App() {
  return (
    <GameProvider>
      <div className="app-shell min-h-screen bg-black text-gray-100 font-sans p-6 selection:bg-indigo-500/30">
        <header className="app-header">
          <div className="app-header-copy">
            <div className="app-kicker">Interactive Climate Foresight Lab</div>
            <h1 className="app-title">The Climate Strategy Hub</h1>
            <p className="app-subtitle">
              A living U.S. simulation for testing whether environmental investment can
              improve health, resilience, and economic outcomes over time.
            </p>
          </div>
          <div className="app-header-meta">
            <div className="app-meta-card">
              <span className="app-meta-label">Temporal Context</span>
              <div className="app-meta-value">April 2026</div>
            </div>
            <a
              className="app-demo-pill"
              href="https://climate-strategy-hub.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              Public Demo
            </a>
          </div>
        </header>

        <main className="app-main">
          <section className="app-stage app-reveal app-reveal-primary">
            <div id="map-container" className="app-map-frame">
              <USAMap />
            </div>
            <div className="app-stage-note">
              Built to make climate tradeoffs easier to see, compare, and remember.
            </div>
          </section>

          <aside className="app-sidebar">
            <div className="app-panel app-panel-immersive app-reveal app-reveal-secondary">
              <ControlPanel />
            </div>
            <div className="app-panel app-panel-soft app-reveal app-reveal-tertiary">
              <Dashboard />
            </div>
            <div className="app-panel app-panel-soft app-reveal app-reveal-quaternary">
              <ExportButton />
            </div>
          </aside>
        </main>
      </div>
    </GameProvider>
  );
}

export default App;
