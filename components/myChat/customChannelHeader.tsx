import { ArrowRight } from '../icons';

export default function CustomChannelHeader({
  setChatExpanded,
}: {
  setChatExpanded?: (expanded: boolean) => void;
}) {
  return (
    <div className='text-sm text-gray-500 flex items-center p-4'>
      {setChatExpanded && (
        <button
          className='text-sm text-secondary rotate-180 transition-transform duration-150 ease-in-out'
          onClick={() => setChatExpanded(false)}
        >
          <ArrowRight />
        </button>
      )}
      <h2 className='text-black mx-auto font-bold'>Stream Chat</h2>
    </div>
  );
}
