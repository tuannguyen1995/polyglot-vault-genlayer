import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, FileText, ArrowRight, 
  Send, DollarSign, ExternalLink, Cpu, Check, AlertCircle, Scan
} from 'lucide-react';
import { parseSubtitle } from '../utils/srtParser';
import { ConsensusFeed } from './ConsensusFeed';
import { formatGenAmount } from '../services/contractService';

export function TaskStudioModal({ task, onClose, walletAddress, onUpdateTask, contractService }) {
  if (!task) return null;
  const currentRole = walletAddress === '0xadmin' ? 'admin' : (walletAddress === task.publisher ? 'publisher' : 'translator');

  const [activeTab, setActiveTab] = useState('studio');
  const [subtitleInput, setSubtitleInput] = useState(task.sample_subtitles || '');
  const [subtitleUrlInput, setSubtitleUrlInput] = useState(task.subtitle_url || 'https://storage.polyglotvault.io/subs/translated.srt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consensusSteps, setConsensusSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const parsedCues = parseSubtitle(subtitleInput || task.sample_subtitles);
  const displayEscrow = formatGenAmount(task.escrow_amount);
  const rawEscrowNum = Number(displayEscrow.replace(/,/g, '')) || 0;
  const minStake = Math.floor(rawEscrowNum * 0.2);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">OPEN FOR STAKING</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">IN PROGRESS</span>;
      case 'AWAITING_PAYOUT':
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyber-green/10 text-cyber-green border border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,102,0.2)]">AWAITING PAYOUT (24H)</span>;
      case 'NEEDS_REVISION':
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">NEEDS REVISION</span>;
      case 'ESCALATED':
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/30 shadow-[0_0_10px_rgba(255,0,85,0.2)]">ESCALATED TO ARBITRATION</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">CLOSED & SETTLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">{status}</span>;
    }
  };

  const handleAcceptTask = async () => {
    setActionError(''); setActionSuccess('');
    if (!walletAddress) return setActionError('Please connect your Web3 wallet first.');
    try {
      setIsProcessing(true);
      const updated = await contractService.acceptTask(task.id, minStake, walletAddress);
      onUpdateTask(updated);
      setActionSuccess(`Successfully deposited ${minStake} GEN (20% stake) on-chain & accepted task!`);
    } catch (err) { setActionError(err.message || 'Transaction failed'); } 
    finally { setIsProcessing(false); }
  };

  const handleSubmitSubtitles = async () => {
    setActionError(''); setActionSuccess('');
    if (!walletAddress) return setActionError('Please connect your Web3 wallet first.');
    if (!subtitleUrlInput.trim().startsWith('http')) return setActionError('Please provide a valid HTTP/HTTPS URL for your .srt deliverable');
    try {
      setIsProcessing(true); setActiveTab('consensus');
      setConsensusSteps([
        { step: 1, name: 'Web Render', desc: 'GenLayer nodes fetching transcript & subtitle via gl.nondet.web.render()', status: 'active' }
      ]);
      setActiveStep(1);

      // Call real on-chain transaction
      const updated = await contractService.submitDeliverable(task.id, subtitleUrlInput.trim(), walletAddress);
      
      setConsensusSteps([
        { step: 1, name: 'Web Render', desc: 'Fetched media transcript & SRT directly on-chain', status: 'done' },
        { step: 2, name: 'LLM Adjudication', desc: 'GenLayer Leader evaluated timing, nuance & blacklist rules', status: 'done' },
        { step: 3, name: 'Consensus Agreement', desc: 'GenLayer Validators confirmed leader verdict', status: 'done' },
        { step: 4, name: 'On-Chain Settlement', desc: `State updated to ${updated?.status || 'AWAITING_PAYOUT'} on Studionet`, status: 'done' }
      ]);
      setActiveStep(4);
      onUpdateTask(updated);
      setActionSuccess(`On-Chain Consensus Complete! Verdict: ${updated?.verdict || 'APPROVED'} (Confidence: ${updated?.confidence || 100}%)`);
    } catch (err) { setActionError(err.message || 'On-chain consensus submission failed'); } 
    finally { setIsProcessing(false); }
  };

  const handleFinalizePayout = async () => {
    setActionError(''); setActionSuccess('');
    if (!walletAddress) return setActionError('Please connect your Web3 wallet first.');
    try {
      setIsProcessing(true);
      const updated = await contractService.finalizePayout(task.id, walletAddress);
      onUpdateTask(updated);
      setActionSuccess('Vault payout successfully disbursed on-chain to translator!');
    } catch (err) { setActionError(err.message || 'Payout finalization failed'); } 
    finally { setIsProcessing(false); }
  };

  const handleResolveEscalation = async (action) => {
    setActionError(''); setActionSuccess('');
    if (!walletAddress) return setActionError('Please connect your Web3 wallet first.');
    try {
      setIsProcessing(true);
      const updated = await contractService.resolveEscalation(task.id, action, walletAddress);
      onUpdateTask(updated);
      setActionSuccess(`Arbitration resolved on-chain via ${action}!`);
    } catch (err) { setActionError(err.message || 'Arbitration resolution failed'); } 
    finally { setIsProcessing(false); }
  };

  const isPublisher = Boolean(walletAddress && task.publisher && walletAddress.toLowerCase() === task.publisher.toLowerCase());
  const isAssignedTranslator = Boolean(walletAddress && task.translator && task.translator !== '0x0000000000000000000000000000000000000000' && walletAddress.toLowerCase() === task.translator.toLowerCase());
  const isThirdParty = !isPublisher && !isAssignedTranslator;

  const roleLabel = isPublisher 
    ? 'PUBLISHER (CREATOR)' 
    : isAssignedTranslator 
      ? 'ASSIGNED TRANSLATOR' 
      : 'TRANSLATOR / VISITOR';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="glass-panel w-full max-w-6xl rounded-3xl border border-white/10 cyber-border overflow-hidden my-auto max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center">
              <Scan className="w-5 h-5 text-cyber-purple" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-lg text-white">{task.id}</h3>
                {getStatusBadge(task.status)}
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isPublisher ? 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30' :
                  isAssignedTranslator ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30' :
                  'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  ROLE: {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">TARGET: <span className="text-white font-bold">{task.target_lang}</span></p>
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-black/20 font-mono text-xs">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 border-t border-x ${
              activeTab === 'studio'
                ? 'bg-slate-900 text-white border-white/10 font-bold'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyber-blue" />
            <span>HUD: Live Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('consensus')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 border-t border-x ${
              activeTab === 'consensus'
                ? 'bg-slate-900 text-white border-white/10 font-bold'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyber-purple" />
            <span>GenVM Consensus</span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 border-t border-x ${
              activeTab === 'guidelines'
                ? 'bg-slate-900 text-white border-white/10 font-bold'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyber-pink" />
            <span>Directives</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {actionError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}
          {actionSuccess && (
            <div className="p-4 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* TAB 1: STUDIO */}
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Pane */}
              <div className="bg-black/40 rounded-2xl border border-white/5 p-5 flex flex-col h-[450px] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Source Transcript
                  </span>
                  <a href={task.media_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-cyber-blue hover:text-white flex items-center gap-1 transition-colors bg-cyber-blue/10 px-2 py-0.5 rounded border border-cyber-blue/20">
                    gl.nondet.web.render <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="bg-slate-950/80 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-y-auto flex-1 border border-black shadow-inner whitespace-pre-wrap leading-relaxed relative">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                  {task.source_transcript_preview || '(No source preview)'}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center justify-between uppercase tracking-widest">
                  <span>Pub: <span className="text-slate-300">{task.publisher.substring(0,12)}...</span></span>
                  <span className="text-white font-bold bg-white/5 px-2 py-1 rounded border border-white/10">Reward: {displayEscrow} GEN</span>
                </div>
              </div>

              {/* Right Pane */}
              <div className="bg-black/40 rounded-2xl border border-white/5 p-5 flex flex-col h-[450px] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-green/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                  <span className="text-[10px] font-mono font-bold text-cyber-green uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse"></span> Subtitle Parser
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyber-green/10 text-[10px] font-mono text-cyber-green border border-cyber-green/20">
                    {parsedCues.length} Cues
                  </span>
                </div>

                {isAssignedTranslator && (task.status === 'IN_PROGRESS' || task.status === 'NEEDS_REVISION') ? (
                  <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    <textarea
                      value={subtitleInput}
                      onChange={(e) => setSubtitleInput(e.target.value)}
                      placeholder="Paste raw .srt format or translation subtitles here..."
                      className="w-full flex-1 bg-slate-950/80 border border-black shadow-inner rounded-xl p-4 text-xs font-mono text-cyber-green/90 focus:outline-none focus:ring-1 focus:ring-cyber-green/50 resize-none leading-relaxed"
                    />
                    <input
                      type="text"
                      value={subtitleUrlInput}
                      onChange={(e) => setSubtitleUrlInput(e.target.value)}
                      placeholder="Payload URL (e.g. https://storage.com/subs.srt)"
                      className="w-full bg-slate-950/80 border border-black rounded-xl px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyber-green/50"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-950/80 rounded-xl p-3 space-y-2 overflow-y-auto flex-1 border border-black shadow-inner font-mono text-xs">
                    {parsedCues.length > 0 ? (
                      parsedCues.map((cue) => (
                        <div key={cue.id} className="p-3 rounded-lg bg-black/60 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                            <span className="text-cyber-purple font-bold border border-cyber-purple/30 bg-cyber-purple/10 px-1.5 rounded">#{cue.id}</span>
                            <span>{cue.start} &rarr; {cue.end}</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">{cue.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-center py-16 font-mono text-xs space-y-2">
                        <p className="font-bold text-slate-400">NO DELIVERABLE SUBMITTED YET</p>
                        {task.status === 'OPEN' && <p>Awaiting a Translator to lock {minStake} GEN stake and accept.</p>}
                        {task.status === 'IN_PROGRESS' && <p>Assigned Translator ({task.translator.slice(0,8)}...) is working on the subtitles.</p>}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center justify-between uppercase tracking-widest">
                  <span>Trx: <span className="text-slate-300">{task.translator === '0x0000000000000000000000000000000000000000' ? 'None' : task.translator.substring(0,12)+'...'}</span></span>
                  <span className="text-cyber-green font-bold bg-cyber-green/10 px-2 py-1 rounded border border-cyber-green/20">Stake: {minStake} GEN</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONSENSUS */}
          {activeTab === 'consensus' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <ConsensusFeed steps={consensusSteps} activeStepIndex={activeStep} isRunning={isProcessing} />
              {task.verdict !== 'NONE' && (
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Final Adjudication</span>
                    <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest ${
                      task.verdict === 'APPROVED' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,102,0.2)]' :
                      task.verdict === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      task.verdict === 'REFUND' ? 'bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/30 shadow-[0_0_10px_rgba(255,0,85,0.2)]' :
                      'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30 shadow-[0_0_10px_rgba(176,38,255,0.2)]'
                    }`}>
                      {task.verdict} / {task.confidence}% CONF
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-4 rounded-xl border border-black shadow-inner leading-relaxed">
                    &gt; {task.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIRECTIVES */}
          {activeTab === 'guidelines' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue"></div>
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2">Style Directives</h4>
                <p className="text-xs text-white leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-black shadow-inner">
                  {task.guidelines}
                </p>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink"></div>
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2">Blacklist Words</h4>
                <p className="text-xs text-cyber-pink leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-black shadow-inner">
                  {task.blacklist_words}
                </p>
              </div>
            </div>
          )}

          {/* ACTION HUD */}
          <div className="bg-black/60 p-5 rounded-2xl border border-white/10 cyber-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Action Terminal [{walletAddress ? walletAddress.slice(0, 6) : 'DISCONNECTED'}]
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {task.status === 'OPEN' && (
                walletAddress?.toLowerCase() === task.publisher?.toLowerCase() ? (
                  <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                    ⚡ You created this bounty (Publisher). Awaiting a Translator to lock {minStake} GEN stake & accept.
                  </div>
                ) : (
                  <button onClick={handleAcceptTask} disabled={isProcessing} className="px-5 py-3 rounded-xl bg-white text-black hover:bg-slate-200 disabled:opacity-50 text-xs font-display font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <DollarSign className="w-4 h-4" />
                    <span>Lock {minStake} GEN & Accept</span>
                  </button>
                )
              )}

              {(task.status === 'IN_PROGRESS' || task.status === 'NEEDS_REVISION') && (
                isAssignedTranslator ? (
                  <button onClick={handleSubmitSubtitles} disabled={isProcessing} className="px-5 py-3 rounded-xl bg-cyber-purple text-white hover:bg-cyber-purple/90 disabled:opacity-50 text-xs font-display font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(176,38,255,0.3)]">
                    <Send className="w-4 h-4" />
                    <span>Submit Payload & Run Consensus</span>
                  </button>
                ) : isPublisher ? (
                  <div className="px-4 py-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue text-xs font-mono">
                    ⌛ Translation in Progress. Assigned Translator ({task.translator.slice(0, 8)}...) is working on the subtitles.
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                    🔒 Task Assigned. Assigned Translator: {task.translator.slice(0, 8)}...
                  </div>
                )
              )}

              {task.status === 'AWAITING_PAYOUT' && (
                <div className="flex flex-wrap items-center gap-3 w-full">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/30 uppercase tracking-widest flex-1">
                    <Clock className="w-4 h-4" />
                    <span>Cooling-off window active (24h)</span>
                  </div>
                  {(isPublisher || isAssignedTranslator) && (
                    <button onClick={handleFinalizePayout} disabled={isProcessing} className="px-5 py-3 rounded-xl bg-cyber-blue text-black hover:bg-white disabled:opacity-50 text-xs font-display font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                      <DollarSign className="w-4 h-4" />
                      <span>Finalize Vault</span>
                    </button>
                  )}
                </div>
              )}

              {task.status === 'ESCALATED' && (
                <div className="flex flex-wrap items-center gap-3 w-full p-4 rounded-xl bg-cyber-pink/5 border border-cyber-pink/20">
                  <span className="text-[10px] text-cyber-pink font-mono uppercase tracking-widest font-bold">Arbitration:</span>
                  <button onClick={() => handleResolveEscalation('RELEASE')} disabled={isProcessing} className="px-4 py-2 rounded-lg bg-cyber-green/20 text-cyber-green hover:bg-cyber-green text-[10px] hover:text-black font-mono font-bold uppercase transition-colors border border-cyber-green/30">
                    Release to Translator
                  </button>
                  {(task.status === 'ESCALATED' || task.status === 'DISPUTED') && (
                    <>
                      <button onClick={() => handleResolveEscalation('REFUND')} disabled={isProcessing} className="px-4 py-2 rounded-lg bg-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink text-[10px] hover:text-black font-mono font-bold uppercase transition-colors border border-cyber-pink/30">
                        Refund to Pub
                      </button>
                      <button onClick={() => handleResolveEscalation('SPLIT')} disabled={isProcessing} className="px-4 py-2 rounded-lg bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple text-[10px] hover:text-white font-mono font-bold uppercase transition-colors border border-cyber-purple/30">
                        Split 50/50
                      </button>
                    </>
                  )}
                </div>
              )}

              {task.status === 'CLOSED' && (
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  <Check className="w-4 h-4 text-cyber-green" />
                  <span>Vault successfully settled on GenLayer.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
