import { Upload, Database } from 'lucide-react';
import { GalaxyBackground } from './components/GalaxyBackground';
import { UploadOverlay } from './components/UploadOverlay';
import { CosmicStatistics } from './components/CosmicStatistics';
import { CosmicTable } from './components/CosmicTable';
import { CosmicVisualization } from './components/CosmicVisualization';
import { SignInOverlay } from './components/SignInOverlay';
import { CosmicTitle3D } from './components/CosmicTitle3D';
import { PresenceCursors } from './components/PresenceCursors';
import { useCollaboration } from './hooks/useCollaboration';
import { useState } from 'react';
import { Plus, Settings as SettingsIcon, History as HistoryIcon } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CommunityForum } from './components/community/CommunityForum';
import { QualityActivityFeed } from './components/QualityActivityFeed';

function App() {
  const [showUpload, setShowUpload] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [dataset, setDataset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Collaboration Hook
  const { cursors, activeUsers, sendCursorMove } = useCollaboration(user);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!user) return;
    // Normalize coordinates (0-1)
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    sendCursorMove(x, y);
  };

  const handleUploadComplete = (data: any) => {
    setDataset(data);
    setShowUpload(false);
    // TODO: Scroll to visualization section
  };

  // --- RENDER GUEST VIEW ---
  if (!user) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden font-sans">
        <GalaxyBackground />

        {/* Navigation (Simple) */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 h-20 flex items-center justify-between bg-cosmic-900/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-accent-cyan" />
            <span className="text-xl font-bold tracking-wider">COSMIC</span>
          </div>
          <button
            onClick={() => setShowSignIn(true)}
            className="px-6 py-2 bg-accent-blue hover:bg-accent-blue/90 rounded-full transition-all font-bold text-sm"
          >
            Sign In to Start
          </button>
        </nav>

        {/* Hero */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="mb-4 w-full max-w-4xl">
            <CosmicTitle3D />
          </div>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Unifying astronomical data across the universe. <br />
            Secure your research in a personalized workspace.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all font-bold text-lg backdrop-blur-md"
          >
            Get Started
          </button>
        </main>

        {showSignIn && (
          <SignInOverlay
            onClose={() => setShowSignIn(false)}
            onSignIn={(username) => setUser(username)}
          />
        )}
      </div>
    );
  }

  // --- RENDER AUTHENTICATED VIEW ---
  return (
    <div
      className="relative min-h-screen bg-cosmic-900 text-white font-sans flex"
      onMouseMove={handleMouseMove}
    >
      <PresenceCursors cursors={cursors} />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={() => { setUser(null); setDataset(null); }}
      />

      <main className={`flex-1 transition-all duration-300 ${dataset ? 'ml-0' : 'ml-0'} pl-64`}>
        {/* Top Header for Dashboard */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
            <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 ml-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-green-400 font-bold uppercase">{activeUsers.length} Nodes Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 rounded-lg text-sm font-bold transition-all shadow-lg shadow-accent-blue/20"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!dataset ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                  <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-xl">
                    <Upload className="w-10 h-10 text-accent-blue opacity-50" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No active datasets</h2>
                  <p className="text-slate-400 mb-8 max-w-sm text-center">
                    Upload a FITS, HDF5, or CSV file to start your cosmic analysis.
                  </p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
                  >
                    Ingest Your First Data
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* New Cosmic Statistics Row */}
                  <CosmicStatistics dataset={dataset} />

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Preview Table & Quality Feed Column */}
                    <div className="lg:col-span-1 space-y-8">
                      <CosmicTable data={dataset.preview} />
                      <QualityActivityFeed />
                    </div>

                    {/* Main Visualization Column */}
                    <div className="lg:col-span-3">
                      <CosmicVisualization dataset={dataset} user={user || 'Explorer'} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'forum' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CommunityForum user={user || 'Guest'} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-500">
              <HistoryIcon className="w-16 h-16 text-accent-cyan mb-6 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Observation History</h2>
              <p className="text-slate-400">Your previous analyses will be archived here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-slate-400" />
                Workspace Settings
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold">Unit Preferences</p>
                    <p className="text-sm text-slate-400">Default coordinate system and physical units.</p>
                  </div>
                  <select className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none">
                    <option>ICRS / J2000</option>
                    <option>Galactic</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showUpload && (
        <UploadOverlay
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default App;
