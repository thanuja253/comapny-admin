/** POST|PUT|PATCH proposal upload/reupload on company project routes (all controller prefixes). */
export function isProposalDocumentWritePath(path: string): boolean {
  const p = String(path || '').split('?')[0];
  return (
    /\/api\/(?:company\/projects|companyproject|companyprojects)\/[^/]+\/proposal-document(?:\/reupload)?$/.test(
      p,
    ) ||
    /\/api\/(?:company\/projects|companyproject|companyprojects)\/[^/]+\/proposal-workorder-documents\/reupload$/.test(
      p,
    )
  );
}
