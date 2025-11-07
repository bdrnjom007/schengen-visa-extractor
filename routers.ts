import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createVisaApplication, 
  updateVisaApplication, 
  getVisaApplicationById, 
  getUserVisaApplications,
  deleteVisaApplication 
} from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  visa: router({
    // Create new visa application
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const application = await createVisaApplication({
        userId: ctx.user.id,
        status: "draft",
        extractionCompleted: false,
      });
      return application;
    }),

    // Get user's visa applications
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserVisaApplications(ctx.user.id);
    }),

    // Get single visa application
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const application = await getVisaApplicationById(input.id);
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("Application not found");
        }
        return application;
      }),

    // Upload and extract data from image
    extractFromImage: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        imageType: z.enum(["passport", "flight", "hotel"]),
        imageBase64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { applicationId, imageType, imageBase64, mimeType } = input;

        // Verify ownership
        const application = await getVisaApplicationById(applicationId);
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("Application not found");
        }

        // Upload image to S3
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const fileExtension = mimeType.split('/')[1];
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `visa-docs/${ctx.user.id}/${imageType}-${randomSuffix}.${fileExtension}`;
        
        const { url: imageUrl } = await storagePut(fileKey, imageBuffer, mimeType);

        // Prepare content for LLM - support both images and PDFs
        const isPDF = mimeType === 'application/pdf';
        const contentType = isPDF ? 'file_url' : 'image_url';
        
        // Extract data using LLM with vision
        let extractionPrompt = "";
        let updateData: any = {};

        if (imageType === "passport") {
          extractionPrompt = `Extract all information from this passport document (image or PDF). Return a JSON object with these fields:
{
  "passportNumber": "passport number",
  "fullNameEnglish": "full name in English",
  "fullNameArabic": "full name in Arabic if available, otherwise null",
  "nationality": "nationality",
  "dateOfBirth": "date of birth in YYYY-MM-DD format",
  "passportIssueDate": "issue date in YYYY-MM-DD format",
  "passportExpiryDate": "expiry date in YYYY-MM-DD format",
  "placeOfBirth": "place of birth",
  "gender": "gender (Male/Female)"
}
If any field is not visible or unclear, use null. Translate Arabic text to English where needed.`;
          
        } else if (imageType === "flight") {
          extractionPrompt = `Extract all flight information from this ticket/booking confirmation document (image or PDF). Return a JSON object with these fields:
{
  "departureDate": "departure date in YYYY-MM-DD format",
  "returnDate": "return date in YYYY-MM-DD format if available, otherwise null",
  "destination": "destination city/country in English",
  "flightNumber": "flight number",
  "bookingReference": "booking reference/PNR",
  "airline": "airline name in English"
}
If any field is not visible, use null. Translate to English if needed.`;
          
        } else if (imageType === "hotel") {
          extractionPrompt = `Extract all hotel information from this confirmation document (image or PDF). Return a JSON object with these fields:
{
  "hotelName": "hotel name in English",
  "hotelAddressEnglish": "full hotel address in English",
  "hotelAddressArabic": "full hotel address in Arabic if available, otherwise null",
  "hotelPhone": "hotel phone number",
  "hotelEmail": "hotel email address",
  "checkInDate": "check-in date in YYYY-MM-DD format",
  "checkOutDate": "check-out date in YYYY-MM-DD format",
  "hotelBookingReference": "booking reference number"
}
If any field is not visible, use null. Translate to English if needed.`;
        }

        console.log(`[Extraction] Starting extraction for ${imageType}`);
        console.log(`[Extraction] File URL: ${imageUrl}`);
        console.log(`[Extraction] MIME Type: ${mimeType}`);
        console.log(`[Extraction] Is PDF: ${isPDF}`);
        
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: extractionPrompt },
                  isPDF 
                    ? { type: "file_url", file_url: { url: imageUrl, mime_type: "application/pdf" } }
                    : { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "document_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: imageType === "passport" ? {
                    passportNumber: { type: ["string", "null"] },
                    fullNameEnglish: { type: ["string", "null"] },
                    fullNameArabic: { type: ["string", "null"] },
                    nationality: { type: ["string", "null"] },
                    dateOfBirth: { type: ["string", "null"] },
                    passportIssueDate: { type: ["string", "null"] },
                    passportExpiryDate: { type: ["string", "null"] },
                    placeOfBirth: { type: ["string", "null"] },
                    gender: { type: ["string", "null"] }
                  } : imageType === "flight" ? {
                    departureDate: { type: ["string", "null"] },
                    returnDate: { type: ["string", "null"] },
                    destination: { type: ["string", "null"] },
                    flightNumber: { type: ["string", "null"] },
                    bookingReference: { type: ["string", "null"] },
                    airline: { type: ["string", "null"] }
                  } : {
                    hotelName: { type: ["string", "null"] },
                    hotelAddressEnglish: { type: ["string", "null"] },
                    hotelAddressArabic: { type: ["string", "null"] },
                    hotelPhone: { type: ["string", "null"] },
                    hotelEmail: { type: ["string", "null"] },
                    checkInDate: { type: ["string", "null"] },
                    checkOutDate: { type: ["string", "null"] },
                    hotelBookingReference: { type: ["string", "null"] }
                  },
                  required: [],
                  additionalProperties: false
                }
              }
            }
          });

          console.log(`[Extraction] LLM Response received`);
          console.log(`[Extraction] Response has choices:`, !!response?.choices);
          console.log(`[Extraction] Choices count:`, response?.choices?.length || 0);
          
          if (!response || !response.choices || response.choices.length === 0) {
            throw new Error('Invalid LLM response: no choices returned');
          }
          
          if (!response.choices[0].message) {
            throw new Error('Invalid LLM response: no message in choice');
          }
          
          const messageContent = response.choices[0].message.content;
          console.log(`[Extraction] Message content type: ${typeof messageContent}`);
          console.log(`[Extraction] Message content:`, messageContent);
          
          const extractedData = JSON.parse(typeof messageContent === 'string' ? messageContent : "{}");
          console.log(`[Extraction] Parsed data:`, extractedData);

          // Update application with extracted data and image URL
          if (imageType === "passport") {
            updateData = {
              passportImageUrl: imageUrl,
              ...extractedData
            };
          } else if (imageType === "flight") {
            updateData = {
              flightTicketImageUrl: imageUrl,
              ...extractedData
            };
          } else if (imageType === "hotel") {
            updateData = {
              hotelConfirmationImageUrl: imageUrl,
              ...extractedData
            };
          }

          const updated = await updateVisaApplication(applicationId, updateData);
          return { success: true, data: updated };

        } catch (error) {
          console.error("[Extraction Error] Type:", imageType);
          console.error("[Extraction Error] Details:", error);
          console.error("[Extraction Error] Image URL:", imageUrl);
          console.error("[Extraction Error] MIME Type:", mimeType);
          
          // Save image URL even if extraction fails
          const fallbackUpdate = imageType === "passport" 
            ? { passportImageUrl: imageUrl }
            : imageType === "flight"
            ? { flightTicketImageUrl: imageUrl }
            : { hotelConfirmationImageUrl: imageUrl };
          
          await updateVisaApplication(applicationId, fallbackUpdate);
          
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Failed to extract data: ${errorMessage}`);
        }
      }),

    // Process text input with AI
    processTextInput: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        textType: z.enum(["passport", "flight", "hotel", "additional"]),
        rawText: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { applicationId, textType, rawText } = input;

        // Verify ownership
        const application = await getVisaApplicationById(applicationId);
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("Application not found");
        }

        let extractionPrompt = "";
        let updateData: any = {};

        if (textType === "passport") {
          extractionPrompt = `You are given raw text from a passport. Extract and organize the information, translate any Arabic text to English, and return a JSON object with these fields:
{
  "passportNumber": "passport number",
  "fullNameEnglish": "full name in English",
  "fullNameArabic": "full name in Arabic if available, otherwise null",
  "nationality": "nationality in English",
  "dateOfBirth": "date of birth in YYYY-MM-DD format",
  "passportIssueDate": "issue date in YYYY-MM-DD format",
  "passportExpiryDate": "expiry date in YYYY-MM-DD format",
  "placeOfBirth": "place of birth in English",
  "gender": "Male or Female"
}

Raw text:
${rawText}

If any field is not found, use null.`;
          
        } else if (textType === "flight") {
          extractionPrompt = `You are given raw text from a flight ticket or booking confirmation. Extract and organize the information, translate any Arabic text to English, and return a JSON object with these fields:
{
  "departureDate": "departure date in YYYY-MM-DD format",
  "returnDate": "return date in YYYY-MM-DD format if available, otherwise null",
  "destination": "destination city/country in English",
  "flightNumber": "flight number",
  "bookingReference": "booking reference number",
  "airline": "airline name in English"
}

Raw text:
${rawText}

If any field is not found, use null.`;
          
        } else if (textType === "hotel") {
          extractionPrompt = `You are given raw text from a hotel confirmation. Extract and organize the information, translate any Arabic text to English, and return a JSON object with these fields:
{
  "hotelName": "hotel name in English",
  "hotelAddressEnglish": "full hotel address in English",
  "hotelAddressArabic": "full hotel address in Arabic if available, otherwise null",
  "hotelPhone": "hotel phone number",
  "hotelEmail": "hotel email address",
  "checkInDate": "check-in date in YYYY-MM-DD format",
  "checkOutDate": "check-out date in YYYY-MM-DD format",
  "hotelBookingReference": "booking reference number"
}

Raw text:
${rawText}

If any field is not found, use null.`;
        } else if (textType === "additional") {
          extractionPrompt = `You are given raw text containing additional personal information for a Schengen visa application. Extract and organize the information, translate any Arabic text to English, and return a JSON object with these fields:
{
  "fullNameArabic": "traveler name in Arabic (اسم المسافر)",
  "fullNameEnglish": "traveler name in English",
  "destinationCountry": "destination country (الدولة المطلوبة) in English",
  "applicationDatePlace": "application date and place (تاريخ ومكان التقديم) in format 'YYYY-MM-DD, City'",
  "departureDate": "expected travel date (تاريخ السفر المتوقع) in YYYY-MM-DD format",
  "departureCity": "departure city (مدينة المغادرة) in English",
  "mobileNumber": "mobile number (جوال)",
  "email": "email address (ايميل)",
  "employerName": "employer name (جهة العمل) in English",
  "employerLocation": "employer location (مكان جهة العمل) in English",
  "maritalStatus": "marital status (متزوج ام أعزب) - use 'Married' or 'Single' in English",
  "previousSchengenVisa": "previous Schengen visa (تأشيرة شنغن سابقة) - use 'Yes' or 'No'",
  "addressCity": "city (المدينة) in English",
  "addressDistrict": "district/neighborhood (الحي) in English",
  "addressStreet": "street name (الشارع) in English",
  "currentAddressEnglish": "full current address in English",
  "currentAddressArabic": "full current address in Arabic if available",
  "nationalIdNumber": "national ID number",
  "occupation": "occupation in English",
  "purposeOfTravel": "purpose of travel in English",
  "numberOfEntries": "number of entries (Single/Multiple)",
  "durationOfStay": "duration of stay in days"
}

Raw text:
${rawText}

Important instructions:
- Extract ALL information carefully from the text
- Translate Arabic text to English
- For dates, convert to YYYY-MM-DD format (e.g., "٣١ مايو" becomes "2025-05-31")
- For marital status: "متزوج" = "Married", "أعزب" = "Single"
- For previous visa: "نعم" = "Yes", "لا" = "No"
- Combine city, district, and street to create currentAddressEnglish
- If any field is not found in the text, use null
`;
        }

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: extractionPrompt
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "text_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: textType === "passport" ? {
                    passportNumber: { type: "string" },
                    fullNameEnglish: { type: "string" },
                    fullNameArabic: { type: "string" },
                    nationality: { type: "string" },
                    dateOfBirth: { type: "string" },
                    passportIssueDate: { type: "string" },
                    passportExpiryDate: { type: "string" },
                    placeOfBirth: { type: "string" },
                    gender: { type: "string" }
                  } : textType === "flight" ? {
                    departureDate: { type: "string" },
                    returnDate: { type: "string" },
                    destination: { type: "string" },
                    flightNumber: { type: "string" },
                    bookingReference: { type: "string" },
                    airline: { type: "string" }
                  } : textType === "hotel" ? {
                    hotelName: { type: "string" },
                    hotelAddressEnglish: { type: "string" },
                    hotelAddressArabic: { type: "string" },
                    hotelPhone: { type: "string" },
                    hotelEmail: { type: "string" },
                    checkInDate: { type: "string" },
                    checkOutDate: { type: "string" },
                    hotelBookingReference: { type: "string" }
                  } : {
                    fullNameArabic: { type: "string" },
                    fullNameEnglish: { type: "string" },
                    destinationCountry: { type: "string" },
                    applicationDatePlace: { type: "string" },
                    departureDate: { type: "string" },
                    departureCity: { type: "string" },
                    mobileNumber: { type: "string" },
                    email: { type: "string" },
                    employerName: { type: "string" },
                    employerLocation: { type: "string" },
                    maritalStatus: { type: "string" },
                    previousSchengenVisa: { type: "string" },
                    addressCity: { type: "string" },
                    addressDistrict: { type: "string" },
                    addressStreet: { type: "string" },
                    currentAddressEnglish: { type: "string" },
                    currentAddressArabic: { type: "string" },
                    nationalIdNumber: { type: "string" },
                    occupation: { type: "string" },
                    purposeOfTravel: { type: "string" },
                    numberOfEntries: { type: "string" },
                    durationOfStay: { type: "string" }
                  },
                  required: [],
                  additionalProperties: false
                }
              }
            }
          });

          if (!response || !response.choices || response.choices.length === 0) {
            throw new Error('Invalid LLM response');
          }

          const messageContent = response.choices[0].message.content;
          const extractedData = JSON.parse(typeof messageContent === 'string' ? messageContent : "{}");

          updateData = extractedData;
          
          // If processing additional data, don't overwrite passport name fields
          if (textType === "additional") {
            delete updateData.fullNameEnglish;
            delete updateData.fullNameArabic;
          }
          
          const updated = await updateVisaApplication(applicationId, updateData);
          return { success: true, data: updated };

        } catch (error) {
          console.error("[Text Processing Error]:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Failed to process text: ${errorMessage}`);
        }
      }),

    // Update manual fields
    updateManualFields: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        // Passport fields
        passportNumber: z.string().optional(),
        fullNameEnglish: z.string().optional(),
        fullNameArabic: z.string().optional(),
        nationality: z.string().optional(),
        dateOfBirth: z.string().optional(),
        passportIssueDate: z.string().optional(),
        passportExpiryDate: z.string().optional(),
        placeOfBirth: z.string().optional(),
        gender: z.string().optional(),
        // Flight fields
        departureDate: z.string().optional(),
        returnDate: z.string().optional(),
        destination: z.string().optional(),
        flightNumber: z.string().optional(),
        bookingReference: z.string().optional(),
        airline: z.string().optional(),
        // Hotel fields
        hotelName: z.string().optional(),
        hotelAddressEnglish: z.string().optional(),
        hotelAddressArabic: z.string().optional(),
        hotelPhone: z.string().optional(),
        hotelEmail: z.string().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        hotelBookingReference: z.string().optional(),
        // Additional fields
        currentAddressEnglish: z.string().optional(),
        currentAddressArabic: z.string().optional(),
        mobileNumber: z.string().optional(),
        email: z.string().optional(),
        nationalIdNumber: z.string().optional(),
        occupation: z.string().optional(),
        purposeOfTravel: z.string().optional(),
        numberOfEntries: z.string().optional(),
        durationOfStay: z.string().optional(),
        destinationCountry: z.string().optional(),
        applicationDatePlace: z.string().optional(),
        departureCity: z.string().optional(),
        employerName: z.string().optional(),
        employerLocation: z.string().optional(),
        maritalStatus: z.string().optional(),
        previousSchengenVisa: z.string().optional(),
        addressCity: z.string().optional(),
        addressDistrict: z.string().optional(),
        addressStreet: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { applicationId, ...updateData } = input;

        const application = await getVisaApplicationById(applicationId);
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("Application not found");
        }

        const updated = await updateVisaApplication(applicationId, updateData);
        return updated;
      }),

    // Mark application as completed
    markCompleted: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const application = await getVisaApplicationById(input.applicationId);
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("Application not found");
        }

        const updated = await updateVisaApplication(input.applicationId, {
          status: "completed",
          extractionCompleted: true,
        });
        return updated;
      }),

    // Delete application
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const application = await getVisaApplicationById(input.id);
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("Application not found");
        }

        await deleteVisaApplication(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
