"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import React from "react";

type PriceRangeFieldProps = {
  label: string;
  value?: [number, number];
  defaultValue?: [number, number];
  onMinChange?: (data: number) => void;
  onMaxChange?: (data: number) => void;
  onReset: () => void;
  onValueChange?: (data: [number, number]) => void;
};

const MIN_PRICE = 0;
const MAX_PRICE = 10000;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeRange(next: [number, number]): [number, number] {
  let [min, max] = next;
  min = clamp(min, MIN_PRICE, MAX_PRICE);
  max = clamp(max, MIN_PRICE, MAX_PRICE);
  if (min > max) [min, max] = [max, min];
  return [min, max];
}

function PriceRange({
  value,
  onReset,
  defaultValue = [0, 10000],
  onValueChange,
  onMinChange,
  onMaxChange,
}: PriceRangeFieldProps) {
  // Use controlled mode when value is provided, uncontrolled otherwise
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<[number, number]>(
    value ?? defaultValue,
  );

  // Use prop value if controlled, internal state if uncontrolled
  const priceRange = isControlled ? value : internalValue;

  // Only sync internal state when switching from controlled to uncontrolled
  React.useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
  }, [isControlled, defaultValue[0], defaultValue[1]]);

  const handleValueChange = (newValue: [number, number]) => {
    const normalized = normalizeRange(newValue);
    if (!isControlled) {
      setInternalValue(normalized);
    }
    onValueChange?.(normalized);
  };

  const handleMinChange = (min: number) => {
    const newValue: [number, number] = normalizeRange([min, priceRange[1]]);
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onMinChange?.(newValue[0]);
    // Don't call onValueChange here - let the parent handle it via onMinChange
  };

  const handleMaxChange = (max: number) => {
    const newValue: [number, number] = normalizeRange([priceRange[0], max]);
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onMaxChange?.(newValue[1]);
    // Don't call onValueChange here - let the parent handle it via onMaxChange
  };

  const handleReset = () => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
    onReset();
  };

  return (
    <div className="mt-5 flex px-5 items-end gap-x-5 place-items-center">
      <div className="flex flex-1 flex-col gap-5 overflow-hidden px-1">
        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-wide text-foreground">
            Rango de precios (CUP)
          </h3>
          <Slider
            variant="range"
            thickness="thin"
            max={MAX_PRICE}
            step={10}
            value={priceRange}
            onValueChange={handleValueChange}
          />
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              inputMode="numeric"
              min={MIN_PRICE}
              max={priceRange[1]}
              className="h-9"
              value={priceRange[0]}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (isNaN(value)) return;
                handleMinChange(value);
              }}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              inputMode="numeric"
              min={priceRange[0]}
              max={MAX_PRICE}
              className="h-9"
              value={priceRange[1]}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (isNaN(value)) return;
                handleMaxChange(value);
              }}
            />
          </div>
        </div>
      </div>

      <Button type="button" onClick={handleReset}>
        Limpiar filtros
      </Button>
    </div>
  );
}

export default PriceRange;
