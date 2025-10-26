import { Music2 } from "lucide-react";

export function WelcomeHero() {
  return (
    <div className="text-center py-8 px-4" data-testid="welcome-hero">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Music2 className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
        Hawk Eye
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Explore music through conversation. Ask about lyrics, meanings, backstories, or discover songs.
      </p>
    </div>
  );
}
