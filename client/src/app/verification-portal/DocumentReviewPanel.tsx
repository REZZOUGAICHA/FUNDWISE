interface DocumentReview {
  organization: string;
  documentType: string;
  submissionDate: string;
}

export function DocumentReviewPanel({ doc, onRespond }: { doc: DocumentReview; onRespond: (action: 'approve' | 'request' | 'reject') => void }) {
  return (
    <div className="bg-zinc-900 mt-6 p-6 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">Document Review</h4>
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-gray-200">Organization: {doc.organization}</label>
          </div>
          <div>
            <label className="block text-gray-200">Document Type: {doc.documentType}</label>
          </div>
          <div>
            <label className="block text-gray-200">Submission Date: {doc.submissionDate}</label>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center h-48 bg-zinc-800 text-gray-500">
          [Document Preview]
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-gray-200 mb-2">Comments</label>
        <textarea className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white" rows={3}></textarea>
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => onRespond('approve')} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">Approve</button>
        <button onClick={() => onRespond('request')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">Request More Info</button>
        <button onClick={() => onRespond('reject')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">Reject</button>
      </div>
    </div>
  );
}
