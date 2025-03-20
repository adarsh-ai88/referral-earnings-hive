
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(theme === "system" ? "dark" : "system")}
      className="glass-button p-2 rounded-full hover:scale-110 transition-transform"
    >
      <Moon className="h-5 w-5 text-mlm-primary" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
