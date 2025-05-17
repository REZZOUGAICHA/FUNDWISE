
interface Campaign {
  id: string;
  title: string;
  status: string;
}

export function CampaignTable({ data, onReview }: { data: Campaign[]; onReview: (type: string, id: string) => void }) {
  return (
    <table className="w-full text-left mb-6">
      <thead>
        <tr className="text-emerald-700">
          <th className="px-4 py-3">Campaign</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(campaign => (
          <tr key={campaign.id} className="border-t border-zinc-700">
            <td className="px-4 py-3">{campaign.title}</td>
            <td className="px-4 py-3">{campaign.status}</td>
            <td className="px-4 py-3">
              <button onClick={() => onReview('campaign', campaign.id)} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
