"use client";

import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";

interface RestTimeInputProps {
  value?: number; // total seconds
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
}

export function RestTimeInput({
  value,
  onChange,
  disabled,
}: RestTimeInputProps) {
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

  // Convert total seconds to minutes and seconds when value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      setMinutes(mins > 0 ? mins.toString() : "");
      setSeconds(secs > 0 ? secs.toString() : "");
      return;
    }
    
    // Set default to 1 minute when no value
    setMinutes("1");
    setSeconds("");
    // Call onChange with default 60 seconds if no initial value
    if (onChange && (value === undefined || value === null)) {
      onChange(60);
    }
  }, [value, onChange]);

  // Convert minutes and seconds to total seconds and call onChange
  const updateTotalSeconds = (newMinutes: string, newSeconds: string) => {
    const mins = newMinutes ? parseInt(newMinutes, 10) : 0;
    const secs = newSeconds ? parseInt(newSeconds, 10) : 0;

    // If both are empty, return undefined
    if (!newMinutes && !newSeconds) {
      onChange(undefined);
      return;
    }

    // Validate seconds (0-59)
    if (secs >= 60) {
      return; // Don't update if seconds >= 60
    }

    const totalSeconds = mins * 60 + secs;
    onChange(totalSeconds);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty or valid positive numbers
    if (
      newValue === "" ||
      (/^\d+$/.test(newValue) && parseInt(newValue, 10) >= 0)
    ) {
      setMinutes(newValue);
      updateTotalSeconds(newValue, seconds);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty or valid numbers 0-59
    if (
      newValue === "" ||
      (/^\d+$/.test(newValue) &&
        parseInt(newValue, 10) >= 0 &&
        parseInt(newValue, 10) < 60)
    ) {
      setSeconds(newValue);
      updateTotalSeconds(minutes, newValue);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1">
        <Input
          type="text"
          placeholder="1"
          value={minutes}
          onChange={handleMinutesChange}
          disabled={disabled}
          className="h-10 w-12 text-center"
        />
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          min
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="text"
          placeholder="0"
          value={seconds}
          onChange={handleSecondsChange}
          disabled={disabled}
          className="h-10 w-12 text-center"
          maxLength={2}
        />
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          sec
        </span>
      </div>
    </div>
  );
}
