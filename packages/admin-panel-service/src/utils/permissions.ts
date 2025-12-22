export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
};

export const PERMISSIONS = {
    CAN_MANAGE_PROPERTIES: 'canManageProperties',
    CAN_VIEW_TRANSACTIONS: 'canViewTransactions',
    CAN_VIEW_EXPENSES: 'canViewExpenses',
    CAN_ACCESS_ANALYTICS: 'canAccessAnalytics',
    CAN_SUSPEND_USERS: 'canSuspendUsers',
};

export const DEFAULT_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: {
        canManageProperties: true,
        canViewTransactions: true,
        canViewExpenses: true,
        canAccessAnalytics: true,
        canSuspendUsers: true,
    },
    [ROLES.ADMIN]: {
        canManageProperties: true,
        canViewTransactions: true,
        canViewExpenses: true,
        canAccessAnalytics: true,
        canSuspendUsers: false,
    },
    [ROLES.MANAGER]: {
        canManageProperties: true, // Limited access handled in logic if needed
        canViewTransactions: false,
        canViewExpenses: false,
        canAccessAnalytics: true, // Restricted analytics
        canSuspendUsers: false,
    },
};
