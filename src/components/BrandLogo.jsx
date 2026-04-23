export const ElotiveLogoMark = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`rounded-xl bg-primary flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="w-[58%] h-[58%] text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="5" y="5" width="3.2" height="14" rx="1.2" fill="currentColor" />
        <rect x="7.7" y="5" width="11.3" height="3.2" rx="1.2" fill="currentColor" />
        <rect x="7.7" y="10.4" width="8.1" height="3.2" rx="1.2" fill="currentColor" />
        <rect x="7.7" y="15.8" width="11.3" height="3.2" rx="1.2" fill="currentColor" />
        <path
          d="M16.6 10.8L18 12.2L20.4 9.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
