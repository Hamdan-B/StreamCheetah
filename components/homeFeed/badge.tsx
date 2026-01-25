import type { MouseEvent } from "react";

export default function Badge({
  text,
  onClick,
}: {
  text: string;
  onClick?: (event: MouseEvent<HTMLSpanElement>) => void;
}) {
  return (
    <span
      className={`text-xs bg-secondary/80 text-secondary-foreground py-1 px-2.5 rounded-full font-medium ${onClick ? "cursor-pointer hover:bg-secondary transition-colors" : ""}`}
      onClick={onClick}
      key={text}
    >
      {text}
    </span>
  );
}
