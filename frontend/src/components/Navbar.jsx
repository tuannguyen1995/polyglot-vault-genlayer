import React from 'react';
import { Globe, Cpu, Wallet, Layers, RefreshCw } from 'lucide-react';

export function Navbar({ walletAddress, onConnectWallet, onDisconnectWallet, onOpenCreateModal, onResetDemo }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <header className="pointer-events-auto glass-panel rounded-full px-4 sm:px-6 h-16 flex items-center justify-between w-full max-w-7xl cyber-border">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-blue flex items-center justify-center shadow-[0_0_15px_rgba(176,38,255,0.4)]">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-white glow-text hidden sm:block">PolyglotVault</span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/5 text-cyber-blue border border-cyber-blue/20 flex items-center gap-1 uppercase tracking-widest">
              <Cpu className="w-3 h-3 animate-pulse" />
              GenLayer
            </span>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Connect Wallet Button */}
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></div>
                <span className="text-xs font-mono text-slate-300">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={onDisconnectWallet}
                className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-mono transition shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-4 py-1.5 rounded-full bg-cyber-blue/10 border border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] text-xs font-mono transition flex items-center gap-2"
            >
              <Wallet className="w-3.5 h-3.5" />
              Connect Onchain
            </button>
          )}

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-display font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Layers className="w-4 h-4" />
            <span>Create Bounty</span>
          </button>
        </div>
      </header>
    </div>
  );
}
