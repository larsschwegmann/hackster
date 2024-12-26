import spotifyProfile, { refreshAccessToken } from "./SpotifyProfile";
import { Account, AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

export type AuthUser = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  access_token: string;
  token_type: string;
  expires_at: number;
  refresh_token?: string;
  scope?: string;
  id: string;
};

const authOptions: AuthOptions = {
  providers: [spotifyProfile],
  session: {
    maxAge: 60 * 60, // 1hr
  },
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: Account | null, user: User }) {
      // if (!account || !account.access_token || !account.token_type) {
      //   return token;
      // }

      // const updatedToken = {
      //   ...token,
      //   access_token: account?.access_token,
      //   token_type: account?.token_type,
      //   expires_at: account?.expires_at ?? Date.now() / 1000,
      //   refresh_token: account?.refresh_token,
      //   scope: account?.scope,
      //   id: account?.providerAccountId,
      // };

      // if (Date.now() < updatedToken.expires_at) {
      //   return refreshAccessToken(updatedToken);
      // }

      // return updatedToken;

      if (account && user) {
        return {
          ...token,
          access_token: account.access_token,
          token_type: account.token_type,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          scope: account.scope,
          id: account.providerAccountId,
        }
      }

      if (token.expires_at && Date.now() < token.expires_at) {
        return token;
      }

      const refreshedToken = await refreshAccessToken(token);
      return refreshedToken;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const user: AuthUser = {
        ...session.user,
        access_token: token.access_token,
        token_type: token.token_type,
        expires_at: token.expires_at,
        refresh_token: token.refresh_token,
        scope: token.scope,
        id: token.id,
      };
      session.user = user;
      session.error = token.error;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;