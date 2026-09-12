import { Button, EmptyState } from "@/components/ui";

interface LoadErrorProps {
  title?: string;
  body: string;
  onRetry: () => void;
}

export function LoadError({
  title = "Something went wrong.",
  body,
  onRetry,
}: LoadErrorProps) {
  return (
    <EmptyState
      title={title}
      body={body}
      action={
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      }
    />
  );
}
