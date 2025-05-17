interface NGO {
  id: string;
  name: string;
  verification_status: string;
}

export function NGOTable({ data, onReview }: { data: NGO[]; onReview: (type: string, id: string) => void }) {
  return (
    <table className="w-full text-left mb-6">
      <thead>
        <tr className="text-emerald-700">
          <th className="px-4 py-3">Organization</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(ngo => (
          <tr key={ngo.id} className="border-t border-zinc-700">
            <td className="px-4 py-3">{ngo.name}</td>
            <td className="px-4 py-3">{ngo.verification_status}</td>
            <td className="px-4 py-3">
              <button onClick={() => onReview('ngo', ngo.id)} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
