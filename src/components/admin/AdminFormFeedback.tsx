type AdminFormFeedbackProps = {
  success?: string | null;
  error?: string | null;
  className?: string;
};

export function AdminFormFeedback({
  success,
  error,
  className = "",
}: AdminFormFeedbackProps) {
  if (!success && !error) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {success && (
        <p className="text-sm text-green-400" role="status">
          {success}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
