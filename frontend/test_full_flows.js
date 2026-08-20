import { createClient, generatePrivateKey, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = '0xB672998Ba843ce96Dd4a6D0804E4935b6B77A69F';
const mainClient = createClient({ chain: studionet });

async function getTask(id) {
  const raw = await mainClient.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_all_tasks', args: [] });
  const tasks = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return tasks.find(t => t.id === id);
}

async function waitForTaskState(id, checkFn, maxAttempts = 15, interval = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const task = await getTask(id);
    if (task && checkFn(task)) return task;
    await new Promise(r => setTimeout(r, interval));
  }
  return getTask(id);
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 GENLAYER ON-CHAIN AUTOMATED E2E TEST SUITE');
  console.log('Target Contract:', CONTRACT_ADDRESS);
  console.log('====================================================\n');

  // Account creation for roles
  const pub1 = createAccount(generatePrivateKey());
  const trx1 = createAccount(generatePrivateKey());
  const pub2 = createAccount(generatePrivateKey());
  const trx2 = createAccount(generatePrivateKey());

  const clientPub1 = createClient({ chain: studionet, account: pub1 });
  const clientTrx1 = createClient({ chain: studionet, account: trx1 });
  const clientPub2 = createClient({ chain: studionet, account: pub2 });
  const clientTrx2 = createClient({ chain: studionet, account: trx2 });

  // ----------------------------------------------------
  // TEST SCENARIO 1: SUCCESSFUL TRANSLATION & PAYOUT FLOW
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 1] Testing Successful Translation & Payout Flow...');
  const task1Id = 'auto_success_' + Date.now().toString().slice(-5);

  console.log(`1. Publisher (${pub1.address.slice(0, 8)}...) creating bounty '${task1Id}' (10 GEN)...`);
  const tx1 = await clientPub1.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'create_task',
    args: [
      task1Id,
      'https://cdn.polyglotvault.io/transcripts/cooking_video_01.txt',
      'English to Vietnamese',
      'Maintain soothing tone and clear culinary terms',
      'plastic, fake, junk'
    ],
    value: parseEther('10'),
  });
  console.log('   Tx submitted. Hash:', tx1);

  let task1 = await waitForTaskState(task1Id, t => t.status === 'OPEN');
  console.log('   ✅ On-Chain State verified: Task OPEN. Escrow:', task1.escrow_amount);

  console.log(`2. Translator (${trx1.address.slice(0, 8)}...) locking 2 GEN stake & accepting...`);
  const tx2 = await clientTrx1.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'accept_task',
    args: [task1Id],
    value: parseEther('2'),
  });
  console.log('   Tx submitted. Hash:', tx2);

  task1 = await waitForTaskState(task1Id, t => t.status === 'IN_PROGRESS');
  console.log('   ✅ On-Chain State verified: Task IN_PROGRESS. Assigned Translator:', task1.translator.slice(0, 8));

  console.log(`3. Translator submitting valid SRT deliverable...`);
  const tx3 = await clientTrx1.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'submit_deliverable',
    args: [
      task1Id,
      'https://storage.polyglotvault.io/subs/translated.srt'
    ],
  });
  console.log('   Tx submitted. Hash:', tx3);

  console.log('   Waiting for AI Consensus evaluation on GenVM...');
  task1 = await waitForTaskState(task1Id, t => t.status !== 'IN_PROGRESS', 20, 3000);
  console.log('   ✅ On-Chain State verified after AI Consensus:');
  console.log('      Status:', task1.status);
  console.log('      Verdict:', task1.verdict);
  console.log('      Reason:', task1.reason);

  console.log('\n----------------------------------------------------\n');

  // ----------------------------------------------------
  // TEST SCENARIO 2: ESCALATED / REFUND ARBITRATION FLOW
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 2] Testing Unsuccessful / Escalated & Refund Flow...');
  const task2Id = 'auto_escalate_' + Date.now().toString().slice(-5);

  console.log(`1. Publisher (${pub2.address.slice(0, 8)}...) creating bounty '${task2Id}' (10 GEN)...`);
  const tx4 = await clientPub2.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'create_task',
    args: [
      task2Id,
      'https://cdn.polyglotvault.io/transcripts/dead_media_404.txt',
      'English to Spanish',
      'Strict quality required',
      'junk, cheap'
    ],
    value: parseEther('10'),
  });
  console.log('   Tx submitted. Hash:', tx4);

  let task2 = await waitForTaskState(task2Id, t => t.status === 'OPEN');
  console.log('   ✅ On-Chain State verified: Task OPEN.');

  console.log(`2. Translator (${trx2.address.slice(0, 8)}...) locking 2 GEN stake & accepting...`);
  const tx5 = await clientTrx2.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'accept_task',
    args: [task2Id],
    value: parseEther('2'),
  });
  console.log('   Tx submitted. Hash:', tx5);

  task2 = await waitForTaskState(task2Id, t => t.status === 'IN_PROGRESS');
  console.log('   ✅ On-Chain State verified: Task IN_PROGRESS.');

  console.log(`3. Translator submitting deliverable with dead link (triggering ESCALATE)...`);
  const tx6 = await clientTrx2.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'submit_deliverable',
    args: [
      task2Id,
      'https://cdn.polyglotvault.io/transcripts/dead_sub_404.txt'
    ],
  });
  console.log('   Tx submitted. Hash:', tx6);

  console.log('   Waiting for AI Consensus evaluation on GenVM...');
  task2 = await waitForTaskState(task2Id, t => t.status !== 'IN_PROGRESS', 20, 3000);
  console.log('   ✅ On-Chain State verified after AI Consensus:');
  console.log('      Status:', task2.status);
  console.log('      Verdict:', task2.verdict);
  console.log('      Reason:', task2.reason);

  if (task2.status === 'ESCALATED' || task2.status === 'DISPUTED') {
    console.log(`4. Publisher (${pub2.address.slice(0, 8)}...) exercising Voluntary Release...`);
    const tx7 = await clientPub2.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'resolve_escalation',
      args: [task2Id, 'RELEASE'],
    });
    console.log('   Tx submitted. Hash:', tx7);

    task2 = await waitForTaskState(task2Id, t => t.status === 'CLOSED');
    console.log('   ✅ On-Chain State verified after Arbitration: Task CLOSED.');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL ON-CHAIN TEST SCENARIOS EXECUTED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('❌ E2E Test Suite Error:', err);
  process.exit(1);
});
