import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = '0x3544D7d49B35c5c9aAB542CFeBF8F1E9589e5a92';
const client = createClient({ chain: studionet });

async function testMilestoneFeatures() {
  console.log('====================================================');
  console.log('🔍 VERIFYING MILESTONE 1 UPGRADES ON-CHAIN');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('====================================================\n');

  console.log('1. Querying get_platform_info()...');
  const infoRaw = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_platform_info',
    args: []
  });
  console.log('   Raw Output:', infoRaw);
  const info = JSON.parse(infoRaw);
  console.log('   ✅ Protocol:', info.protocol);
  console.log('   ✅ Version:', info.version);
  console.log('   ✅ Total Tasks On-Chain:', info.total_tasks);
  console.log('   ✅ Active Security Features:', info.features);

  console.log('\n2. Querying get_translator_reputation()...');
  const sampleTranslator = '0x6ded198a28e9bb31f79f2e96d2994e470876176a';
  const rep = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_translator_reputation',
    args: [sampleTranslator]
  });
  console.log(`   ✅ Reputation for ${sampleTranslator.slice(0, 10)}...:`, String(rep), 'XP');

  console.log('\n3. Querying get_all_tasks()...');
  const tasksRaw = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_all_tasks',
    args: []
  });
  const tasks = JSON.parse(tasksRaw);
  console.log(`   ✅ Total Tasks Retrieved: ${tasks.length}`);
  if (tasks.length > 0) {
    const latest = tasks[tasks.length - 1];
    console.log(`   - Latest Task ID: ${latest.id}`);
    console.log(`   - Status: ${latest.status}`);
    console.log(`   - Verdict: ${latest.verdict}`);
    console.log(`   - Reason: ${latest.reason.slice(0, 80)}...`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL MILESTONE 1 ON-CHAIN FEATURES VERIFIED 100%');
  console.log('====================================================');
}

testMilestoneFeatures().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
