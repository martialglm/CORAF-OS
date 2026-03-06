import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let cachedUser = null;

export function useCurrentUser() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    if (cachedUser) return;
    base44.auth.me().then(u => {
      cachedUser = u;
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const role = user?.role || 'client';
  const department = user?.department || '';
  const site = user?.site || '';

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isSuperviseur = role === 'superviseur';
  const isTechnicien = role === 'technicien';
  const isClient = role === 'client';
  const isVigile = role === 'vigile';
  const isIT = department === 'informatique';

  // Tickets
  const canSeeAllTickets = isAdmin || isSuperAdmin;
  const canAssignTickets = isAdmin || isSuperviseur;
  const canTreatTickets = isAdmin || isSuperviseur || isTechnicien;

  // Assets
  const canManageAssets = isAdmin || (isIT && (isSuperviseur || isTechnicien));
  const canViewAssets = isAdmin || isSuperviseur || isTechnicien || isIT;

  // Badges
  const canManageBadges = isAdmin || isIT;

  // Users
  const canManageUsers = isSuperAdmin || isAdmin;

  // Finance / RH (admin uniquement)
  const canViewFinance = isAdmin;
  const canViewHR = isAdmin || isSuperviseur;

  // Scope de visualisation tickets / actifs
  const getTicketFilter = (allTickets) => {
    if (isSuperAdmin || isAdmin) return allTickets;
    if (isSuperviseur) return allTickets.filter(t =>
      t.requester_department === department || t.target_department === department || t.supervisor_email === user?.email
    );
    if (isTechnicien) return allTickets.filter(t =>
      t.assigned_agents?.includes(user?.email) || t.assigned_to === user?.email
    );
    // client
    return allTickets.filter(t => t.requester_email === user?.email || t.created_by === user?.email);
  };

  const getAssetFilter = (allAssets) => {
    if (isSuperAdmin || isAdmin) return allAssets;
    if (isSuperviseur || isTechnicien) {
      // Voit les actifs de son site + ceux assignés à lui
      return allAssets.filter(a => a.location === site || a.assigned_to === user?.email);
    }
    // Client : voit uniquement les actifs assignés à lui
    return allAssets.filter(a => a.assigned_to === user?.email);
  };

  return {
    user,
    loading,
    role,
    department,
    site,
    isSuperAdmin,
    isAdmin,
    isSuperviseur,
    isTechnicien,
    isClient,
    isVigile,
    isIT,
    canSeeAllTickets,
    canAssignTickets,
    canTreatTickets,
    canManageAssets,
    canViewAssets,
    canManageBadges,
    canManageUsers,
    canViewFinance,
    canViewHR,
    getTicketFilter,
    getAssetFilter,
  };
}