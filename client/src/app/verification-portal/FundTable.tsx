interface Proof {
  id: string;
  campaign_id: string;
  status: string;
}

export function FundTable({ data, onReview }: { data: Proof[]; onReview: (type: string, id: string) => void }) {
  return (
    <table className="w-full text-left mb-6">
      <thead>
        <tr className="text-emerald-700">
          <th className="px-4 py-3">Campaign ID</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(fund => (
          <tr key={fund.id} className="border-t border-zinc-700">
            <td className="px-4 py-3">{fund.campaign_id}</td>
            <td className="px-4 py-3">{fund.status}</td>
            <td className="px-4 py-3">
              <button onClick={() => onReview('fund', fund.id)} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
