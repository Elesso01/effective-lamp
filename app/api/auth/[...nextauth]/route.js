import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

// DEV-ONLY auth: any email signs in (creates/finds a Reader row).
// No password check — replace with Email/OAuth before any hosted deploy.
export const authOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // Credentials provider requires JWT sessions on v4
  providers: [
    Credentials({
      name: "Email (dev only)",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
        await db.reader.upsert({
          where: { email },
          update: {},
          create: { email }
        });
        return { id: email, email };
      }
    })
  ]
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
