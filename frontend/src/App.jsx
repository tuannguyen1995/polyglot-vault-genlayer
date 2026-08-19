import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { BountyExplorer } from './components/BountyExplorer';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskStudioModal } from './components/TaskStudioModal';
import { contractService, ensureGenLayerNetwork } from './services/contractService';
import { Cpu, ShieldCheck, Sparkles, Terminal, CheckCircle2, Lock } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="p-8 rounded-2xl glass-panel border border-cyber-pink/30 max-w-lg space-y-4">
            <h2 className="text-xl font-bold text-cyber-pink">System Display Recovered</h2>
            <p className="text-xs text-slate-300 bg-black/60 p-4 rounded-xl border border-white/10 text-left overflow-auto max-h-40">
              {String(this.state.error?.message || this.state.error)}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-2.5 rounded-full bg-cyber-blue text-black font-bold text-xs hover:bg-white transition"
            >
              Reload dApp
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await ensureGenLayerNetwork();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0].toLowerCase());
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please install a Web3 wallet like MetaMask.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  const refreshTasks = async () => {
    const fetchedTasks = await contractService.getTasks();
    setTasks(fetchedTasks);
    if (selectedTask) {
      const updated = fetchedTasks.find(t => t.id === selectedTask.id);
      setSelectedTask(updated || null);
    }
  };

  useEffect(() => {
    refreshTasks();

    // Check if wallet was already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].toLowerCase());
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].toLowerCase());
        } else {
          setWalletAddress(null);
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const handleCreateTask = async (taskData) => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    const newTask = await contractService.createTask({
      ...taskData,
      senderAddress: walletAddress
    });
    refreshTasks();
    setSelectedTask(newTask);
  };

  const handleUpdateTask = (updatedTask) => {
    refreshTasks();
    setSelectedTask(updatedTask);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden bg-grid-pattern-lg">
      
      {/* Ambient Animated Background Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-cyber-purple/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute top-40 -right-40 w-96 h-96 bg-cyber-blue/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-cyber-pink/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>

      <Navbar
        walletAddress={walletAddress}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        onOpenCreateModal={() => {
          if (!walletAddress) alert("Please connect wallet first.");
          else setIsCreateOpen(true);
        }}
      />

      {/* Main Content (padded for floating nav) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 flex-1 w-full space-y-8 relative z-10">
        
        {/* Cyber Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] glass-panel p-8 md:p-12 cyber-border">
          <div className="max-w-4xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyber-blue text-xs font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Decentralized AI Adjudication Protocol</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] glow-text">
              Video Localization Escrow <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink">
                Secured by Consensus
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed font-sans max-w-2xl">
              Eliminate centralized gatekeepers. PolyglotVault runs multi-agent linguistic and timing adjudication directly inside GenLayer's non-deterministic execution environment.
            </p>

            <div className="pt-4 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-wider">
              <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyber-blue" />
                <span>On-Chain Web Rendering</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyber-green" />
                <span>20% Slashing Defense</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyber-purple" />
                <span>24H Cooling-Off Window</span>
              </div>
            </div>
          </div>
        </section>

        <StatsBar tasks={tasks} />

        <BountyExplorer
          tasks={tasks}
          onSelectTask={(task) => setSelectedTask(task)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />

        {/* Blueprint Footer */}
        <section className="p-6 rounded-2xl glass-panel text-xs font-mono space-y-4 cyber-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyber-purple/5 pointer-events-none"></div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-white">
              <Terminal className="w-4 h-4 text-cyber-blue" />
              <span className="font-bold uppercase tracking-widest">System Architecture</span>
            </div>
            <span className="text-cyber-green font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,102,0.2)] px-2 py-0.5 rounded-full bg-cyber-green/10 border border-cyber-green/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Studionet Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 relative z-10">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyber-blue/30 transition-colors">
              <span className="text-cyber-blue font-bold block mb-1">01. Intelligent Contract</span>
              <p className="leading-relaxed">GenLayer smart contracts execute LLM evaluations and web renders natively without centralized oracles.</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyber-green/30 transition-colors">
              <span className="text-cyber-green font-bold block mb-1">02. 404 Safeguards</span>
              <p className="leading-relaxed">Dead media links trigger <code className="text-white">ESCALATE</code>. Dead subtitle payloads trigger <code className="text-white">REFUND</code>. Full 2-way protection.</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyber-purple/30 transition-colors">
              <span className="text-cyber-purple font-bold block mb-1">03. Game Theory</span>
              <p className="leading-relaxed">Translators stake 20% collateral. Repeated spam or machine-translation hallucinations trigger slashing.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/60 backdrop-blur-md py-6 text-center text-xs font-mono text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PolyglotVault</span>
            <span className="text-white/20">|</span>
            <span>GenLayer Studionet</span>
          </div>
          <div>Autonomous Adjudication Engine</div>
        </div>
      </footer>

      {isCreateOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskStudioModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          walletAddress={walletAddress}
          onUpdateTask={handleUpdateTask}
          contractService={contractService}
        />
      )}
    </div>
  );
}
