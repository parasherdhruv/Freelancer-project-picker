import { Injectable } from '@nestjs/common';
import { VerifiedFreelancerProfile } from '../../freelancer/freelancer.types';
import { GigItem, WinnabilityBreakdown, WinnabilityResult } from '../gigs.types';

@Injectable()
export class GigScoringService {
  private normalize(value: string): string {
    return value.trim().toLowerCase().replace(/[-_.]/g, '');
  }

  calculateWinnability(freelancer: VerifiedFreelancerProfile, gig: GigItem): WinnabilityResult {
    const candidateSkillsNormalized = freelancer.skills.map((s) => this.normalize(s));
    const gigSkillsNormalized = gig.skills.map((s) => this.normalize(s));

    // 1. Skill Overlap (0 - 35 points)
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (let i = 0; i < gig.skills.length; i++) {
      const original = gig.skills[i];
      const norm = gigSkillsNormalized[i];
      const hasMatch = candidateSkillsNormalized.some(
        (cs) => cs.includes(norm) || norm.includes(cs),
      );
      if (hasMatch) {
        matchedSkills.push(original);
      } else {
        missingSkills.push(original);
      }
    }

    let skillsMatch = 15;
    if (gig.skills.length > 0) {
      const ratio = matchedSkills.length / gig.skills.length;
      skillsMatch = Math.round(ratio * 35);
    } else {
      // If gig did not explicitly list skills, detect from description & title
      const text = (gig.title + ' ' + gig.description).toLowerCase();
      let detectedCount = 0;
      for (const skill of freelancer.skills) {
        if (text.includes(skill.toLowerCase())) {
          matchedSkills.push(skill);
          detectedCount++;
        }
      }
      skillsMatch = Math.min(35, 12 + detectedCount * 4);
    }

    // 2. Budget & Compensation Fit (0 - 25 points)
    let budgetFit = 14;
    const keyStrengths: string[] = [];
    const riskFactors: string[] = [];

    if (gig.pricingType === 'HOURLY') {
      const rate = gig.hourlyRateMax ?? gig.hourlyRateMin ?? 0;
      if (rate >= freelancer.targetHourlyRateUsd) {
        budgetFit = 25;
        keyStrengths.push(`Client rate ($${rate}/hr) meets or exceeds your $${freelancer.targetHourlyRateUsd}/hr target.`);
      } else if (rate >= freelancer.targetHourlyRateUsd * 0.8) {
        budgetFit = 19;
        keyStrengths.push(`Client rate ($${rate}/hr) is near target rate ($${freelancer.targetHourlyRateUsd}/hr).`);
      } else if (rate > 0) {
        budgetFit = 9;
        riskFactors.push(`Hourly rate ($${rate}/hr) is below target ($${freelancer.targetHourlyRateUsd}/hr).`);
      } else {
        budgetFit = 12;
      }
    } else {
      // Fixed price or retainer
      const budget = gig.budgetMax ?? gig.budgetMin ?? 0;
      if (budget >= 1500) {
        budgetFit = 25;
        keyStrengths.push(`Generous fixed budget ($${budget}) aligns well with milestone-based delivery.`);
      } else if (budget >= freelancer.minProjectBudgetUsd) {
        budgetFit = 20;
        keyStrengths.push(`Budget ($${budget}) exceeds your $${freelancer.minProjectBudgetUsd} minimum.`);
      } else if (budget > 0) {
        budgetFit = 10;
        riskFactors.push(`Budget ($${budget}) is lower than minimum project threshold.`);
      } else {
        budgetFit = 14;
      }
    }

    // 3. Client Trust & History (0 - 20 points)
    let clientTrust = 0;
    if (gig.paymentVerified) {
      clientTrust += 10;
    } else {
      riskFactors.push('Client payment method is unverified.');
    }

    if (gig.clientRating >= 4.8) {
      clientTrust += 6;
      keyStrengths.push(`Client has stellar ${gig.clientRating.toFixed(1)}/5.0 review history.`);
    } else if (gig.clientRating >= 4.0) {
      clientTrust += 3;
    } else if (gig.clientRating > 0) {
      riskFactors.push(`Client rating (${gig.clientRating.toFixed(1)}/5) is below 4.0.`);
    } else {
      clientTrust += 2; // New client
    }

    if (gig.clientTotalSpent >= 10000) {
      clientTrust += 4;
      keyStrengths.push(`High-spending repeat client ($${Math.round(gig.clientTotalSpent).toLocaleString()} spent).`);
    } else if (gig.clientTotalSpent >= 1000) {
      clientTrust += 2;
    }

    // 4. Scope & Work Mode Fit (0 - 10 points)
    let scopeFit = 0;
    if (gig.workMode === 'REMOTE' && freelancer.remoteOpen) {
      scopeFit += 7;
      keyStrengths.push('Fully remote contract matching your availability.');
    } else if (gig.workMode === 'HYBRID' && freelancer.preferredLocations.some((loc) => gig.clientLocation?.includes(loc))) {
      scopeFit += 6;
    } else {
      scopeFit += 3;
    }

    if (gig.scope === 'MEDIUM' || gig.scope === 'SMALL') {
      scopeFit += 3;
    } else {
      scopeFit += 2;
    }

    // 5. Role Winnability (0 - 10 points)
    const titleLower = gig.title.toLowerCase();
    const coreTerms = ['mern', 'full stack', 'fullstack', 'react', 'next.js', 'nextjs', 'nest', 'nestjs', 'node', 'typescript'];
    const matchedTerms = coreTerms.filter((term) => titleLower.includes(term));
    let winnability = 4;
    if (matchedTerms.length >= 2) {
      winnability = 10;
      keyStrengths.push(`Direct hit on core specialization: ${matchedTerms.join(', ')}.`);
    } else if (matchedTerms.length === 1) {
      winnability = 8;
      keyStrengths.push(`Title matches your primary background in ${matchedTerms[0]}.`);
    }

    const breakdown: WinnabilityBreakdown = {
      skillsMatch: Math.max(0, Math.min(35, skillsMatch)),
      budgetFit: Math.max(0, Math.min(25, budgetFit)),
      clientTrust: Math.max(0, Math.min(20, clientTrust)),
      scopeFit: Math.max(0, Math.min(10, scopeFit)),
      winnability: Math.max(0, Math.min(10, winnability)),
    };

    const score = Math.max(
      0,
      Math.min(
        100,
        breakdown.skillsMatch +
          breakdown.budgetFit +
          breakdown.clientTrust +
          breakdown.scopeFit +
          breakdown.winnability,
      ),
    );

    return {
      score,
      breakdown,
      matchedSkills: [...new Set(matchedSkills)],
      missingSkills: [...new Set(missingSkills)],
      keyStrengths,
      riskFactors,
    };
  }
}
