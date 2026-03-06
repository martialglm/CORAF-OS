import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LogIn, LogOut, Building2, Users, Clock, Search, Scan, CheckCircle2, XCircle, ShieldAlert, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import { useCurrentUser } from '@/components/common/useCurrentUser';
import { Skeleton } from "@/components/ui/skeleton";
import BadgeManagement from '@/components/access/BadgeManagement';
import VisitorRegistration from '@/components/access/VisitorRegistration';

export default function AccessControl() {
  const { user, isAdmin, isVigile, isIT, isSuperviseur } = useCurrentUser();
  const [badgeInput, setBadgeInput] = useState('');
  const [scanResult, setScanResult] = useState(null); // {status: 'success'|'error', person, action}
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [showVisitor, setShowVisitor] = useState(false);
  const badgeInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Auto-focus on badge input
  useEffect(() => {
    if (badgeInputRef.current) badgeInputRef.current.focus();
  }, []);

  const { data: accessLogs = [], isLoading } = useQuery({
    queryKey: ['accessLogs'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 200)
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list()
  });

  // Simulate badge scan
  const handleBadgeScan = async (e) => {
    e.preventDefault();
    if (!badgeInput.trim()) return;
    setScanning(true);
    setScanResult(null);

    // Find badge in DB
    const badge = badges.find(b => b.badge_number === badgeInput.trim());
    
    await new Promise(r => setTimeout(r, 600)); // Simulate scan delay

    if (!badge) {
      setScanResult({ status: 'error', message: `Badge "${badgeInput}" inconnu ou non enregistré`, badge_number: badgeInput });
      setScanning(false);
      setBadgeInput('');
      return;
    }

    if (badge.status !== 'actif') {
      setScanResult({ status: 'error', message: `Badge "${badgeInput}" — Statut: ${badge.status}. Accès refusé.`, badge_number: badgeInput });
      setScanning(false);
      setBadgeInput('');
      return;
    }

    // Determine entry/exit based on last log
    const lastLog = accessLogs.find(l => l.badge_number === badgeInput.trim());
    const action = lastLog?.action === 'entree' ? 'sortie' : 'entree';
    const site = badge.access_sites?.[0] || 'direction';

    // Create access log
    await base44.entities.AccessLog.create({
      employee_name: badge.owner_name,
      badge_number: badge.badge_number,
      site: site,
      entry_point: 'entree_principale',
      action,
      timestamp: new Date().toISOString(),
      is_visitor: badge.type === 'visiteur',
      visitor_name: badge.type === 'visiteur' ? badge.owner_name : undefined,
    });

    setScanResult({
      status: 'success',
      action,
      person: badge.owner_name,
      site,
      badge_number: badge.badge_number,
    });
    queryClient.invalidateQueries({ queryKey: ['accessLogs'] });
    setScanning(false);
    setBadgeInput('');

    // Auto-clear result after 4 seconds
    setTimeout(() => setScanResult(null), 4000);
  };

  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = !search ||
      log.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.badge_number?.toLowerCase().includes(search.toLowerCase());
    const matchesSite = siteFilter === 'all' || log.site === siteFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesSite && matchesAction;
  });

  const todayLogs = accessLogs.filter(log =>
    moment(log.timestamp || log.created_date).isSame(moment(), 'day')
  );

  const stats = {
    totalToday: todayLogs.length,
    entreesToday: todayLogs.filter(l => l.action === 'entree').length,
    sortiesToday: todayLogs.filter(l => l.action === 'sortie').length,
    visitorsToday: todayLogs.filter(l => l.is_visitor).length,
  };

  // Only vigile & admin can scan badges + see logs
  // IT dept (superviseur/technicien) can manage badges
  const canScan = isAdmin || isVigile;
  const canManageBadges = isAdmin || (isIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contrôle d'accès</h1>
          <p className="text-slate-500 mt-1">Gestion des entrées/sorties — Usine & Direction</p>
        </div>
        <div className="flex gap-2">
          {canScan && (
            <Button variant="outline" onClick={() => setShowVisitor(true)}>
              <Users className="h-4 w-4 mr-2" />
              Visiteur
            </Button>
          )}
        </div>
      </div>

      {/* Role info */}
      {isVigile && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-blue-800">
          <ShieldAlert className="h-4 w-4" />
          Mode Vigile — Scannez les badges pour enregistrer les entrées/sorties
        </div>
      )}
      {canManageBadges && !isVigile && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-violet-800">
          <ShieldAlert className="h-4 w-4" />
          Mode IT — Vous pouvez gérer les badges (activation, création, désactivation)
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mouvements aujourd\'hui', value: stats.totalToday, icon: Clock, color: 'slate' },
          { label: 'Entrées', value: stats.entreesToday, icon: LogIn, color: 'emerald' },
          { label: 'Sorties', value: stats.sortiesToday, icon: LogOut, color: 'red' },
          { label: 'Visiteurs', value: stats.visitorsToday, icon: Users, color: 'violet' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-50 rounded-xl`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue={canScan ? "scan" : (canManageBadges ? "badges" : "logs")}>
        <TabsList className="bg-white border">
          {canScan && (
            <TabsTrigger value="scan">
              <Scan className="h-4 w-4 mr-2" />
              Scanner badge
            </TabsTrigger>
          )}
          <TabsTrigger value="logs">
            <Clock className="h-4 w-4 mr-2" />
            Journal d'accès
          </TabsTrigger>
          {canManageBadges && (
            <TabsTrigger value="badges">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Gestion badges (IT)
            </TabsTrigger>
          )}
        </TabsList>

        {/* SCAN TAB */}
        {canScan && (
          <TabsContent value="scan" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Scan className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Scan de badge</h2>
                  <p className="text-slate-500 mt-1">Passez le badge devant le lecteur ou saisissez le numéro</p>
                </div>

                <form onSubmit={handleBadgeScan} className="space-y-4">
                  <div className="relative">
                    <Input
                      ref={badgeInputRef}
                      value={badgeInput}
                      onChange={(e) => setBadgeInput(e.target.value)}
                      placeholder="Numéro de badge (ex: B-001)"
                      className="text-center text-2xl font-mono h-16 text-slate-900 border-2 focus:border-blue-500"
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={scanning || !badgeInput.trim()}
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {scanning ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Vérification...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Scan className="h-5 w-5" />
                        Valider le badge
                      </span>
                    )}
                  </Button>
                </form>

                {/* Scan Result */}
                {scanResult && (
                  <div className={cn(
                    "mt-6 p-6 rounded-2xl border-2 text-center transition-all",
                    scanResult.status === 'success'
                      ? scanResult.action === 'entree'
                        ? "bg-emerald-50 border-emerald-400"
                        : "bg-red-50 border-red-400"
                      : "bg-red-50 border-red-400"
                  )}>
                    {scanResult.status === 'success' ? (
                      <>
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3",
                          scanResult.action === 'entree' ? "bg-emerald-500" : "bg-red-500"
                        )}>
                          {scanResult.action === 'entree'
                            ? <LogIn className="h-7 w-7 text-white" />
                            : <LogOut className="h-7 w-7 text-white" />
                          }
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{scanResult.person}</p>
                        <p className={cn("text-lg font-medium mt-1", scanResult.action === 'entree' ? "text-emerald-700" : "text-red-700")}>
                          {scanResult.action === 'entree' ? '✅ ENTRÉE' : '🚪 SORTIE'} — {scanResult.site}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">{moment().format('HH:mm:ss')}</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-14 w-14 text-red-500 mx-auto mb-3" />
                        <p className="text-lg font-bold text-red-800">Accès refusé</p>
                        <p className="text-sm text-red-600 mt-1">{scanResult.message}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Recent movements */}
                <div className="mt-6">
                  <h3 className="font-medium text-slate-700 mb-3">Derniers mouvements</h3>
                  <div className="space-y-2">
                    {accessLogs.slice(0, 5).map((log, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className={cn("p-1.5 rounded-lg", log.action === 'entree' ? "bg-emerald-100" : "bg-red-100")}>
                          {log.action === 'entree'
                            ? <LogIn className="h-4 w-4 text-emerald-600" />
                            : <LogOut className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {log.is_visitor ? log.visitor_name : log.employee_name}
                          </p>
                          <p className="text-xs text-slate-400">{moment(log.timestamp || log.created_date).format('HH:mm')} — {log.site}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{log.badge_number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        )}

        {/* LOGS TAB */}
        <TabsContent value="logs" className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Site" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous sites</SelectItem>
                  <SelectItem value="usine">Usine</SelectItem>
                  <SelectItem value="direction">Direction</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="entree">Entrées</SelectItem>
                  <SelectItem value="sortie">Sorties</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Heure</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Personne</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Badge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">Aucun mouvement trouvé</TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-sm">
                        {moment(log.timestamp || log.created_date).format('DD/MM HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={log.action === 'entree' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                          {log.action === 'entree' ? <><LogIn className="h-3 w-3 mr-1" />Entrée</> : <><LogOut className="h-3 w-3 mr-1" />Sortie</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.is_visitor ? log.visitor_name : log.employee_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={log.is_visitor ? "text-violet-600" : ""}>
                          {log.is_visitor ? 'Visiteur' : 'Employé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{log.site}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{log.badge_number || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* BADGES TAB (IT only) */}
        {canManageBadges && (
          <TabsContent value="badges">
            <BadgeManagement employees={employees} />
          </TabsContent>
        )}
      </Tabs>

      {showVisitor && (
        <VisitorRegistration
          open={showVisitor}
          onClose={() => setShowVisitor(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['accessLogs'] })}
        />
      )}
    </div>
  );
}