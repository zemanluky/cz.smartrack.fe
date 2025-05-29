import React, { useState, useEffect } from "react";
import { useUserStore } from "@/lib/stores/userStore.ts";
import { listGatewayDevices, GatewayDevice } from "@/api/adminApi.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Pagination } from "@/components/ui/pagination.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";
import { Search, RefreshCw, Battery, Signal } from "lucide-react";
import AddGatewayDeviceDialog from "@/components/devices/AddGatewayDeviceDialog.tsx";
import GatewayDeviceDetails from "@/components/devices/GatewayDeviceDetails.tsx";

const DeviceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("gateways");
  const [gatewayDevices, setGatewayDevices] = useState<GatewayDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<GatewayDevice | null>(null);
  
  const currentUser = useUserStore(state => state.currentUser);
  const isAdmin = currentUser?.role === 'sys_admin';
  
  const loadGatewayDevices = async (page = 1, search = "") => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const response = await listGatewayDevices(page, 10, search);
      setGatewayDevices(response.items);
      setTotalPages(Math.ceil(response.metadata.total_results / response.metadata.limit));
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load gateway devices:", error);
      toast.error("Failed to load devices. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadGatewayDevices(1, searchTerm);
    }
  }, [isAdmin]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadGatewayDevices(1, searchTerm);
  };

  const handleRefresh = () => {
    loadGatewayDevices(currentPage, searchTerm);
  };

  const handleDeviceClick = (device: GatewayDevice) => {
    setSelectedDevice(device);
  };

  const handleAddDeviceSuccess = () => {
    loadGatewayDevices(currentPage, searchTerm);
    toast.success("Device added successfully!");
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don't have permission to manage devices.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (selectedDevice) {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedDevice(null)} 
          className="mb-4"
        >
          Back to Device List
        </Button>
        <GatewayDeviceDetails 
          device={selectedDevice} 
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Device Management</CardTitle>
            <CardDescription>Manage gateway devices and view their connected shelf sensors</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddGatewayDeviceDialog onSuccess={handleAddDeviceSuccess} />
            
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="gateways">Gateway Devices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gateways">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <Input
                placeholder="Search by serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            
            {isLoading ? (
              <div className="flex justify-center p-8">Loading devices...</div>
            ) : gatewayDevices.length === 0 ? (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">No gateway devices found</p>
                <AddGatewayDeviceDialog 
                  onSuccess={handleAddDeviceSuccess}
                  className="mt-4"
                  buttonText="Register First Gateway"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gatewayDevices.map((device) => (
                    <Card 
                      key={device.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleDeviceClick(device)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">{device.serial_number}</CardTitle>
                        <CardDescription>ID: {device.id}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Signal className="h-4 w-4 text-muted-foreground" />
                          {device.last_connected 
                            ? `Last connected: ${new Date(device.last_connected).toLocaleString()}` 
                            : "Never connected"}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Battery className="h-4 w-4 text-muted-foreground" />
                          {(device.shelf_positions_devices?.length || 0)} connected shelf devices
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination 
                    className="mt-4 flex justify-center"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => loadGatewayDevices(page, searchTerm)}
                  />
                )}
              </>
            )}
          </TabsContent>
          
          
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeviceManagementPage;
