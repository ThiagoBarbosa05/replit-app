import { Link, useLocation } from "wouter";
import { Wine, BarChart3, Building, Truck, ClipboardList, Users, UserCircle, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();
  
  const menuItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/clients", label: "Clientes", icon: Building },
    { path: "/products", label: "Produtos", icon: Wine },
    { path: "/consignments", label: "Consignações", icon: Truck },
    { path: "/inventory", label: "Contagem", icon: ClipboardList },
    { path: "/stock", label: "Estoque", icon: Package },
    { path: "/reports", label: "Relatórios", icon: BarChart3 },
    { path: "/users", label: "Usuários", icon: UserCircle },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full">
      {/* Logo/Brand */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wine className="text-white text-sm sm:text-lg" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Grand Cru</h1>
              <p className="text-xs sm:text-sm text-gray-500">Gestão de Vinhos</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigate}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2 sm:p-4">
        <ul className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start space-x-2 sm:space-x-3 text-sm sm:text-base ${
                      isActive 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={onNavigate}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="text-gray-600 h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">João Silva</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <Button variant="ghost" size="sm">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
