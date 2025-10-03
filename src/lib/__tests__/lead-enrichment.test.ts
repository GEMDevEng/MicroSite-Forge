import { LeadEnrichment } from '../lead-manager';

describe('LeadEnrichment', () => {
  const enrichment = new LeadEnrichment();

  it('should extract company name from email domain in LeadEnrichment', () => {
  const result = (enrichment as unknown as { extractCompanyFromEmail(email: string): string | undefined }).extractCompanyFromEmail('bob@openai.com');
    expect(result).toBe('openai'); // Updated behavior - lowercase
  });

  it('should handle emails with subdomains in LeadEnrichment', () => {
  const result = (enrichment as unknown as { extractCompanyFromEmail(email: string): string | undefined }).extractCompanyFromEmail('carol@research.google.co.uk');
    expect(result).toBe('research.google'); // Updated behavior - proper subdomain handling
  });
});
