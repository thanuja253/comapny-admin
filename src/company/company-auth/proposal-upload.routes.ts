/** Matches proposal upload/reupload on all `CompanyProjectsController` path prefixes. */
const PROPOSAL_UPLOAD_WRITE_PATH =
  /^\/api\/(?:company\/projects|companyproject|companyprojects)\/[^/]+\/(?:proposal-document(?:\/reupload)?|proposal-workorder-documents\/reupload)$/;

export function isProposalDocumentWriteRequest(method: string, path: string): boolean {
  const m = String(method || '').toUpperCase();
  const p = String(path || '').split('?')[0];
  return ['POST', 'PUT', 'PATCH'].includes(m) && PROPOSAL_UPLOAD_WRITE_PATH.test(p);
}
