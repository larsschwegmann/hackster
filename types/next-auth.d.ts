import { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            access_token: string
            token_type: string
            expires_at: number
            refresh_token?: string
            scope?: string
            id: string
        } & DefaultSession["user"]
        error?: unknown
    }
}



declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT extends Record<string, unknown>, DefaultJWT {
        /** OpenID ID Token */
        access_token: string
        token_type: string
        expires_at: number
        refresh_token?: string
        scope?: string
        id: string
    }
}