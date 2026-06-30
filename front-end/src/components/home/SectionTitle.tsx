interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onSeeAll?: () => void;
  className?: string;
}

export default function SectionTitle({ title, subtitle, eyebrow, onSeeAll, className = "" }: SectionTitleProps) {
  if (eyebrow || onSeeAll) {
    return (
      <div className={`flex items-flex-end justify-between mb-6 ${className}`}>
        <div>
          {eyebrow && (
            <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-[#D85A30] mb-1">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-medium" style={{ color: 'var(--color-text-primary, #111)' }}>
            {title}
          </h2>
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs flex items-center gap-1 pb-px border-b border-current opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap self-end"
            style={{ color: 'var(--color-text-secondary, #555)' }}
          >
            Xem tất cả
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center mb-12 mt-16 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 text-center">
        {title}
      </h2>
      <div className="w-16 h-1 bg-[#F0206A] mb-4 rounded-full" style={{ margin: '0 auto 16px auto' }}></div>
      {subtitle && (
        <p className="text-neutral-600 text-lg max-w-2xl text-center" style={{ margin: '0 auto' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
