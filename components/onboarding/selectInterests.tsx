import { useDatabase } from "@/contexts/databaseContext";
import { Interest, interests } from "@/lib/types/interest";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { useState } from "react";
import InterestComponent from "./interestComponent";

type SelectInterestsProps = {
  onComplete?: () => void;
};

export default function SelectInterests({ onComplete }: SelectInterestsProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const { setUserInterests } = useDatabase();
  const { user } = useSupabaseAuth();

  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-8 relative text-foreground border border-muted max-h-[90vh] overflow-y-auto flex flex-col">
        <h1 className="text-2xl font-bold p-6 text-center">
          What are you into?
        </h1>
        <p className="text-center text-sm mb-6 px-6 text-muted-foreground">
          Choose 1 or more categories of channels being streamed right now.
        </p>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-5 gap-3 p-6">
            {interests.map((interest) => (
              <button
                key={interest.id}
                className="rounded-xl overflow-hidden"
                onClick={() => {
                  if (selectedInterests.includes(interest)) {
                    setSelectedInterests(
                      selectedInterests.filter((i) => i.id !== interest.id),
                    );
                  } else {
                    setSelectedInterests([...selectedInterests, interest]);
                  }
                }}
              >
                <InterestComponent
                  interest={interest.name}
                  selected={selectedInterests.includes(interest)}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border flex items-center justify-end w-full p-4">
          <button
            className={`px-6 py-2 text-sm font-semibold cursor-pointer rounded-md transition-colors ${
              selectedInterests.length === 0
                ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            onClick={() => {
              console.log(selectedInterests);
              if (selectedInterests.length === 0 || !user?.id) {
                console.log("No interests selected or user not found");
                return;
              }
              setUserInterests(
                selectedInterests.map((interest) => interest.name),
                user.id,
              ).then(() => {
                setIsOpen(false);
                onComplete?.();
              });
            }}
            disabled={selectedInterests.length === 0}
          >
            {selectedInterests.length === 0 ? "Choose 1 more" : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}
