import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { Prisma } from "@prisma/client"

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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        // Normalize email to lowercase for case-insensitive lookup
        const normalizedEmail = credentials.email.toLowerCase().trim()

        // Find user in database (case-insensitive using Prisma.sql)
        // This approach works reliably across all Prisma versions
        const users = await prisma.$queryRaw<Array<{
          id: string
          email: string
          name: string
          password: string
          role: string
          department: string | null
          isActive: boolean
          lastLoginAt: Date | null
          createdAt: Date
          updatedAt: Date
        }>>(
          Prisma.sql`SELECT * FROM "users" WHERE LOWER(email) = LOWER(${normalizedEmail}) LIMIT 1`
        )
        const user = users[0] || null

        if (!user) {
          throw new Error("Invalid email or password")
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is inactive. Please contact administrator.")
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        // Return user object (will be stored in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department ?? undefined,
        }
      }
    })
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

