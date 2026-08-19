# 🌐 PolyglotVault: Autonomous AI-Adjudicated Subtitle & Localization Escrow on GenLayer

> **"PolyglotVault eliminates centralized localization gatekeepers by running multi-agent linguistic and timing adjudication directly inside GenLayer consensus."**

[![GenLayer](https://img.shields.io/badge/GenLayer-Studionet-6366f1.svg)](https://studio.genlayer.com)
[![Live dApp](https://img.shields.io/badge/Live_dApp-Vercel-emerald.svg)](https://polyglot-vault-genlayer.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-PolyglotVault-100000?logo=github&logoColor=white)](https://github.com/tuannguyen1995/polyglot-vault-genlayer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🔗 Live Deployments & Links

- **Live Production dApp**: [https://polyglot-vault-genlayer.vercel.app](https://polyglot-vault-genlayer.vercel.app)
- **Deployed Intelligent Contract (Studionet)**: [`0xd96a39B15b2bb4E65BF09bf27A53165fEA637114`](https://genlayer-explorer.vercel.app/address/0xd96a39B15b2bb4E65BF09bf27A53165fEA637114)
- **GenLayer Explorer Link**: [https://genlayer-explorer.vercel.app/address/0xd96a39B15b2bb4E65BF09bf27A53165fEA637114](https://genlayer-explorer.vercel.app/address/0xd96a39B15b2bb4E65BF09bf27A53165fEA637114)
- **GitHub Repository**: [https://github.com/tuannguyen1995/polyglot-vault-genlayer](https://github.com/tuannguyen1995/polyglot-vault-genlayer)
- **GenLayer Studio**: [https://studio.genlayer.com](https://studio.genlayer.com)

---

## 📌 Project Overview & Key Value Proposition

**PolyglotVault** is a decentralized, AI-adjudicated subtitle and video localization escrow platform built natively on **GenLayer**. It enables content creators and global publishers to lock escrow bounties for multi-language video localization, while GenLayer's on-chain AI consensus autonomously parses source video transcripts against submitted `.srt` / `.vtt` subtitle files to settle payouts, enforce quality guidelines, or slash malicious spam without human intermediaries.

### 🌟 Key Value Proposition & GenLayer Fit (Score 5 Rubric Alignment)

1. **Subjective Consensus on Complex Media**: Evaluating whether a translated subtitle captures cultural nuance, humor, culinary tone, or timing constraints while avoiding blacklisted terms is inherently non-deterministic—impossible on standard EVM.
2. **On-Chain Web Rendering (`gl.nondet.web.render`)**: Reads raw media transcripts and subtitle files directly on-chain without centralized oracles.
3. **Two-Way Anti-Tamper & 404 Safeguards**:
   - If the publisher's media link dies or returns 404, escrow automatically moves to `ESCALATED` to prevent rug-pulling the translator.
   - If the submitted subtitle link is dead/404, the claim is rejected (`REFUND`) to protect the publisher.
4. **Game-Theoretic Stake & Slashing (20%)**: Translators must stake at least 20% of the bounty value to accept a task. Two consecutive failed submissions result in full slashing of the stake to the publisher.
5. **24-Hour Cooling-Off Window**: Payout finalization enforces a mandatory 24-hour dispute delay calculated from trusted on-chain execution context (`gl.message_raw`).

---

## 🏛️ System Architecture

```
                                +-------------------------------------------+
                                |             Content Publisher             |
                                |     (Locks Bounty + Style Guidelines)     |
                                +---------------------+---------------------+
                                                      |
                                                      v [create_task]
+-------------------------+     [accept_task (20%)]   +---------------------+
|       Translator        | ------------------------> |    PolyglotVault    |
| (Stakes 20% Collateral) | <------------------------ | Intelligent Contract|
+------------+------------+      [Disburse Escrow]    +----------+----------+
             |                                                   |
             | [submit_subtitles]                                |
             +--------------------+                              |
                                  |                              |
                                  v                              v
           +-------------------------------------------------------------+
           |               GenLayer Dual-Agent Consensus                 |
           |                                                             |
           |  [1/4] gl.nondet.web.render (Fetch Transcript & .SRT)       |
           |  [2/4] gl.nondet.exec_prompt (Evaluate Timing & Nuance)     |
           |  [3/4] gl.vm.run_nondet (Leader-Validator Agreement)       |
           |  [4/4] Settlement (APPROVED / REFUND / ESCALATED)           |
           +-------------------------------------------------------------+
```

---

## 📁 Repository Structure

```
polyglot-vault-genlayer/
├── contracts/
│   └── PolyglotVault.py         # Intelligent Contract (GenLayer v0.2.18)
├── tests/
│   └── test_polyglot_vault.py   # Adversarial unit & consensus test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Studio navigation & role switcher
│   │   │   ├── StatsBar.jsx     # Escrow TVL & game-theoretic metrics
│   │   │   ├── BountyExplorer.jsx # Filterable task list & cards
│   │   │   ├── CreateTaskModal.jsx# Publisher bounty creation + presets
│   │   │   ├── TaskStudioModal.jsx# Dual-pane live preview + cue parser
│   │   │   └── ConsensusFeed.jsx# 4-Step GenVM verification visualizer
│   │   ├── services/
│   │   │   └── contractService.js# Studionet contract RPC client & state
│   │   ├── utils/
│   │   │   └── srtParser.js     # SRT/VTT parser & timestamp engine
│   │   ├── App.jsx              # Main application hub
│   │   └── index.css            # Dark Studio styling (#0f172a theme)
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
└── README.md
```

---

## 🧪 Adversarial Test Suite

The test suite covers full adversarial edge cases:
- **Under-staking reverts**: Rejecting accepts with `< 20%` stake.
- **Cooling-off delay**: Enforcing strict 24h delay before `finalize_payout`.
- **Double-failure slashing**: Two consecutive failed submissions slash 20% stake to the publisher.
- **404 Anti-tampering**: Dead media URL automatically forces `ESCALATED` status.
- **Partial settlements**: Splitting bounties on `PARTIAL` verdict.
- **Access control**: Unauthorized callers cannot submit deliverables or finalize early.

Run unit tests:
```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

---

## 🚀 Deployment & Portal Submission Checklist

1. **Deployed Contract**: `0xd96a39B15b2bb4E65BF09bf27A53165fEA637114` on GenLayer `studionet`.
2. **Live Application**: [https://polyglot-vault-genlayer.vercel.app](https://polyglot-vault-genlayer.vercel.app)
3. **Repository Setup**: GitHub repo `polyglot-vault-genlayer` contains contract, test suite, and frontend.
4. **Portal Submission**: Submit via **Portal -> Builders track** (`portal.genlayer.foundation`).
