/**
 * E2E Automation Test Suite for Freelancer Autonomous Agent
 * Tests all API endpoints, data models, scoring algorithms,
 * multi-variant proposal generation, approval lifecycle, and safety guardrails.
 */

const BASE_URL = process.env.API_TEST_URL || 'http://localhost:3000';

type TestReport = {
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
};

const results: TestReport[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, durationMs, details: err.message || String(err) });
    console.error(`  ❌ [FAIL] ${name} (${durationMs}ms): ${err.message || String(err)}`);
  }
}

function expectEqual<T>(actual: T, expected: T, msg: string) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

function expectTruthy(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(msg);
  }
}

async function executeAutomation() {
  console.log('\n======================================================');
  console.log('🤖 FREELANCER AGENT AUTOMATION & INTEGRATION TEST SUITE');
  console.log(`Target Host: ${BASE_URL}`);
  console.log('======================================================\n');

  // 1. Health Check
  await runTest('Server Health Check & Routing', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expectEqual(res.status, 200, 'Health endpoint status');
    const data = await res.json();
    expectEqual(data.status, 'ok', 'Health status field');
    expectTruthy(data.mode.includes('freelancer'), 'Health check mode confirmation');
  });

  // 2. Verified Profile Check
  await runTest('Freelancer Profile - Verified Baseline Data', async () => {
    const res = await fetch(`${BASE_URL}/api/freelancer/profile`);
    expectEqual(res.status, 200, 'Profile status');
    const profile = await res.json();
    expectEqual(profile.fullName, 'Dhruv Parasher', 'Verified name');
    expectEqual(profile.yearsExperience, 4, 'Verified 4 years experience');
    expectTruthy(profile.skills.includes('React'), 'Stack includes React');
    expectTruthy(profile.skills.includes('Next.js'), 'Stack includes Next.js');
    expectTruthy(profile.skills.includes('NestJS'), 'Stack includes NestJS');
    expectTruthy(profile.skills.includes('MongoDB'), 'Stack includes MongoDB');
    expectTruthy(profile.skills.includes('PostgreSQL'), 'Stack includes PostgreSQL');
    expectTruthy(profile.skills.includes('GraphQL'), 'Stack includes GraphQL');
    expectEqual(profile.immediateAvailability, true, 'Immediate availability');
  });

  // 3. Profile Mutation & Persistence
  await runTest('Freelancer Profile - Update & Persistence', async () => {
    const updateRes = await fetch(`${BASE_URL}/api/freelancer/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetHourlyRateUsd: 48,
        customPitchIntro: 'Automated test verified pitch intro.',
      }),
    });
    expectEqual(updateRes.status, 200, 'Update profile status');
    const updated = await updateRes.json();
    expectEqual(updated.targetHourlyRateUsd, 48, 'Updated target hourly rate');

    // Verify it persists on subsequent fetch
    const fetchRes = await fetch(`${BASE_URL}/api/freelancer/profile`);
    const fetched = await fetchRes.json();
    expectEqual(fetched.targetHourlyRateUsd, 48, 'Persisted target hourly rate');

    // Reset back to verified baseline $45/hr
    await fetch(`${BASE_URL}/api/freelancer/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetHourlyRateUsd: 45 }),
    });
  });

  // 4. Scored Matches & Explainability
  let sampleGigId = '';
  await runTest('Gigs Scoring & 5-Dimension Winnability Engine', async () => {
    const res = await fetch(`${BASE_URL}/api/gigs/matches`);
    expectEqual(res.status, 200, 'Matches status');
    const data = await res.json();
    expectTruthy(Array.isArray(data.matches), 'Matches array returned');
    expectTruthy(data.matches.length >= 4, 'At least 4 discovered gigs scored');

    const top = data.matches[0];
    sampleGigId = top.gig.id;

    expectTruthy(top.score >= 0 && top.score <= 100, 'Score is 0-100 clamped');
    expectTruthy(top.breakdown.skillsMatch <= 35, 'Skills breakdown max 35');
    expectTruthy(top.breakdown.budgetFit <= 25, 'Budget breakdown max 25');
    expectTruthy(top.breakdown.clientTrust <= 20, 'Client trust breakdown max 20');
    expectTruthy(top.breakdown.scopeFit <= 10, 'Scope breakdown max 10');
    expectTruthy(top.breakdown.winnability <= 10, 'Winnability breakdown max 10');

    expectTruthy(Array.isArray(top.keyStrengths), 'Key strengths array');
    expectTruthy(Array.isArray(top.riskFactors), 'Risk factors array');
  });

  // 5. Rate Simulation API
  await runTest('Winnability Score Simulator (Simulated Rates)', async () => {
    const baselineRes = await fetch(`${BASE_URL}/api/gigs/matches?simulatedRate=45`);
    const baselineData = await baselineRes.json();
    const baselineTop = baselineData.matches.find((m: any) => m.gig.pricingType === 'HOURLY');

    const highRateRes = await fetch(`${BASE_URL}/api/gigs/matches?simulatedRate=95`);
    const highRateData = await highRateRes.json();
    const highRateTop = highRateData.matches.find((m: any) => m.gig.id === baselineTop.gig.id);

    // If candidate raises rate to $95/hr for a $50/hr job, budget fit score drops
    expectTruthy(
      highRateTop.breakdown.budgetFit <= baselineTop.breakdown.budgetFit,
      'Higher simulated rate yields more conservative budget fit score',
    );
  });

  // 6. Manual Project Intake & Normalization
  let ingestedGigId = '';
  await runTest('Project Intake & Canonical Normalization', async () => {
    const uniqueUrl = `https://automation-test.io/contract/${Date.now()}`;
    const intakeRes = await fetch(`${BASE_URL}/api/gigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Full Stack NestJS & React Contract',
        clientName: 'Automated Client Corp',
        pricingType: 'HOURLY',
        hourlyRateMin: 45,
        hourlyRateMax: 55,
        skills: ['reactjs', 'ts', 'nest.js', 'postgresql'],
        description: 'Build enterprise NestJS and React platform with PostgreSQL data models.',
        sourceUrl: uniqueUrl,
        workMode: 'REMOTE',
      }),
    });
    expectEqual(intakeRes.status, 201, 'Intake status 201 Created');
    const gig = await intakeRes.json();
    ingestedGigId = gig.id;
    expectEqual(gig.title, 'Full Stack NestJS & React Contract', 'Title preserved');
    expectTruthy(gig.skills.includes('React'), 'Canonical skill React');
    expectTruthy(gig.skills.includes('TypeScript'), 'Canonical skill TypeScript');
    expectTruthy(gig.skills.includes('NestJS'), 'Canonical skill NestJS');
    expectTruthy(gig.skills.includes('PostgreSQL'), 'Canonical skill PostgreSQL');

    // 7. Deduplication Test
    const dupRes = await fetch(`${BASE_URL}/api/gigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Full Stack NestJS & React Contract',
        clientName: 'Automated Client Corp',
        sourceUrl: uniqueUrl, // SAME URL
      }),
    });
    const dupGig = await dupRes.json();
    expectEqual(dupGig.id, ingestedGigId, 'Deduplication returned existing record ID without duplicating');
  });

  // 8. Multi-Variant Proposal Generation (Technical)
  let proposalId = '';
  await runTest('Proposal Generator - Technical Strategy & Milestones', async () => {
    const res = await fetch(`${BASE_URL}/api/gigs/${sampleGigId}/proposals/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: 'TECHNICAL' }),
    });
    expectEqual(res.status, 200, 'Proposal generation status');
    const prop = await res.json();
    proposalId = prop.id;

    expectEqual(prop.strategy, 'TECHNICAL', 'Strategy marked TECHNICAL');
    expectEqual(prop.status, 'READY_FOR_REVIEW', 'Safety: Default status is READY_FOR_REVIEW');
    expectTruthy(prop.coverLetter.includes('4 years of verified hands-on experience'), 'Contains verified 4 yrs');
    expectTruthy(prop.coverLetter.includes('MERN stack'), 'Contains MERN stack');
    expectTruthy(prop.coverLetter.includes('Dhruv Parasher'), 'Contains candidate name');
    expectTruthy(prop.coverLetter.includes('Immediate availability'), 'Contains availability');
    expectTruthy(prop.milestones.length >= 3, 'Milestones generated');

    const totalMilestones = prop.milestones.reduce((acc: number, m: any) => acc + m.amount, 0);
    expectTruthy(totalMilestones > 0, 'Milestone amounts sum properly');
  });

  // 9. Multi-Variant Proposal Generation (Rapid Delivery Strategy)
  await runTest('Proposal Generator - Rapid Delivery Strategy', async () => {
    const res = await fetch(`${BASE_URL}/api/gigs/${sampleGigId}/proposals/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: 'RAPID_DELIVERY' }),
    });
    expectEqual(res.status, 200, 'Rapid strategy status');
    const prop = await res.json();
    expectEqual(prop.strategy, 'RAPID_DELIVERY', 'Strategy marked RAPID_DELIVERY');
    expectTruthy(prop.coverLetter.includes('Fast-Track Delivery Plan'), 'Contains fast-track section');
    expectTruthy(prop.coverLetter.includes('Day 1 Kickoff'), 'Contains Day 1 Kickoff milestone');
  });

  // 10. Multi-Variant Proposal Generation (Consulting Strategy)
  await runTest('Proposal Generator - Consulting Strategy', async () => {
    const res = await fetch(`${BASE_URL}/api/gigs/${sampleGigId}/proposals/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: 'CONSULTING' }),
    });
    expectEqual(res.status, 200, 'Consulting strategy status');
    const prop = await res.json();
    expectEqual(prop.strategy, 'CONSULTING', 'Strategy marked CONSULTING');
    expectTruthy(prop.coverLetter.includes('Consulting & Engineering Scope'), 'Contains consulting section');
  });

  // 11. Strict Factual Guardrail Check (No Hallucinations)
  await runTest('Safety & Quality Guardrail - Zero Fake Credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/gigs/proposals`);
    const allProposals = await res.json();
    const bannedPhrases = [
      'Google Senior Staff',
      'Meta Tech Lead',
      '10 years of experience',
      '15 years of experience',
      'Ex-Netflix Architect',
    ];

    for (const p of allProposals) {
      const text = p.coverLetter || '';
      for (const phrase of bannedPhrases) {
        expectTruthy(
          !text.includes(phrase),
          `Proposal does not hallucinate "${phrase}"`,
        );
      }
    }
  });

  // 12. Proposal Approval Lifecycle State Machine
  await runTest('Human-in-the-Loop Proposal Lifecycle & Approval Pipeline', async () => {
    // 12a. Approve proposal
    const approveRes = await fetch(`${BASE_URL}/api/gigs/proposals/${proposalId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    expectEqual(approveRes.status, 200, 'Approve status');
    const approved = await approveRes.json();
    expectEqual(approved.status, 'APPROVED', 'Proposal marked APPROVED');
    expectTruthy(Boolean(approved.approvedAt), 'approvedAt timestamp stamped');

    // 12b. Mark submitted to client
    const submitRes = await fetch(`${BASE_URL}/api/gigs/proposals/${proposalId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUBMITTED' }),
    });
    expectEqual(submitRes.status, 200, 'Submit status');
    const submitted = await submitRes.json();
    expectEqual(submitted.status, 'SUBMITTED', 'Proposal marked SUBMITTED');
    expectTruthy(Boolean(submitted.submittedAt), 'submittedAt timestamp stamped');
  });

  // 13. Proposal Milestone Custom Editing
  await runTest('Proposal Milestone Editing & Rate Re-calculation', async () => {
    const patchRes = await fetch(`${BASE_URL}/api/gigs/proposals/${proposalId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposedRate: 3200,
        milestones: [
          { title: 'Sprint 1: Schema & Foundation', durationDays: 5, amount: 1600 },
          { title: 'Sprint 2: Complete Implementation', durationDays: 7, amount: 1600 },
        ],
      }),
    });
    expectEqual(patchRes.status, 200, 'Milestone patch status');
    const patched = await patchRes.json();
    expectEqual(patched.proposedRate, 3200, 'Rate updated to 3200');
    expectEqual(patched.milestones.length, 2, '2 custom milestones');
    expectEqual(patched.milestones[0].amount + patched.milestones[1].amount, 3200, 'Milestones sum exactly to 3200');
  });

  // 14. Phase 1 Backwards Compatibility
  await runTest('Phase 1 Backwards Compatibility - Employment Jobs', async () => {
    const res = await fetch(`${BASE_URL}/api/jobs/matches`);
    expectEqual(res.status, 200, 'Legacy jobs matches status');
    const data = await res.json();
    expectTruthy(Array.isArray(data.matches), 'Legacy matches array returned');
    expectTruthy(data.matches.length > 0, 'Legacy jobs present');
    expectEqual(data.matches[0].job.title, 'Senior Full Stack / MERN Engineer', 'Sample job title');
  });

  // 15. Vacancy Link Health & Verification
  await runTest('Vacancy Link Health & Reachability Verification', async () => {
    const verifyRes = await fetch(`${BASE_URL}/api/gigs/verify-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://remoteok.com' }),
    });
    expectEqual(verifyRes.status, 200, 'Verify URL endpoint status');
    const verifyData = await verifyRes.json();
    expectEqual(typeof verifyData.isLive, 'boolean', 'isLive boolean present');
    expectEqual(typeof verifyData.statusCode, 'number', 'statusCode number present');
  });

  // 16. Live Remote Project Feeds Sync Engine
  await runTest('Live Remote Project Feeds Discovery & Sync', async () => {
    const syncRes = await fetch(`${BASE_URL}/api/gigs/sync`, { method: 'POST' });
    expectEqual(syncRes.status, 200, 'Sync endpoint status');
    const syncData = await syncRes.json();
    expectEqual(syncData.success, true, 'Sync engine success flag');
    expectEqual(typeof syncData.totalGigs, 'number', 'totalGigs number present');
    expectTruthy(syncData.totalGigs >= 6, 'Total gigs populated');
  });

  // Summary
  console.log('\n======================================================');
  console.log('📊 AUTOMATION SUITE TEST SUMMARY');
  console.log('======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total Scenarios Tested: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

executeAutomation().catch((err) => {
  console.error('Automation runner fatal exception:', err);
  process.exit(1);
});
