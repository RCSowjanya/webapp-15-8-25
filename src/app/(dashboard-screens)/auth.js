// lib/auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'phone-credentials',
      name: 'Phone Login',
      credentials: {
        phone: { label: "Phone", type: "text" },
        countryCode: { label: "Country Code", type: "text" },
        token: { label: "Token", type: "text" },
        userData: { label: "User Data", type: 'text' }
      },
      async authorize(credentials) {
        try {
          const { token, userData } = credentials;

          if (!token || !userData) {
           // console.log('Missing token or userData in credentials');
            return null;
          }

          const parsed = JSON.parse(userData);
          const data = parsed.data;

          return {
            id: data._id,
            name: `${data.fname} ${data.lname}`,
            email: data.email,
            image: data.image,
            phone: data.phone,
            countryCode: data.countryCode,
            userType: data.userType,
            isInvitedUser: data.isInvitedUser,
            isHost: data.userType === 2,
            businessUserType: data.businessUserType,
            isIdentityVerified: data.isIdentityverified,
            token: parsed.token,

            fname: data.fname,
            lname: data.lname,
            isEmailVerified: data.isEmailVerified,
            isMobileVerified: data.isMobileVerified,
            isBusinessDetailsFilled: data.isBusinessDetailsFilled,
            termsAccepted: data.termsAccepted,
            isActive: data.isActive,
            propertyType: data.propertyType,
            units: data.units,

            personBasicInfo: data.personBasicInfo,
            personIdInfo: data.personIdInfo,
            notificationPreference: data.notificationPreference,
            isEnglishLanguage: data.isEnglishLanguage
          };
        } catch (error) {
          console.error("Auth.js authorize error:", error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
       // console.log("user at auth is", user)
        token.accessToken = user.token;
        token.userType = user.userType;
        token.isInvitedUser = user.isInvitedUser;
        token.isHost = user.isHost;
        token.phone = user.phone;
        token.countryCode = user.countryCode;
        token.businessUserType = user.businessUserType;
        token.isIdentityVerified = user.isIdentityVerified;
        token.fname = user.fname;
        token.lname = user.lname;
        token.isEmailVerified = user.isEmailVerified;
        token.isMobileVerified = user.isMobileVerified;
        token.isBusinessDetailsFilled = user.isBusinessDetailsFilled;
        token.termsAccepted = user.termsAccepted;
        token.isActive = user.isActive;
        token.propertyType = user.propertyType;
        token.units = user.units;
        token.personBasicInfo = user.personBasicInfo;
        token.personIdInfo = user.personIdInfo;
        token.notificationPreference = user.notificationPreference;
        token.isEnglishLanguage = user.isEnglishLanguage;
      }
      return token;
    },

    async session({ session, token }) {
      //console.log("token at auth is", token)
      session.token = token.accessToken;
      session.user.userType = token.userType;
      session.user.isInvitedUser = token.isInvitedUser;
      session.user.isHost = token.isHost;
      session.user.phone = token.phone;
      session.user.countryCode = token.countryCode;
      session.user.businessUserType = token.businessUserType;
      session.user.isIdentityVerified = token.isIdentityVerified;
      session.user.fname = token.fname;
      session.user.lname = token.lname;
      session.user.isEmailVerified = token.isEmailVerified;
      session.user.isMobileVerified = token.isMobileVerified;
      session.user.isBusinessDetailsFilled = token.isBusinessDetailsFilled;
      session.user.termsAccepted = token.termsAccepted;
      session.user.isActive = token.isActive;
      session.user.propertyType = token.propertyType;
      session.user.units = token.units;
      session.user.personBasicInfo = token.personBasicInfo;
      session.user.personIdInfo = token.personIdInfo;
      session.user.notificationPreference = token.notificationPreference;
      session.user.isEnglishLanguage = token.isEnglishLanguage;
     // console.log("session at auth is", session)
      return session;
    }
  },

  pages: {
    signIn: '/login',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  secret: process.env.AUTH_SECRET,
  trustHost:
  process.env.NEXTAUTH_TRUST_HOST === "true"
    ? true
    : ["internal.cept.gov.in:3000"],
});
