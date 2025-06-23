import { Card, CardBody } from "@heroui/react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <Card className="bg-danger-50 border border-danger-200">
      <CardBody className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-danger-600">⚠️</span>
          <p className="text-sm text-danger-700">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-auto text-danger-600 hover:text-danger-800"
            >
              ×
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
