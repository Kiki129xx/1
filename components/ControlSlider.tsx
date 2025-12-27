
import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  icon
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className="text-xs font-mono text-blue-400">{value.toFixed(step >= 1 ? 0 : 2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:bg-slate-600 transition-colors"
      />
    </div>
  );
};
