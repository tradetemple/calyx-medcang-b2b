import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setUserRoleAction, clearUserRoleAction } from '@/lib/actions/auth';

export type UserRole = 'guest' | 'verified_pharmacy' | 'medical_doctor';

interface UserRoleState {
  userRole: UserRole;
  identifier: string;
  isLoaded: boolean;
  setUserRole: (role: UserRole) => void;
  clearUserRole: () => void;
}

const isBrowser = typeof window !== 'undefined';

const getIdentifierForRole = (role: UserRole): string => {
  switch (role) {
    case 'verified_pharmacy':
      return 'DE-BTM-88291';
    case 'medical_doctor':
      return 'LANR-442011';
    default:
      return 'UNAUTHORIZED';
  }
};

export const useUserRoleStore = create<UserRoleState>()(
  persist(
    (set) => ({
      userRole: 'guest',
      identifier: 'UNAUTHORIZED',
      isLoaded: true,
      setUserRole: (role: UserRole) => {
        const identifier = getIdentifierForRole(role);
        set({ userRole: role, identifier });
        setUserRoleAction(role).catch(console.error);
      },
      clearUserRole: () => {
        set({ userRole: 'guest', identifier: 'UNAUTHORIZED' });
        clearUserRoleAction().catch(console.error);
      }
    }),
    {
      name: 'user-role-storage',
      storage: createJSONStorage(() => {
        if (isBrowser) {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }),
      skipHydration: true
    }
  )
);
