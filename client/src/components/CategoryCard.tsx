import { Card, CardContent } from "@/components/ui/card";
import { Music, Briefcase, Palette, Trophy, Coffee, GraduationCap, Users, Heart, Gamepad2, MapPin, Calendar } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  eventCount?: number;
  onClick?: () => void;
}

const categoryColorMap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
  purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
  red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
  yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
  indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
};

export function CategoryCard({ category, eventCount = 0, onClick }: CategoryCardProps) {
  const colorClasses = categoryColorMap[category.color] || categoryColorMap.blue;
  
  const getCategoryIcon = (category: any) => {
    if (!category) return Calendar;
    
    const iconMap: Record<string, any> = {
      music: Music,
      technology: Briefcase,
      art: Palette,
      sports: Trophy,
      food: Coffee,
      education: GraduationCap,
      networking: Users,
      health: Heart,
      gaming: Gamepad2,
      travel: MapPin,
    };
    
    return iconMap[category.name?.toLowerCase()] || Calendar;
  };

  const IconComponent = getCategoryIcon(category);

  return (
    <Card 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className={`category-icon ${colorClasses} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {eventCount} events
        </p>
      </CardContent>
    </Card>
  );
}
