import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
  }

  interface Session {
    user?: User & {
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
  }
}
