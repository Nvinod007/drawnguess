"use client";

import { Input } from "@heroui/react";

interface UserNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function UserNameInput({ value, onChange }: UserNameInputProps) {
  return (
    <Input
      label="Your Name"
      placeholder="Enter your name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={20}
      variant="bordered"
      size="lg"
      isRequired
      startContent={<span className="text-default-400">👤</span>}
      classNames={{
        input: "text-base",
        inputWrapper: "h-12",
      }}
    />
  );
}
