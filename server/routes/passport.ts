import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        if (!db) return done(new Error('Database not configured'));
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value ?? null;
          const displayName = profile.displayName ?? null;

          // Check if user exists by googleId
          const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId));

          if (existing) {
            done(null, existing);
            return;
          }

          // Create new user with teacher role
          const username = `google_${googleId}`;
          const [newUser] = await db
            .insert(users)
            .values({
              username,
              passwordHash: '', // No password for OAuth users
              email,
              googleId,
              displayName,
              role: 'teacher',
            })
            .returning();

          done(null, newUser);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    if (!db) return done(new Error('Database not configured'));
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user ?? null);
    } catch (err) {
      done(err);
    }
  });
}
