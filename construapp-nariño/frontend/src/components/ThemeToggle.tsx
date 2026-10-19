import { PiDesktop, PiMoon, PiSun } from 'react-icons/pi';
import { useTheme, type ThemePreference } from '../hooks/useTheme';
import SegmentedControl, { type SegmentedOption } from './ui/SegmentedControl';

const OPTIONS: SegmentedOption<ThemePreference>[] = [
  { value: 'light', label: 'Tema claro', icon: <PiSun aria-hidden="true" /> },
  { value: 'dark', label: 'Tema oscuro', icon: <PiMoon aria-hidden="true" /> },
  { value: 'system', label: 'Tema del sistema', icon: <PiDesktop aria-hidden="true" /> },
];

interface ThemeToggleProps {
  tone?: 'default' | 'shell';
  className?: string;
}

/** Selector de apariencia: claro, oscuro o el del sistema. */
export default function ThemeToggle({ tone, className }: ThemeToggleProps) {
  const preference = useTheme((s) => s.preference);
  const setPreference = useTheme((s) => s.setPreference);

  return (
    <SegmentedControl
      label="Apariencia"
      value={preference}
      onChange={setPreference}
      options={OPTIONS}
      iconOnly
      tone={tone}
      className={className}
    />
  );
}
