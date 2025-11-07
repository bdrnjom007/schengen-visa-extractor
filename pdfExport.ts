import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { VisaApplication } from "../../../drizzle/schema";

export function generateVisaPDF(application: VisaApplication) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Schengen Visa Application", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Application ID: ${application.id}`, 105, 30, { align: "center" });
  
  let yPosition = 45;
  
  // Passport Information
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text("Passport Information", 14, yPosition);
  yPosition += 10;
  
  const passportData = [
    ["Passport Number", application.passportNumber || "N/A"],
    ["Full Name (English)", application.fullNameEnglish || "N/A"],
    ["Full Name (Arabic)", application.fullNameArabic || "N/A"],
    ["Nationality", application.nationality || "N/A"],
    ["Date of Birth", application.dateOfBirth || "N/A"],
    ["Gender", application.gender || "N/A"],
    ["Place of Birth", application.placeOfBirth || "N/A"],
    ["Issue Date", application.passportIssueDate || "N/A"],
    ["Expiry Date", application.passportExpiryDate || "N/A"],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [["Field", "Value"]],
    body: passportData,
    theme: "striped",
    headStyles: { fillColor: [33, 150, 243] },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Flight Information
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text("Flight Information", 14, yPosition);
  yPosition += 10;
  
  const flightData = [
    ["Departure Date", application.departureDate || "N/A"],
    ["Return Date", application.returnDate || "N/A"],
    ["Destination", application.destination || "N/A"],
    ["Flight Number", application.flightNumber || "N/A"],
    ["Booking Reference", application.bookingReference || "N/A"],
    ["Airline", application.airline || "N/A"],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [["Field", "Value"]],
    body: flightData,
    theme: "striped",
    headStyles: { fillColor: [33, 150, 243] },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Hotel Information
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text("Hotel Information", 14, yPosition);
  yPosition += 10;
  
  const hotelData = [
    ["Hotel Name", application.hotelName || "N/A"],
    ["Hotel Address (English)", application.hotelAddressEnglish || "N/A"],
    ["Hotel Address (Arabic)", application.hotelAddressArabic || "N/A"],
    ["Hotel Phone", application.hotelPhone || "N/A"],
    ["Hotel Email", application.hotelEmail || "N/A"],
    ["Booking Reference", application.hotelBookingReference || "N/A"],
    ["Check-in Date", application.checkInDate || "N/A"],
    ["Check-out Date", application.checkOutDate || "N/A"],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [["Field", "Value"]],
    body: hotelData,
    theme: "striped",
    headStyles: { fillColor: [33, 150, 243] },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Additional Information
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text("Additional Information", 14, yPosition);
  yPosition += 10;
  
  const additionalData = [
    ["Current Address (English)", application.currentAddressEnglish || "N/A"],
    ["Current Address (Arabic)", application.currentAddressArabic || "N/A"],
    ["Address City", application.addressCity || "N/A"],
    ["Address District", application.addressDistrict || "N/A"],
    ["Address Street", application.addressStreet || "N/A"],
    ["Mobile Number", application.mobileNumber || "N/A"],
    ["Email", application.email || "N/A"],
    ["National ID Number", application.nationalIdNumber || "N/A"],
    ["Occupation", application.occupation || "N/A"],
    ["Employer Name", application.employerName || "N/A"],
    ["Employer Location", application.employerLocation || "N/A"],
    ["Marital Status", application.maritalStatus || "N/A"],
    ["Purpose of Travel", application.purposeOfTravel || "N/A"],
    ["Destination Country", application.destinationCountry || "N/A"],
    ["Departure City", application.departureCity || "N/A"],
    ["Application Date & Place", application.applicationDatePlace || "N/A"],
    ["Previous Schengen Visa", application.previousSchengenVisa || "N/A"],
    ["Number of Entries", application.numberOfEntries || "N/A"],
    ["Duration of Stay", application.durationOfStay || "N/A"],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [["Field", "Value"]],
    body: additionalData,
    theme: "striped",
    headStyles: { fillColor: [33, 150, 243] },
    margin: { left: 14, right: 14 },
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      105,
      doc.internal.pageSize.height - 5,
      { align: "center" }
    );
  }
  
  // Save the PDF
  doc.save(`visa-application-${application.id}.pdf`);
}
