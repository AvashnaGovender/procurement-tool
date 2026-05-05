import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { verifyPassword } from "./password"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth Error:', code, metadata);
    },
    warn: (code) => {
      console.warn('NextAuth Warning:', code);
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === "development") {
        console.log('NextAuth Debug:', code, metadata);
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required")
        }
        if (!credentials?.password?.trim()) {
          throw new Error("Password is required")
        }

        // Normalize email to lowercase for case-insensitive lookup
        const normalizedEmail = credentials.email.toLowerCase().trim()
        const password = credentials.password

        const user = await prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: "insensitive" } },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            department: true,
            isActive: true,
            password: true,
          },
        })

        if (!user) {
          throw new Error("No account found with this email")
        }

        if (!user.isActive) {
          throw new Error("Account is inactive. Please contact administrator.")
        }

        const passwordOk =
          !!user.password && (await verifyPassword(password, user.password))
        if (!passwordOk) {
          throw new Error("Invalid email or password")
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string
      }
      return session
    }
  },
  events: {
    async signOut() {
      // Clean up any session data here if needed
    }
  }
}

