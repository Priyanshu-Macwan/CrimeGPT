import React from 'react';

const casesData = [
  { id: '#CR-2023-089', type: 'Theft', date: 'Oct 24, 2023', status: 'Open' },
  { id: '#CR-2023-088', type: 'Assault', date: 'Oct 22, 2023', status: 'Solved' },
  { id: '#CR-2023-087', type: 'Cyber Fraud', date: 'Oct 20, 2023', status: 'Pending' },
  { id: '#CR-2023-085', type: 'Vandalism', date: 'Oct 18, 2023', status: 'Open' },
];

const getStampClass = (status) => {
  switch (status) {
    case 'Open': return 'rotate-[-3deg]';
    case 'Solved': return 'rotate-[2deg]';
    case 'Pending': return 'rotate-[-1deg]';
    default: return '';
  }
};

const RecentCasesTable = () => {
  return (
    <div className="lg:col-span-2 bg-bureau-bg border border-bureau-navy overflow-hidden flex flex-col">
      <div className="p-md border-b border-bureau-navy flex justify-between items-center bg-bureau-bg">
        <h2 className="text-headline-md font-headline-md text-bureau-navy font-bold">Recent Cases</h2>
        <button className="text-bureau-navy text-label-md font-label-md font-bold uppercase underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bureau-bg text-bureau-navy text-label-md font-label-md uppercase tracking-wider border-b border-bureau-navy">
              <th className="py-3 px-4 font-bold border-r border-bureau-navy">Case ID</th>
              <th className="py-3 px-4 font-bold border-r border-bureau-navy">Crime Type</th>
              <th className="py-3 px-4 font-bold border-r border-bureau-navy">Date</th>
              <th className="py-3 px-4 font-bold border-r border-bureau-navy text-center">Status</th>
              <th className="py-3 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-body-md font-body-md">
            {casesData.map((caseItem, index) => (
              <tr key={caseItem.id} className={`${index !== casesData.length - 1 ? 'border-b border-bureau-navy' : ''} hover:bg-surface-dim transition-colors`}>
                <td className="py-3 px-4 font-bold text-bureau-navy border-r border-bureau-navy">{caseItem.id}</td>
                <td className="py-3 px-4 border-r border-bureau-navy">{caseItem.type}</td>
                <td className="py-3 px-4 text-bureau-navy border-r border-bureau-navy">{caseItem.date}</td>
                <td className="py-3 px-4 border-r border-bureau-navy text-center">
                  <span className={`font-headline-md font-bold border-2 border-bureau-navy inline-block px-2 py-0.5 uppercase text-bureau-navy bg-transparent ${getStampClass(caseItem.status)}`}>
                    {caseItem.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-bureau-navy hover:text-bureau-navy p-1">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentCasesTable;
