'use client';

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      className="text-blue-500 hover:text-blue-600"
    >
      Sign Out
    </button>
  );
}
