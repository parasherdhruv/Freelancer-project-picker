import { Injectable, Logger } from '@nestjs/common';
import {
  GeneratedProposalResult,
  ProposalAiProvider,
  ProposalContext,
} from './proposal-provider.interface';
import { DeterministicProposalProvider } from './deterministic-proposal.provider';

@Injectable()
export class GeminiProposalProvider implements ProposalAiProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProposalProvider.name);

  constructor(private readonly fallbackProvider: DeterministicProposalProvider) {}

  async generateProposal(context: ProposalContext): Promise<GeneratedProposalResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.log('GEMINI_API_KEY not configured. Falling back to deterministic proposal generation.');
      return this.fallbackProvider.generateProposal(context);
    }

    try {
      // Safe runtime import for optional SDK
      const moduleName = '@google/genai';
      const genAiModule: any = await (Function('m', 'return import(m)')(moduleName) as Promise<any>);
      const { GoogleGenAI } = genAiModule;
      const ai = new GoogleGenAI();
      const prompt = `You are writing a freelance job proposal on behalf of a verified candidate:
Name: ${context.freelancer.fullName}
Experience: 4 years MERN Stack (React, Next.js, Node.js, NestJS, TypeScript, MongoDB, PostgreSQL, GraphQL).
Availability: Immediate.
GitHub: ${context.freelancer.portfolioLinks[0] || 'https://github.com/parasherdhruv'}

CRITICAL RULES:
1. NEVER invent any employer names, past clients, fake projects, or qualifications.
2. Stick strictly to the verified skills: React, Next.js, TypeScript, Node.js, NestJS, MongoDB, PostgreSQL, GraphQL.
3. Keep the tone confident, senior, professional, and concise.

Job Details:
Title: ${context.gig.title}
Client: ${context.gig.clientName}
Pricing: ${context.gig.pricingType} ($${context.gig.budgetMax || context.gig.hourlyRateMax || 'negotiable'})
Description:
${context.gig.description}

Write a high-converting, tailored cover letter outlining the candidate's exact technical fit, architectural approach to this specific project, and clear proposed next steps.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (!text) {
        return this.fallbackProvider.generateProposal(context);
      }

      const deterministic = await this.fallbackProvider.generateProposal(context);
      return {
        ...deterministic,
        coverLetter: text,
        providerUsed: 'gemini',
        notes: 'Drafted via Gemini 2.5 Flash with strict factual guardrails.',
      };
    } catch (error) {
      this.logger.warn(`Gemini generation encountered an issue, falling back: ${error}`);
      return this.fallbackProvider.generateProposal(context);
    }
  }
}
