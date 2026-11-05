import { ProjectNormalizer } from './project-normalizer';
import { DiscoveredProject } from './discovery-provider.interface';

describe('ProjectNormalizer', () => {
  let normalizer: ProjectNormalizer;

  beforeEach(() => {
    normalizer = new ProjectNormalizer();
  });

  const rawProject: DiscoveredProject = {
    title: 'React & Node.js Developer',
    clientName: 'Global Inc',
    pricingType: 'FIXED_PRICE',
    budgetMin: 1500,
    budgetMax: 2000,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    description: 'Looking for a full stack engineer.',
    skills: ['reactjs', 'node.js', 'ts', 'graphql'],
    source: 'RSS',
    sourceUrl: 'https://example.com/job/123?ref=rss',
  };

  it('normalizes skill taxonomies into canonical names', () => {
    const normalized = normalizer.normalize(rawProject);
    expect(normalized.skills).toContain('React');
    expect(normalized.skills).toContain('Node.js');
    expect(normalized.skills).toContain('TypeScript');
    expect(normalized.skills).toContain('GraphQL');
  });

  it('detects duplicate projects by URL and title+client', () => {
    const gig1 = normalizer.normalize(rawProject);
    const gig2 = normalizer.normalize({
      ...rawProject,
      sourceUrl: 'https://example.com/job/123?utm_source=twitter',
    });

    expect(normalizer.isDuplicate([gig1], gig2)).toBe(true);
  });
});
