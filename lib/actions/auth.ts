'use server';

import { cookies } from 'next/headers';
import { UserRole } from '@/stores/userRoleStore';

export async function setUserRoleAction(role: UserRole) {
  const cookieStore = await cookies();
  
  cookieStore.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return { success: true };
}

export async function clearUserRoleAction() {
  const cookieStore = await cookies();
  cookieStore.delete('user_role');
  return { success: true };
}
