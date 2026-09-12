# 🌐 PolyglotVault: Autonomous AI-Adjudicated Subtitle & Localization Escrow on GenLayer

> **"PolyglotVault eliminates centralized localization gatekeepers by running multi-agent linguistic, timing, and canary-defended adjudication directly inside GenLayer consensus."**

[![GenLayer](https://img.shields.io/badge/GenLayer-Studionet-6366f1.svg)](https://studio.genlayer.com)
[![Milestone](https://img.shields.io/badge/Milestone-v1.1.0--Active-a855f7.svg)](CHANGELOG.md)
[![Live dApp](https://img.shields.io/badge/Live_dApp-Vercel-emerald.svg)](https://polyglot-vault-genlayer.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-PolyglotVault-100000?logo=github&logoColor=white)](https://github.com/tuannguyen1995/polyglot-vault-genlayer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🔗 Live Deployments & Documentation

- **Live Production dApp**: [https://polyglot-vault-genlayer.vercel.app](https://polyglot-vault-genlayer.vercel.app)
- **Deployed Intelligent Contract (Studionet)**: [`0x3544D7d49B35c5c9aAB542CFeBF8F1E9589e5a92`](https://genlayer-explorer.vercel.app/address/0x3544D7d49B35c5c9aAB542CFeBF8F1E9589e5a92)
- **GenLayer Explorer Link**: [https://genlayer-explorer.vercel.app/address/0x3544D7d49B35c5c9aAB542CFeBF8F1E9589e5a92](https://genlayer-explorer.vercel.app/address/0x3544D7d49B35c5c9aAB542CFeBF8F1E9589e5a92)
- **GitHub Repository**: [https://github.com/tuannguyen1995/polyglot-vault-genlayer](https://github.com/tuannguyen1995/polyglot-vault-genlayer)
- **Changelog & Milestones**: [CHANGELOG.md](CHANGELOG.md)
- **Security Policy & Threat Model**: [SECURITY.md](SECURITY.md)
- **System Architecture & Mermaid Diagrams**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🚀 Milestone 1 Upgrade Highlights (v1.1.0)

PolyglotVault has been upgraded for **GenLayer Builder Program Milestone 1** with comprehensive AI consensus hardening and security improvements:

1. **Canary Prompt Injection Defense**:
   - Injected deterministic Canary Token (`POLYGLOT_SEC_CANARY_8912`) into validator prompt envelopes.
   - Active defense instructions flag adversarial prompt override attempts as `[PROMPT_INJECTION_DETECTED]`, triggering an immediate `REFUND` to safeguard creator escrow.
2. **3-Pillar Multi-Perspective Adjudication**:
   - Consensus leaders and validators evaluate across 3 independent linguistic dimensions:
     - **Pillar 1 (Semantic Nuance)**: Idiomatic fidelity, tone consistency, humor/culinary expressions.
     - **Pillar 2 (Timing Synchronization)**: Sequential SRT timestamps and reading velocity (<= 21 cps).
     - **Pillar 3 (Negative Constraints & Quiz)**: Zero blacklist terms + compliance with specialized film quiz criteria.
3. **Enhanced Platform Metadata View**:
   - Added `@gl.public.view def get_platform_info()` exposing real-time versioning, protocol statistics, and active security hardening profiles.
4. **Expanded 11-Test Unit Test Suite**:
   - Comprehensive unit test suite covering prompt injection detection, deadline expiration slashing, 24-hour dispute freezing, and voluntary publisher release.
5. **Interactive Reviewer Tools**:
   - Integrated one-click sample test buttons (`⚡ Clean Subtitle` vs `⚠️ Adversarial Injection`) directly in the Translation Studio for rapid verification.

---

## 📌 Project Overview & Key Value Proposition

**PolyglotVault** is a decentralized, AI-adjudicated subtitle and video localization escrow platform built natively on **GenLayer**. It enables content creators and global publishers to lock escrow bounties for multi-language video localization, while GenLayer's on-chain AI consensus autonomously parses source video transcripts against submitted `.srt` / `.vtt` subtitle files to settle payouts, enforce quality guidelines, or slash malicious spam without human intermediaries.

### 🌟 GenLayer Fit (Why GenLayer is Required)

1. **Subjective Consensus on Complex Media**: Evaluating whether a translated subtitle captures cultural nuance, humor, culinary tone, or timing constraints while avoiding blacklisted terms is inherently non-deterministic—impossible on standard EVM.
2. **On-Chain Web Rendering (`gl.nondet.web.render`)**: Reads raw media transcripts and subtitle files directly on-chain without centralized oracles.
3. **Two-Way Anti-Tamper & 404 Safeguards**:
   - If the publisher's media link dies or returns 404, escrow automatically moves to `ESCALATED` to prevent rug-pulling the translator.
   - If the submitted subtitle link is dead/404, the claim is rejected (`REFUND`) to protect the publisher.
4. **Game-Theoretic Stake & Slashing (20%)**: Translators must stake at least 20% of the bounty value to accept a task. Two consecutive failed submissions result in full slashing of the stake to the publisher.
5. **24-Hour Cooling-Off Window**: Payout finalization enforces a mandatory 24-hour dispute delay calculated from trusted on-chain execution context (`gl.message_raw`).

---

## 📁 Repository Structure

```
polyglot-vault-genlayer/
├── contracts/
│   └── PolyglotVault.py         # Intelligent Contract (GenVM v0.2.19)
├── tests/
│   └── test_polyglot_vault.py   # 11-Test adversarial unit & consensus test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Studio navigation & Milestone v1.1 indicator
│   │   │   ├── StatsBar.jsx     # Escrow TVL & game-theoretic metrics
│   │   │   ├── BountyExplorer.jsx # Filterable task list & cards
│   │   │   ├── CreateTaskModal.jsx# Publisher bounty creation + presets
│   │   │   ├── TaskStudioModal.jsx# Dual-pane live preview + Multi-Pillar HUD
│   │   │   └── ConsensusFeed.jsx# GenVM verification visualizer
│   │   ├── services/
│   │   │   └── contractService.js# Studionet contract RPC client & state
│   │   ├── utils/
│   │   │   └── srtParser.js     # SRT/VTT parser & timestamp engine
│   │   ├── App.jsx              # Main application hub
│   │   └── index.css            # Dark Studio styling (#0f172a theme)
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── CHANGELOG.md                 # SemVer release history & milestone tracking
├── SECURITY.md                  # Threat model & canary injection specifications
├── ARCHITECTURE.md              # Mermaid architecture diagrams & state machine
└── README.md
```

---

## 🧪 Adversarial Test Suite

PolyglotVault includes 11 comprehensive automated unit tests covering game-theoretic edge cases and prompt injection attacks:

```bash
# Run the test suite
python tests/test_polyglot_vault.py
```

### Verified Test Cases:
1. `test_01_under_staking_reverts`: Translators staking < 20% are rejected.
2. `test_02_cooling_off_blocks_early_payout`: Enforces 24-hour payout delay before finalization.
3. `test_03_double_failure_slashes_stake`: Slashes 20% collateral on 2 consecutive failed submissions.
4. `test_04_anti_tampering_404_escalates`: Missing/404 source media URL forces `ESCALATED` to protect translator.
5. `test_05_partial_verdict_splits_payout`: `PARTIAL` verdict splits escrow 50/50 while returning stake.
6. `test_06_unauthorized_actions_revert`: Prevents non-assigned callers from submitting subtitles.
7. `test_07_prompt_injection_canary_defense`: Detects prompt injection attempts and flags `[PROMPT_INJECTION_DETECTED]`.
8. `test_08_raise_dispute_blocks_finalization`: Dispute during cooling-off transitions task to `DISPUTED` and locks payouts.
9. `test_09_slash_expired_task_enforcement`: Publisher can slash abandoned tasks after 48h deadline expires.
10. `test_10_voluntary_arbitration_release`: Publisher can voluntarily disburse funds in `DISPUTED` status.
11. `test_11_get_platform_info_view`: Verifies protocol metadata and milestone version `v1.1.0-milestone1`.

---

## 🛠️ Step-by-Step Deployment Guide (Studionet)

### 1. Deploy Contract via GenLayer Studio
1. Open [GenLayer Studio](https://studio.genlayer.com/contracts).
2. Create a new contract file `PolyglotVault.py` and paste `contracts/PolyglotVault.py`.
3. Select **Studionet** as the network in the Run & Debug tab.
4. Click **Deploy**. Copy the deployed contract address.

### 2. Configure & Run Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_CONTRACT_ADDRESS=<your_deployed_contract_address>
npm install
npm run dev
```

---

## 📜 License
MIT © 2026 PolyglotVault Team
