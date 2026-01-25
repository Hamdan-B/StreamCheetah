import { colorForInterest } from "@/lib/types/interest";

export default function InterestComponent({
  interest,
  selected = true,
}: {
  interest: string;
  selected?: boolean;
}) {
  const numberOfTextElements = 11;
  return (
    <div
      className={`w-full min-w-20 aspect-[2/3] flex flex-col items-center justify-center overflow-hidden relative rounded-xl transition-all duration-300 ${
        selected
          ? "ring-4 ring-primary shadow-xl shadow-primary/30 scale-[1.02]"
          : "ring-1 ring-border hover:shadow-lg hover:scale-[1.02]"
      } bg-gradient-to-br from-primary/20 via-muted/60 to-background`}
    >
      {selected && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            `radial-gradient(120px circle at 20% 20%, ${colorForInterest(interest)} 0%, transparent 60%), ` +
            `radial-gradient(160px circle at 80% 70%, ${colorForInterest(interest)} 0%, transparent 60%)`,
        }}
      />
      {[...Array(numberOfTextElements)].map((_, i) => (
        <p
          key={i}
          className="text-center text-lg tracking-widest text-foreground/30"
          style={{
            opacity: getOpacity(i),
          }}
        >
          {interest}
        </p>
      ))}
      <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md ring-1 ring-border">
        <span className="text-sm font-semibold text-foreground">
          {interest}
        </span>
      </div>
    </div>
  );

  function getOpacity(index: number): number {
    const middleIndex = Math.floor(numberOfTextElements / 2);
    return 1 - (Math.abs(index - middleIndex) * 1.9) / middleIndex;
  }
}
