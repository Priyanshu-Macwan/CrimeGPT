/**
 * ActivityTimeline — Recent activity feed with vertical connecting line.
 * Each item has an icon node, description with bold case references,
 * and a timestamp — matching the screenshot's brutalist timeline style.
 */

const activityData = [
  {
    icon: 'check',
    iconFilled: false,
    description: (
      <>
        You approved AI Draft for{' '}
        <strong className="font-['IBM_Plex_Mono'] uppercase border-b border-bureau-navy">
          Case #CR-2023-088
        </strong>
      </>
    ),
    time: 'Today, 09:15 AM',
  },
  {
    icon: 'upload_file',
    iconFilled: false,
    description: (
      <>
        Evidence uploaded for{' '}
        <strong className="font-['IBM_Plex_Mono'] uppercase border-b border-bureau-navy">
          Case #CR-2023-089
        </strong>
      </>
    ),
    time: 'Yesterday, 16:45 PM',
  },
  {
    icon: 'add',
    iconFilled: true,
    description: (
      <>
        New case opened:{' '}
        <strong className="font-['IBM_Plex_Mono'] uppercase border-b border-bureau-navy">
          Cyber Fraud Investigation
        </strong>
      </>
    ),
    time: 'Oct 20, 11:30 AM',
  },
];

const ActivityTimeline = () => {
  return (
    <div className="bg-bureau-bg border border-bureau-navy p-md flex flex-col h-80">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-bureau-navy pb-2">
        <h2 className="text-headline-md font-headline-md text-bureau-navy font-bold">
          Recent Activity
        </h2>
        <span className="material-symbols-outlined text-bureau-navy">history</span>
      </div>

      {/* Timeline content */}
      <div className="flex-1 overflow-y-auto pr-2 relative">
        {/* Vertical connecting line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-bureau-navy" />

        <div className="space-y-6 relative">
          {activityData.map((item, index) => (
            <div key={index} className="flex space-x-4">
              {/* Icon node */}
              <div
                className={`w-8 h-8 border-2 border-bureau-navy flex items-center justify-center z-10 shrink-0 ${
                  item.iconFilled
                    ? 'bg-bureau-navy'
                    : 'bg-bureau-bg'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] font-bold ${
                    item.iconFilled
                      ? 'text-bureau-bg'
                      : 'text-bureau-navy'
                  }`}
                >
                  {item.icon}
                </span>
              </div>

              {/* Content */}
              <div>
                <p className="font-sans text-sm text-bureau-navy">
                  {item.description}
                </p>
                <p className="text-label-sm font-label-sm text-bureau-navy mt-1 font-bold uppercase">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
