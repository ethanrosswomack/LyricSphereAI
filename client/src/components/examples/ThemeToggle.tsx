import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '@/hooks/use-theme';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-6 bg-background flex items-center gap-4">
        <ThemeToggle />
        <span className="text-foreground">Click to toggle theme</span>
      </div>
    </ThemeProvider>
  );
}
