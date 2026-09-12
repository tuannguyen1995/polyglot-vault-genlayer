# 📜 PolyglotVault Changelog

All notable changes to the **PolyglotVault** protocol and dApp will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-12 (Milestone 1: AI Consensus Hardening & Security Pack)

### 🚀 Major Feature & AI Enhancements (GenLayer Milestone 1)
- **Canary Prompt Injection Defense**: Implemented cryptographic-style Canary token verification (`POLYGLOT_SEC_CANARY_8912`) and adversarial defense instructions in `PolyglotVault.py` to neutralize prompt injection attacks targeting GenVM validators.
- **3-Pillar Multi-Perspective Adjudication**: Upgraded consensus prompt to evaluate 3 independent linguistic dimensions:
  1. *Semantic & Cultural Nuance* (idiomatic localization, character tone fidelity).
  2. *Chronological Timing & Pacing* (SRT timestamp monotonicity, speech-to-text velocity <= 21 cps).
  3. *Constraint & Quiz Compliance* (strict zero-tolerance blacklist words + custom film quiz validation).
- **Consensus Invariant Verification**: `validator_fn` now validates both verdict equality and prompt injection consensus between leader and validator nodes.
- **Platform Metadata Inspection**: Added `@gl.public.view def get_platform_info()` providing protocol version, total tasks, and active security hardening profiles.
- **Backward-Compatible Alias**: Added `submit_subtitles` alias for `submit_deliverable` ensuring complete compatibility across testing suites and external integrations.

### 🛡️ Security & Architecture Hardening
- **Threat Model Specification**: Published comprehensive `SECURITY.md` documenting attack vectors (jailbreak, Sybil staking, timestamp frontrunning, 404 dead link manipulation).
- **System Architecture Blueprint**: Published `ARCHITECTURE.md` featuring 3 Mermaid diagrams:
  - System Component Context
  - GenLayer Optimistic Democracy Consensus Pipeline
  - Complete Task Lifecycle State Machine
- **Adversarial Unit Test Suite**: Expanded Python unit tests from 6 to 11 comprehensive tests in `tests/test_polyglot_vault.py` covering prompt injection detection, deadline slashing, and dispute transitions.

### 🖥️ Frontend & UX Overhaul
- **Multi-Pillar Visual Breakdown**: Added visual consensus breakdown cards displaying Semantic Nuance, Timing Pacing, and Quiz Compliance meters.
- **Canary Integrity Badge**: Added live on-chain canary verification indicator in the Task Studio HUD.
- **One-Click Reviewer Testing**: Added sample payload loader ("Clean Subtitle" vs "Adversarial Injection Payload") to allow stewards and reviewers to test AI consensus instantly.
- **Milestone v1.1 Active Indicator**: Integrated version badge into navigation header.

---

## [1.0.0] - 2026-08-21 (Initial Accepted Release)

### Added
- **Intelligent Contract Core**: Initial deployment on GenLayer Studionet (`0x07509a821D981379Ba57e10551AF2FDc3cb7ee7f`).
- **Trustless Escrow & Staking**: Creators deposit GEN bounties; translators lock 20% collateral.
- **On-Chain Web Rendering**: Native transcript retrieval via `gl.nondet.web.render`.
- **48-Hour Deadline Counter**: Enforced delivery timeline with automated `slash_expired_task`.
- **24-Hour Cooling-Off Window**: Payout finalization delay with `raise_dispute` transition to `DISPUTED`.
- **Arbitration Mechanism**: Role-based dispute settlement (`RELEASE`, `REFUND`, `SPLIT`).
- **Interactive Studio UI**: React + Tailwind + Vite dApp with real-time MetaMask connection on GenLayer Studionet.
