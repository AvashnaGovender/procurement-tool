import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import AzureADProvider from "next-auth/providers/azure-ad"
import { prisma } from "./prisma"
import { verifyPassword } from "./password"

const providers: NextAuthOptions["providers"] = [
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
]

// Add Azure AD provider when credentials are configured
if (
  process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_TENANT_ID
) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    })
  )
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: {
    strategy: "jwt",
  },
  // Explicit cookie config required when running behind an HTTPS reverse proxy
  // (IIS → Node HTTP). Without this, NextAuth auto-enables __Secure- prefixed
  // cookies based on NEXTAUTH_URL, which can break session reads server-side.
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: { sameSite: "lax", path: "/", secure: true },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
    state: {
      name: "next-auth.state",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
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
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials login: user object contains the Prisma record directly
      if (user && account?.provider === "credentials") {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        return token
      }

      // Azure AD / OAuth login: look up the internal Prisma user by email so that
      // token.id is always the internal DB id (not the Azure AD OID).
      // This runs on first sign-in (account present) and on token refresh.
      if (account?.provider === "azure-ad" || (!token.id && token.email)) {
        const email = (token.email as string | undefined)?.toLowerCase().trim()
        if (email) {
          const dbUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: { id: true, role: true, department: true, isActive: true, name: true },
          })

          if (!dbUser || !dbUser.isActive) {
            // Returning a token without id will cause getServerSession to yield
            // session.user.id = undefined, which the API correctly rejects.
            return token
          }

          token.id = dbUser.id
          token.role = dbUser.role
          token.department = dbUser.department ?? undefined
          token.name = dbUser.name

          if (account?.provider === "azure-ad") {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { lastLoginAt: new Date() },
            })
          }
        }
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

