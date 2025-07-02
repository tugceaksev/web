//Bu dosya, NextAuth'ın kimlik doğrulama işlemlerini yönetir.
//Kullanıcıların giriş yapması, çıkış yapması ve diğer kimlik doğrulama işlemlerini içerir.

import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 