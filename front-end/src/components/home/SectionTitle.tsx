interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionTitle({ title, subtitle, className = "" }: SectionTitleProps) {
  return (
    <div className={`flex flex-col items-center text-center mb-12 mt-16 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 text-center">
        {title}
      </h2>
      {/* Decorative underline */}
      <div className="w-16 h-1 bg-[#F0206A] mb-4 rounded-full" style={{ margin: '0 auto 16px auto' }}></div>
      {subtitle && (
        <p className="text-neutral-600 text-lg max-w-2xl text-center" style={{ margin: '0 auto' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}