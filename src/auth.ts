import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashBackupCode, verifyTotpCode } from "@/lib/totp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const code = (credentials?.code as string | undefined)?.trim();
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        if (user.twoFactorEnabled) {
          if (!code) return null;

          const validTotp = user.twoFactorSecret ? verifyTotpCode(user.twoFactorSecret, code) : false;
          if (!validTotp) {
            const hashed = hashBackupCode(code);
            const remaining = user.twoFactorBackupCodes.filter((c) => c !== hashed);
            if (remaining.length === user.twoFactorBackupCodes.length) return null; // no match — invalid code
            await prisma.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: remaining } });
          }
        }

        return { id: user.id, email: user.email, name: user.fullName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
