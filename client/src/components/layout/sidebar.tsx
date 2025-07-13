import { Wine, BarChart3, Building, Truck, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "clients", label: "Clientes", icon: Building },
    { id: "products", label: "Produtos", icon: Wine },
    { id: "consignments", label: "Consignações", icon: Truck },
    { id: "inventory", label: "Contagem", icon: ClipboardList },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Wine className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VinhoConsign</h1>
            <p className="text-sm text-gray-500">Gestão de Consignações</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start space-x-3 ${
                    isActive 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
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
