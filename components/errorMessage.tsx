interface ErrorMessageProps {
  error: string | null | undefined;
  retry?: () => void;
}

const friendlyErrors: Record<string, string> = {
  "Failed to fetch":
    "Unable to connect. Please check your internet connection.",
  "Network request failed": "Connection lost. Please try again.",
  "Auth client not initialized":
    "Authentication system is starting. Please wait a moment.",
  "Invalid login credentials":
    "Email or password is incorrect. Please try again.",
  "Email not confirmed": "Please check your email and confirm your account.",
  "Invalid reset link":
    "This reset link has expired. Please request a new one.",
  "Passwords do not match": "The passwords you entered don't match.",
  "Password must be at least 8 characters":
    "Password is too short. Use at least 8 characters.",
};

function getFriendlyError(error: string): string {
  // Check for exact matches
  if (friendlyErrors[error]) {
    return friendlyErrors[error];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(friendlyErrors)) {
    if (error.includes(key)) {
      return value;
    }
  }

  // Default friendly message for unknown errors
  if (error.toLowerCase().includes("supabase")) {
    return "There was a problem with our service. Please try again later.";
  }

  if (error.toLowerCase().includes("database")) {
    return "Unable to access data. Please try again in a moment.";
  }

  if (
    error.toLowerCase().includes("network") ||
    error.toLowerCase().includes("fetch")
  ) {
    return "Connection issue. Please check your internet and try again.";
  }

  // If it's a short, readable message, show it as-is
  if (
    error.length < 80 &&
    !error.includes("Error:") &&
    !error.includes("at ")
  ) {
    return error;
  }

  // Generic fallback
  return "Something went wrong. Please try again.";
}

export function ErrorMessage({ error, retry }: ErrorMessageProps) {
  if (!error) return null;

  const friendlyMessage = getFriendlyError(error);

  return (
    <div className="w-full p-4 bg-error/10 border border-error/20 rounded-lg">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-error flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-error">{friendlyMessage}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-xs text-primary hover:text-primary/80 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuccessMessage({
  message,
}: {
  message: string | null | undefined;
}) {
  if (!message) return null;

  return (
    <div className="w-full p-4 bg-success/10 border border-success/20 rounded-lg">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-success flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium text-success">{message}</p>
      </div>
    </div>
  );
}
