export interface VerifiedFreelancerProfile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  targetHourlyRateUsd: number;
  targetHourlyRateInr: number;
  minProjectBudgetUsd: number;
  weeklyCapacityHours: number;
  skills: string[];
  preferredLocations: string[];
  remoteOpen: boolean;
  immediateAvailability: boolean;
  portfolioLinks: string[];
  customPitchIntro?: string;
}

export const VERIFIED_FREELANCER_PROFILE: VerifiedFreelancerProfile = {
  id: 'default',
  fullName: 'Dhruv Parasher',
  headline: 'Senior Full Stack / MERN Software Engineer',
  bio: 'Senior Full Stack Engineer with 4 years of verified hands-on experience designing and building scalable web applications. Core strengths include React, Next.js, Node.js, NestJS, TypeScript, MongoDB, PostgreSQL, and GraphQL. Available immediately for India-based and remote international freelance projects.',
  yearsExperience: 4,
  targetHourlyRateUsd: 45,
  targetHourlyRateInr: 3500,
  minProjectBudgetUsd: 500,
  weeklyCapacityHours: 40,
  skills: [
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'NestJS',
    'Express',
    'MongoDB',
    'PostgreSQL',
    'GraphQL',
    'Tailwind CSS',
    'REST APIs',
    'Docker',
  ],
  preferredLocations: ['India', 'Remote Worldwide'],
  remoteOpen: true,
  immediateAvailability: true,
  portfolioLinks: [
    'https://github.com/parasherdhruv',
  ],
  customPitchIntro: 'Hi, I am a Full Stack Engineer with 4 years of hands-on experience specializing in the MERN stack, Next.js, and NestJS. I build reliable, production-ready systems and can start immediately.',
};
