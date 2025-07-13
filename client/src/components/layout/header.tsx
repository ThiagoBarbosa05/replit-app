import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  config: {
    title: string;
    description: string;
  };
}

export default function Header({ config }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-bordeaux-900">{config.title}</h2>
          <p className="text-gray-600">{config.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
