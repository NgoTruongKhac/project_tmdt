interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionTitle({ title, subtitle, className = "" }: SectionTitleProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}