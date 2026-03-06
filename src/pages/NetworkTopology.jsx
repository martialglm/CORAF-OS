import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, Wifi, Monitor, Printer, Server, Shield, Radio, Camera, MoreVertical, Package, CheckCircle2, Circle, AlertCircle, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import NetworkDeviceForm from '@/components/network/NetworkDeviceForm';
import { useCurrentUser } from '@/components/common/useCurrentUser';
import { Skeleton } from "@/components/ui/skeleton";

const deviceIcons = {
  routeur: Shield,
  switch: Radio,
  serveur: Server,
  poste_travail: Monitor,
  imprimante: Printer,
  point_acces_wifi: Wifi,
  camera: Camera,
  firewall: Shield,
  autre: Package,
};

const deviceColors = {
  routeur: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  switch: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  serveur: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  poste_travail: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  imprimante: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
  point_acces_wifi: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300', dot: 'bg-sky-500' },
  camera: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-500' },
  firewall: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  autre: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-500' },
};

const statusInfo = {
  en_ligne: { label: 'En ligne', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  hors_ligne: { label: 'Hors ligne', color: 'bg-red-500', textColor: 'text-red-600' },
  inconnu: { label: 'Inconnu', color: 'bg-slate-400', textColor: 'text-slate-500' },
};

// Simulated scan results
const generateScanResults = (existingDevices) => {
  const existingIPs = new Set(existingDevices.map(d => d.ip_address));
  const simulatedDevices = [
    { ip_address: '192.168.1.1', hostname: 'ROUTER-CORAF', device_type: 'routeur', manufacturer: 'Cisco', os: 'IOS 15.x', subnet: '192.168.1.0/24', status: 'en_ligne', site: 'direction' },
    { ip_address: '192.168.1.2', hostname: 'SW-CORE-DIR', device_type: 'switch', manufacturer: 'HP', os: 'ProCurve', subnet: '192.168.1.0/24', status: 'en_ligne', site: 'direction' },
    { ip_address: '192.168.1.10', hostname: 'SRV-DC01', device_type: 'serveur', manufacturer: 'Dell', os: 'Windows Server 2019', subnet: '192.168.1.0/24', status: 'en_ligne', site: 'direction' },
    { ip_address: '192.168.1.11', hostname: 'SRV-FILE01', device_type: 'serveur', manufacturer: 'HP', os: 'Windows Server 2022', subnet: '192.168.1.0/24', status: 'en_ligne', site: 'direction' },
    { ip_address: '192.168.1.50', hostname: 'PC-RH-001', device_type: 'poste_travail', manufacturer: 'Dell', os: 'Windows 11', subnet: '192.168.1.0/24', status: 'en_ligne', site: 'direction' },
    { ip_address: '192.168.1.51', hostname: 'PC-COMPTA-001', device_type: 'poste_travail', manufacturer: 'Lenovo', os: 'Windows 10', subnet: '192.168.1.0/24', status: 'hors_ligne', site: 'direction' },
    { ip_address: '192.168.1.100', hostname: 'PRINT-DIR-01', device_type: 'imprimante', manufacturer: 'Canon', subnet: '192.168.1.0/24', status: 'en_ligne', site: 'direction' },
    { ip_address: '192.168.2.1', hostname: 'ROUTER-USINE', device_type: 'routeur', manufacturer: 'Cisco', os: 'IOS 15.x', subnet: '192.168.2.0/24', status: 'en_ligne', site: 'usine' },
    { ip_address: '192.168.2.2', hostname: 'SW-USINE-01', device_type: 'switch', manufacturer: 'Cisco', subnet: '192.168.2.0/24', status: 'en_ligne', site: 'usine' },
    { ip_address: '192.168.2.10', hostname: 'PC-PROD-001', device_type: 'poste_travail', manufacturer: 'HP', os: 'Windows 10', subnet: '192.168.2.0/24', status: 'en_ligne', site: 'usine' },
    { ip_address: '192.168.2.20', hostname: 'AP-WIFI-USINE', device_type: 'point_acces_wifi', manufacturer: 'Ubiquiti', subnet: '192.168.2.0/24', status: 'en_ligne', site: 'usine' },
    { ip_address: '192.168.2.30', hostname: 'CAM-ENTREE-01', device_type: 'camera', manufacturer: 'Hikvision', subnet: '192.168.2.0/24', status: 'en_ligne', site: 'usine' },
  ];
  return simulatedDevices.map(d => ({ ...d, registered_as_asset: existingIPs.has(d.ip_address) }));
};

export default function NetworkTopology() {
  const { isIT, isAdmin } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [siteFilter, setSiteFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('map'); // 'map' or 'list'
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['networkDevices'],
    queryFn: () => base44.entities.NetworkDevice.list('-created_date'),
  });

  const handleScan = async () => {
    setScanning(true);
    setScanResults(null);
    // Simulate network scan (3 seconds)
    await new Promise(r => setTimeout(r, 3000));
    const results = generateScanResults(devices);
    setScanResults(results);
    setScanning(false);
  };

  const handleRegisterDevice = async (scanDevice) => {
    await base44.entities.NetworkDevice.create({
      ...scanDevice,
      name: scanDevice.hostname,
      last_seen: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['networkDevices'] });
    setScanResults(prev => prev?.map(d => d.ip_address === scanDevice.ip_address
      ? { ...d, registered_as_asset: true } : d
    ));
  };

  const filteredDevices = (scanResults || devices).filter(d => {
    const matchesSite = siteFilter === 'all' || d.site === siteFilter;
    const matchesType = typeFilter === 'all' || d.device_type === typeFilter;
    const matchesSearch = !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.hostname?.toLowerCase().includes(search.toLowerCase()) ||
      d.ip_address?.includes(search);
    return matchesSite && matchesType && matchesSearch;
  });

  const stats = {
    total: filteredDevices.length,
    enLigne: filteredDevices.filter(d => d.status === 'en_ligne').length,
    horsLigne: filteredDevices.filter(d => d.status === 'hors_ligne').length,
    nonEnregistres: filteredDevices.filter(d => !d.registered_as_asset).length,
  };

  // Group by subnet for map view
  const subnets = [...new Set(filteredDevices.map(d => d.subnet).filter(Boolean))];

  if (!isIT && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Accès réservé au département Informatique.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Topologie du réseau</h1>
          <p className="text-slate-500 mt-1">Carte et inventaire des équipements réseau CORAF</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleScan}
            disabled={scanning}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", scanning && "animate-spin")} />
            {scanning ? 'Scan en cours...' : 'Scanner le réseau'}
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Scan progress */}
      {scanning && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="font-medium text-blue-800">Scan réseau en cours...</p>
              <p className="text-sm text-blue-600">Analyse des sous-réseaux 192.168.1.0/24 et 192.168.2.0/24</p>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan results banner */}
      {scanResults && !scanning && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-800">
              Scan terminé — {scanResults.length} équipements détectés
            </span>
            <span className="text-sm text-emerald-600">
              ({scanResults.filter(d => !d.registered_as_asset).length} non enregistrés)
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setScanResults(null)}>
            Voir inventaire sauvegardé
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Total équipements</span>
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">En ligne</span>
            <span className="text-2xl font-bold text-emerald-600">{stats.enLigne}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Hors ligne</span>
            <span className="text-2xl font-bold text-red-600">{stats.horsLigne}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-emerald-700">Non enregistrés</span>
            <span className="text-2xl font-bold text-emerald-700">{stats.nonEnregistres}</span>
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher IP, hostname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous sites</SelectItem>
              <SelectItem value="direction">Direction</SelectItem>
              <SelectItem value="usine">Usine</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="routeur">Routeur</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="serveur">Serveur</SelectItem>
              <SelectItem value="poste_travail">Poste de travail</SelectItem>
              <SelectItem value="imprimante">Imprimante</SelectItem>
              <SelectItem value="point_acces_wifi">WiFi AP</SelectItem>
              <SelectItem value="camera">Caméra</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setView('map')}
              className={cn("px-3 py-2 text-sm font-medium transition-colors", view === 'map' ? "bg-blue-600 text-white" : "hover:bg-slate-50")}
            >
              Carte
            </button>
            <button
              onClick={() => setView('list')}
              className={cn("px-3 py-2 text-sm font-medium transition-colors", view === 'list' ? "bg-blue-600 text-white" : "hover:bg-slate-50")}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* MAP VIEW */}
      {view === 'map' && (
        <div className="space-y-6">
          {subnets.length === 0 && !isLoading && (
            <div className="bg-white rounded-xl border p-12 text-center text-slate-500">
              Aucun équipement. Lancez un scan ou ajoutez manuellement.
            </div>
          )}
          {subnets.map(subnet => {
            const subnetDevices = filteredDevices.filter(d => d.subnet === subnet);
            const site = subnetDevices[0]?.site;
            return (
              <div key={subnet} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className={cn("px-6 py-4 flex items-center justify-between",
                  site === 'usine' ? "bg-amber-50 border-b border-amber-200" : "bg-blue-50 border-b border-blue-200"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 rounded-full text-sm font-mono font-medium",
                      site === 'usine' ? "bg-amber-200 text-amber-800" : "bg-blue-200 text-blue-800"
                    )}>
                      {subnet}
                    </div>
                    <span className="font-semibold capitalize">{site}</span>
                    <span className="text-sm text-slate-500">— {subnetDevices.length} équipements</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-600 font-medium">{subnetDevices.filter(d => d.status === 'en_ligne').length} en ligne</span>
                    <span className="text-red-500">{subnetDevices.filter(d => d.status === 'hors_ligne').length} hors ligne</span>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {subnetDevices.map(device => {
                    const Icon = deviceIcons[device.device_type] || Package;
                    const colors = deviceColors[device.device_type] || deviceColors.autre;
                    const status = statusInfo[device.status] || statusInfo.inconnu;
                    const isSelected = selectedDevice?.ip_address === device.ip_address;

                    return (
                      <div
                        key={device.ip_address}
                        onClick={() => setSelectedDevice(isSelected ? null : device)}
                        className={cn(
                          "relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                          isSelected ? "border-blue-500 shadow-md bg-blue-50" : `border-slate-200 ${colors.bg}`,
                          !device.registered_as_asset && "border-dashed border-amber-400"
                        )}
                      >
                        {/* Status dot */}
                        <div className={cn("absolute top-2 right-2 w-2.5 h-2.5 rounded-full", status.color)} />

                        {/* Not registered badge */}
                        {!device.registered_as_asset && (
                          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-1 rounded">
                            Nouveau
                          </div>
                        )}

                        <div className={cn("p-2 rounded-lg mb-2", colors.bg)}>
                          <Icon className={cn("h-8 w-8", colors.text)} />
                        </div>
                        <p className="text-xs font-medium text-slate-800 text-center truncate w-full">
                          {device.hostname || device.name || device.ip_address}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{device.ip_address}</p>

                        {/* Action: register if not already */}
                        {!device.registered_as_asset && scanResults && (
                          <Button
                            size="sm"
                            className="mt-2 h-6 text-xs bg-amber-500 hover:bg-amber-600 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegisterDevice(device);
                            }}
                          >
                            Enregistrer
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Équipement</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">IP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Site</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Enregistré</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map(device => {
                const Icon = deviceIcons[device.device_type] || Package;
                const colors = deviceColors[device.device_type] || deviceColors.autre;
                const status = statusInfo[device.status];
                return (
                  <tr key={device.ip_address} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                          <Icon className={cn("h-4 w-4", colors.text)} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{device.hostname || device.name || '-'}</p>
                          <p className="text-xs text-slate-400">{device.manufacturer || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-700">{device.ip_address}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{device.device_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-1 rounded-full capitalize",
                        device.site === 'usine' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {device.site || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", status?.color)} />
                        <span className={cn("text-xs", status?.textColor)}>{status?.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {device.registered_as_asset ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Enregistré</Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-amber-500 hover:bg-amber-600"
                          onClick={() => handleRegisterDevice(device)}
                        >
                          Enregistrer
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {device.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingDevice(device); setShowForm(true); }}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={async () => {
                                if (confirm('Supprimer ?')) {
                                  await base44.entities.NetworkDevice.delete(device.id);
                                  queryClient.invalidateQueries({ queryKey: ['networkDevices'] });
                                }
                              }}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredDevices.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Aucun équipement. Lancez un scan ou ajoutez manuellement.
            </div>
          )}
        </div>
      )}

      {/* Selected Device Panel */}
      {selectedDevice && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-5 z-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = deviceIcons[selectedDevice.device_type] || Package;
                const colors = deviceColors[selectedDevice.device_type] || deviceColors.autre;
                return (
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <Icon className={cn("h-6 w-6", colors.text)} />
                  </div>
                );
              })()}
              <div>
                <p className="font-semibold text-slate-900">{selectedDevice.hostname || selectedDevice.ip_address}</p>
                <p className="text-sm text-slate-500 font-mono">{selectedDevice.ip_address}</p>
              </div>
            </div>
            <button onClick={() => setSelectedDevice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {[
              { label: 'Type', value: selectedDevice.device_type?.replace('_', ' ') },
              { label: 'OS', value: selectedDevice.os },
              { label: 'Fabricant', value: selectedDevice.manufacturer },
              { label: 'Sous-réseau', value: selectedDevice.subnet },
              { label: 'Dernière vue', value: selectedDevice.last_seen ? moment(selectedDevice.last_seen).fromNow() : 'N/A' },
            ].filter(i => i.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-800 font-medium capitalize">{value}</span>
              </div>
            ))}
          </div>
          {!selectedDevice.registered_as_asset && (
            <Button
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
              size="sm"
              onClick={() => handleRegisterDevice(selectedDevice)}
            >
              Enregistrer comme actif
            </Button>
          )}
        </div>
      )}

      <NetworkDeviceForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingDevice(null); }}
        device={editingDevice}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['networkDevices'] })}
      />
    </div>
  );
}