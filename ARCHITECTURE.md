# 🏛️ PolyglotVault Architecture Specification

PolyglotVault combines **Intelligent Contracts**, **Non-Deterministic Web Rendering**, and **Optimistic Democracy Multi-Agent Consensus** to establish a trustless decentralized court for digital video and cinematic subtitle localization.

---

## 1. System Component Architecture

```mermaid
graph TB
    subgraph Client Layer
        Creator["Content Creator / KOL (Publisher)"]
        Translator["Linguistic Specialist (Translator)"]
        dApp["PolyglotVault React UI (Vite / genlayer-js)"]
    end

    subgraph GenLayer Studionet
        subgraph PolyglotVault Intelligent Contract
            TaskManager["Task State & Registry"]
            EscrowVault["Escrow & Collateral Vault"]
            DisputeCourt["Arbitration & Dispute Resolver"]
            ConsensusEngine["Leader-Validator Consensus Module"]
        end

        subgraph GenVM Consensus Layer
            LeaderNode["Consensus Leader Node (LLM A)"]
            ValidatorNode["Consensus Validator Node (LLM B)"]
            WebRenderer["gl.nondet.web.render Engine"]
        end
    end

    Creator -->|1. create_task + lock bounty| dApp
    Translator -->|2. accept_task + lock 20% stake| dApp
    Translator -->|3. submit_deliverable| dApp
    dApp -->|genlayer-js RPC| TaskManager

    ConsensusEngine -->|Execute Nondet Block| LeaderNode
    LeaderNode -->|Fetch Web Transcripts| WebRenderer
    ConsensusEngine -->|Run Semantic Verification| ValidatorNode
    ValidatorNode -->|Agreement Check| ConsensusEngine

    ConsensusEngine -->|APPROVED / REFUND / ESCALATE| TaskManager
    TaskManager -->|Finalize Payout| EscrowVault
    Creator -->|Raise Dispute| DisputeCourt
```

---

## 2. Optimistic Democracy Consensus Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Translator
    participant Contract as PolyglotVault Contract
    participant Leader as GenVM Leader Node
    participant Web as gl.nondet.web.render
    participant Validator as GenVM Validator Node
    actor Creator

    Translator->>Contract: submit_deliverable(task_id, subtitle_url)
    Contract->>Leader: run_nondet(leader_fn, validator_fn)
    
    Leader->>Web: render(media_url) -> Transcript text
    Leader->>Web: render(subtitle_url) -> Subtitle payload
    
    Note over Leader: Check Canary Token<br/>Evaluate 3 Pillars:<br/>1. Semantic Nuance<br/>2. Timing Sync<br/>3. Quiz Compliance
    Leader-->>Contract: Proposed Verdict & Reasoning

    Contract->>Validator: validator_fn(leader_res)
    Validator->>Web: Re-render & Evaluate independently
    Note over Validator: Verify Verdict Equality &<br/>Canary Injection Safety
    
    alt Consensus Achieved
        Validator-->>Contract: return True
        Contract->>Contract: Set status = AWAITING_PAYOUT (24h cooling-off)
    else Consensus Disagreement
        Validator-->>Contract: return False
        Contract->>Contract: Escalate to Appeal / Arbitration
    end

    opt Dispute during 24h window
        Creator->>Contract: raise_dispute(task_id, reason)
        Contract->>Contract: Set status = DISPUTED (Finalization blocked)
    end
```

---

## 3. Complete Task State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN: create_task(escrow > 0)
    
    OPEN --> IN_PROGRESS: accept_task (lock 20% stake)
    
    IN_PROGRESS --> CLOSED: slash_expired_task (now > deadline)
    IN_PROGRESS --> AWAITING_PAYOUT: submit_deliverable (verdict = APPROVED / PARTIAL)
    IN_PROGRESS --> NEEDS_REVISION: submit_deliverable (verdict = REFUND, attempt 1)
    IN_PROGRESS --> CLOSED: submit_deliverable (verdict = REFUND, attempt 2 - stake slashed)
    IN_PROGRESS --> ESCALATED: submit_deliverable (404 media / low confidence)
    
    NEEDS_REVISION --> AWAITING_PAYOUT: submit_deliverable v2 (verdict = APPROVED)
    NEEDS_REVISION --> CLOSED: submit_deliverable v2 (verdict = REFUND - stake slashed)
    
    AWAITING_PAYOUT --> CLOSED: finalize_payout (after 24h cooling-off)
    AWAITING_PAYOUT --> DISPUTED: raise_dispute (within 24h window)
    
    DISPUTED --> CLOSED: resolve_escalation (RELEASE / REFUND / SPLIT)
    ESCALATED --> CLOSED: resolve_escalation (RELEASE / REFUND / SPLIT)
```
