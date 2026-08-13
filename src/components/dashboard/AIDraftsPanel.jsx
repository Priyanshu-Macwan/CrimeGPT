import React from 'react';

const draftsData = [
  {
    title: 'FIR Draft: Cyber Fraud',
    time: '2h ago',
    description: 'AI generated initial report based on victim statement regarding unauthorized bank transfer.',
  },
  {
    title: 'Statement Summary: Witness A',
    time: '5h ago',
    description: 'Summarized 45-minute audio interview into key bullet points for Case #CR-2023-088.',
  },
  {
    title: 'Evidence Log Draft',
    time: '1d ago',
    description: 'Auto-cataloged 12 items from crime scene photos submitted by responding team.',
  }
];

const AIDraftsPanel = () => {
  return (
    <div className="lg:col-span-1 bg-bureau-bg border border-bureau-navy flex flex-col shadow-[4px_4px_0px_#071525]">
      <div className="p-md border-b border-bureau-navy bg-bureau-bg flex items-center space-x-2">
        <span className="material-symbols-outlined text-bureau-navy">psychology</span>
        <h2 className="text-headline-md font-headline-md text-bureau-navy font-bold">AI Drafts Awaiting Review</h2>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {draftsData.map((draft, index) => (
          <div key={index} className="border border-bureau-navy p-3 bg-bureau-bg hover:bg-surface-dim transition-colors group">
            <div className="flex justify-between items-start mb-2 border-b border-bureau-navy pb-2">
              <h4 className="text-body-md font-body-md font-bold text-bureau-navy uppercase">{draft.title}</h4>
              <span className="text-[10px] text-bureau-navy font-bold whitespace-nowrap ml-2">{draft.time}</span>
            </div>
            <p className="font-sans text-sm text-bureau-navy mb-3 line-clamp-2">{draft.description}</p>
            <button className="w-full bg-bureau-bg border border-bureau-navy text-bureau-navy py-1.5 text-label-md font-label-md hover:bg-bureau-navy hover:text-bureau-bg transition-colors flex justify-center items-center space-x-1 font-bold uppercase">
              <span>Review Now</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIDraftsPanel;
