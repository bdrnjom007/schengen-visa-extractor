import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, visaApplications, InsertVisaApplication, VisaApplication } from "../../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (process.env.OWNER_OPEN_ID && user.openId === process.env.OWNER_OPEN_ID) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using onConflictDoUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: {
        name: values.name,
        email: values.email,
        loginMethod: values.loginMethod,
        role: values.role,
        lastSignedIn: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Visa Application queries
export async function createVisaApplication(data: InsertVisaApplication): Promise<VisaApplication> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(visaApplications).values(data).returning();
  return result[0];
}

export async function updateVisaApplication(id: number, data: Partial<InsertVisaApplication>): Promise<VisaApplication | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db.update(visaApplications).set(data).where(eq(visaApplications.id, id)).returning();
  return updated.length > 0 ? updated[0] : undefined;
}

export async function getVisaApplicationById(id: number): Promise<VisaApplication | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(visaApplications).where(eq(visaApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserVisaApplications(userId: number): Promise<VisaApplication[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(visaApplications).where(eq(visaApplications.userId, userId)).orderBy(desc(visaApplications.createdAt));
}

export async function deleteVisaApplication(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(visaApplications).where(eq(visaApplications.id, id));
}
