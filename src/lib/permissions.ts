export type RestaurantRole = 'OWNER' | 'EDITOR' | 'WAITER';
export type RestaurantAction = 'viewDashboard' | 'manageMenu' | 'manageTheme' | 'toggleAvailability' | 'manageMembers';

export function canPerform(role: RestaurantRole | null | undefined, action: RestaurantAction): boolean {
  if (!role) return false;
  const permissions: Record<RestaurantRole, readonly RestaurantAction[]> = {
    OWNER: ['viewDashboard', 'manageMenu', 'manageTheme', 'toggleAvailability', 'manageMembers'],
    EDITOR: ['viewDashboard', 'manageMenu', 'manageTheme', 'toggleAvailability'],
    WAITER: ['viewDashboard', 'toggleAvailability'],
  };
  return permissions[role].includes(action);
}
