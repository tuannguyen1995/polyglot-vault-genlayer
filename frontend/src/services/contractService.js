// PolyglotVault Contract Service (Studionet & Live GenLayer State Management)

const STORAGE_KEY = 'polyglot_vault_tasks_v1';

const INITIAL_TASKS = [];

class ContractService {
  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0xPolyglotVaultStudionet123456789abcdef';
    this.network = 'GenLayer Studionet';
    this.loadTasks();
  }

  loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        this.tasks = INITIAL_TASKS;
      }
    } else {
      this.tasks = INITIAL_TASKS;
      this.saveTasks();
    }
  }

  saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  getTasks() {
    this.loadTasks();
    return [...this.tasks];
  }

  getTaskById(id) {
    this.loadTasks();
    return this.tasks.find(t => t.id === id);
  }

  async createTask({ taskId, mediaUrl, targetLang, guidelines, blacklistWords, escrowAmount, senderAddress, sourceTranscript }) {
    this.loadTasks();
    if (this.tasks.some(t => t.id === taskId)) {
      throw new Error('Task ID already exists on-chain');
    }

    const newTask = {
      id: taskId,
      publisher: senderAddress || '0x71c...99a2',
      translator: '0x0000000000000000000000000000000000000000',
      escrow_amount: String(escrowAmount),
      translator_stake: '0',
      status: 'OPEN',
      media_url: mediaUrl,
      subtitle_url: '',
      target_lang: targetLang,
      guidelines: guidelines || 'Standard high-fidelity localization',
      blacklist_words: blacklistWords || 'none',
      verdict: 'NONE',
      reason: 'Awaiting translator acceptance with 20% stake deposit',
      confidence: '0',
      attempts: '0',
      payout_ready_at: '0',
      disputed_at: '0',
      source_transcript_preview: sourceTranscript || `[00:00:00] Source video transcript for ${taskId}\n[00:00:05] Audio content verified on-chain via GenLayer web render.`,
      sample_subtitles: ''
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  async acceptTask(taskId, senderAddress, stakeAmount) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'OPEN') throw new Error('Task is not in OPEN status');

    const minStake = Math.floor(Number(task.escrow_amount) * 0.2);
    if (Number(stakeAmount) < minStake) {
      throw new Error(`Insufficient stake: Minimum 20% required (${minStake} GEN)`);
    }

    task.translator = senderAddress || '0x3f2...88cc';
    task.translator_stake = String(stakeAmount);
    task.status = 'IN_PROGRESS';
    task.reason = 'Translator staked 20% collateral. In progress.';

    this.saveTasks();
    return task;
  }

  async simulateConsensusPipeline(taskId, subtitleUrl, subtitleContent, onStep) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    // [1/4] Web Extraction
    onStep?.({
      step: 1,
      title: 'Web Extraction (gl.nondet.web.render)',
      detail: `Fetching media transcript from ${task.media_url} and subtitle payload from ${subtitleUrl || 'provided SRT'}...`,
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check 404 anti-tamper simulation
    if (task.media_url.includes('404') || task.media_url.includes('dead')) {
      onStep?.({
        step: 1,
        title: 'Web Extraction - 404 Detected',
        detail: 'Publisher media URL returned HTTP 404 Not Found. Halting to safeguard translator stake.',
        status: 'warning'
      });
      task.status = 'ESCALATED';
      task.verdict = 'ESCALATE';
      task.reason = 'Publisher source URL returned 404. Escrow locked for arbitration.';
      task.confidence = '100';
      this.saveTasks();
      return task;
    }

    onStep?.({
      step: 1,
      title: 'Web Extraction - Success',
      detail: 'Media transcript & subtitle cues extracted successfully.',
      status: 'complete'
    });

    // [2/4] Polyglot AI Evaluation
    onStep?.({
      step: 2,
      title: 'Polyglot AI Evaluation (gl.nondet.exec_prompt)',
      detail: `Evaluating translation into [${task.target_lang}] against style guidelines and blacklist terms...`,
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1500));

    const contentLower = (subtitleContent || '').toLowerCase();
    const blacklistedFound = task.blacklist_words
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2 && contentLower.includes(w));

    let verdict = 'APPROVED';
    let confidence = 96;
    let reason = 'High translation fidelity, timing alignment validated, cultural tone preserved.';

    if (blacklistedFound.length > 0) {
      verdict = 'REFUND';
      confidence = 99;
      reason = `Violation: Detected forbidden blacklist terms: "${blacklistedFound.join(', ')}"`;
    } else if (contentLower.includes('hallucination') || contentLower.includes('broken machine')) {
      verdict = 'REFUND';
      confidence = 94;
      reason = 'Poor linguistic fidelity: Machine-translation artifacts & incorrect grammatical phrasing.';
    } else if (contentLower.includes('typo') || contentLower.includes('slight')) {
      verdict = 'PARTIAL';
      confidence = 88;
      reason = 'Minor phrasing discrepancies detected, but output is fully legible and usable.';
    }

    onStep?.({
      step: 2,
      title: 'Polyglot AI Evaluation - Done',
      detail: `Leader Verdict: ${verdict} (Confidence: ${confidence}%)`,
      status: 'complete'
    });

    // [3/4] Validator Consensus
    onStep?.({
      step: 3,
      title: 'Validator Consensus (gl.vm.run_nondet)',
      detail: 'Replicating prompt on validator nodes and computing leader-validator agreement...',
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1200));

    onStep?.({
      step: 3,
      title: 'Validator Consensus - Reached',
      detail: 'Consensus Agreement: 100% agreement on effective verdict.',
      status: 'complete'
    });

    // [4/4] Settlement
    onStep?.({
      step: 4,
      title: 'Settlement & State Transition',
      detail: 'Writing state changes into GenLayer ledger...',
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1000));

    task.subtitle_url = subtitleUrl || 'https://storage.polyglotvault.io/subs/submitted.srt';
    task.sample_subtitles = subtitleContent || task.sample_subtitles;
    task.attempts = String(Number(task.attempts || 0) + 1);
    task.verdict = verdict;
    task.confidence = String(confidence);
    task.reason = reason;

    if (verdict === 'APPROVED' || verdict === 'PARTIAL') {
      task.status = 'AWAITING_PAYOUT';
      // Set cooling off: ready in 24 hours (for demo convenience, we will show remaining time)
      task.payout_ready_at = String(Math.floor(Date.now() / 1000) + 86400);
    } else if (verdict === 'REFUND') {
      if (Number(task.attempts) < 2) {
        task.status = 'NEEDS_REVISION';
      } else {
        // Two consecutive failures -> Slash 20% translator stake to publisher
        task.status = 'CLOSED';
        task.reason = 'Two consecutive evaluation failures. Slashed 20% stake to publisher.';
        task.escrow_amount = '0';
        task.translator_stake = '0';
      }
    } else {
      task.status = 'ESCALATED';
    }

    this.saveTasks();

    onStep?.({
      step: 4,
      title: 'Settlement Finalized',
      detail: `Task status transitioned to [${task.status}].`,
      status: 'complete'
    });

    return task;
  }

  async finalizePayout(taskId, callerAddress) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'AWAITING_PAYOUT') {
      throw new Error('Task is not awaiting payout');
    }

    const now = Math.floor(Date.now() / 1000);
    const readyAt = Number(task.payout_ready_at);
    if (now < readyAt) {
      const remainingHrs = ((readyAt - now) / 3600).toFixed(1);
      throw new Error(`24-hour cooling-off period has not elapsed yet (${remainingHrs} hours remaining)`);
    }

    task.status = 'CLOSED';
    task.escrow_amount = '0';
    task.translator_stake = '0';
    task.reason = `Vault disbursed successfully according to verdict [${task.verdict}].`;

    this.saveTasks();
    return task;
  }

  async resolveEscalation(taskId, action, callerRole) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const act = action.toUpperCase().trim();
    if (callerRole === 'publisher' && act !== 'RELEASE') {
      throw new Error('Publishers can only voluntarily RELEASE funds. Only admin can REFUND or SPLIT.');
    }

    task.status = 'CLOSED';
    task.escrow_amount = '0';
    task.translator_stake = '0';
    task.reason = `Escalation resolved via ${act} by ${callerRole.toUpperCase()}.`;

    this.saveTasks();
    return task;
  }

  // Reset to initial demo dataset
  
}

export const contractService = new ContractService();
