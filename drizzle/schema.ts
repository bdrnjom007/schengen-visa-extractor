import { serial, text, timestamp, varchar, boolean, pgTable, pgEnum } from "drizzle-orm/pg-core";

/**
 * Enums
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["draft", "completed", "submitted"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Visa applications table - stores extracted data from documents
 */
export const visaApplications = pgTable("visa_applications", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  
  // Passport data
  passportNumber: varchar("passportNumber", { length: 50 }),
  passportImageUrl: text("passportImageUrl"),
  fullNameEnglish: varchar("fullNameEnglish", { length: 255 }),
  fullNameArabic: varchar("fullNameArabic", { length: 255 }),
  nationality: varchar("nationality", { length: 100 }),
  dateOfBirth: varchar("dateOfBirth", { length: 50 }),
  passportIssueDate: varchar("passportIssueDate", { length: 50 }),
  passportExpiryDate: varchar("passportExpiryDate", { length: 50 }),
  placeOfBirth: varchar("placeOfBirth", { length: 255 }),
  gender: varchar("gender", { length: 20 }),
  
  // Flight ticket data
  flightTicketImageUrl: text("flightTicketImageUrl"),
  departureDate: varchar("departureDate", { length: 50 }),
  returnDate: varchar("returnDate", { length: 50 }),
  destination: varchar("destination", { length: 255 }),
  flightNumber: varchar("flightNumber", { length: 50 }),
  bookingReference: varchar("bookingReference", { length: 100 }),
  airline: varchar("airline", { length: 255 }),
  
  // Hotel confirmation data
  hotelConfirmationImageUrl: text("hotelConfirmationImageUrl"),
  hotelName: varchar("hotelName", { length: 255 }),
  hotelAddressEnglish: text("hotelAddressEnglish"),
  hotelAddressArabic: text("hotelAddressArabic"),
  hotelPhone: varchar("hotelPhone", { length: 50 }),
  hotelEmail: varchar("hotelEmail", { length: 320 }),
  checkInDate: varchar("checkInDate", { length: 50 }),
  checkOutDate: varchar("checkOutDate", { length: 50 }),
  hotelBookingReference: varchar("hotelBookingReference", { length: 100 }),
  
  // Manual input fields
  currentAddressEnglish: text("currentAddressEnglish"),
  currentAddressArabic: text("currentAddressArabic"),
  mobileNumber: varchar("mobileNumber", { length: 50 }),
  email: varchar("email", { length: 320 }),
  nationalIdNumber: varchar("nationalIdNumber", { length: 50 }),
  occupation: varchar("occupation", { length: 255 }),
  
  // Additional Schengen visa fields
  purposeOfTravel: varchar("purposeOfTravel", { length: 255 }),
  numberOfEntries: varchar("numberOfEntries", { length: 50 }),
  durationOfStay: varchar("durationOfStay", { length: 50 }),
  destinationCountry: varchar("destinationCountry", { length: 100 }),
  applicationDatePlace: varchar("applicationDatePlace", { length: 255 }),
  departureCity: varchar("departureCity", { length: 100 }),
  employerName: varchar("employerName", { length: 255 }),
  employerLocation: varchar("employerLocation", { length: 255 }),
  maritalStatus: varchar("maritalStatus", { length: 50 }),
  previousSchengenVisa: varchar("previousSchengenVisa", { length: 10 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressDistrict: varchar("addressDistrict", { length: 100 }),
  addressStreet: varchar("addressStreet", { length: 255 }),
  
  // Status and metadata
  status: statusEnum("status").default("draft").notNull(),
  extractionCompleted: boolean("extractionCompleted").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VisaApplication = typeof visaApplications.$inferSelect;
export type InsertVisaApplication = typeof visaApplications.$inferInsert;
