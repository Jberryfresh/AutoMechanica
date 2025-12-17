import type { FC } from 'react';

interface Props {
  attributes: Record<string, string | number>;
}

const SpecsTable: FC<Props> = ({ attributes }) => {
  const entries = Object.entries(attributes);
  if (!entries.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gunmetal-700 bg-gunmetal-900/60">
      <table className="min-w-full divide-y divide-gunmetal-800 text-sm">
        <tbody className="divide-y divide-gunmetal-800">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="w-1/3 px-4 py-3 text-soft-graphite capitalize">{key}</td>
              <td className="px-4 py-3 text-slate-100">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpecsTable;
