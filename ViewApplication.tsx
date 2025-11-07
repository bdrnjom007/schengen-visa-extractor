import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { Loader2, Download, ArrowLeft, Save, FileText, Plane, Hotel, User, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { generateVisaPDF } from "@/lib/pdfExport";

export default function ViewApplication() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, params] = useRoute("/application/:id");
  const [, setLocation] = useLocation();
  const applicationId = params?.id ? parseInt(params.id) : null;

  const { data: application, isLoading, refetch } = trpc.visa.get.useQuery(
    { id: applicationId! },
    { enabled: !!applicationId && isAuthenticated }
  );

  const updateManualFieldsMutation = trpc.visa.updateManualFields.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    // Passport data
    passportNumber: "",
    fullNameEnglish: "",
    fullNameArabic: "",
    nationality: "",
    dateOfBirth: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    placeOfBirth: "",
    gender: "",
    
    // Flight data
    departureDate: "",
    returnDate: "",
    destination: "",
    flightNumber: "",
    bookingReference: "",
    airline: "",
    
    // Hotel data
    hotelName: "",
    hotelAddressEnglish: "",
    hotelAddressArabic: "",
    hotelPhone: "",
    hotelEmail: "",
    checkInDate: "",
    checkOutDate: "",
    hotelBookingReference: "",
    
    // Additional manual fields
    currentAddressEnglish: "",
    currentAddressArabic: "",
    mobileNumber: "",
    email: "",
    nationalIdNumber: "",
    occupation: "",
    purposeOfTravel: "",
    numberOfEntries: "",
    durationOfStay: "",
    destinationCountry: "",
    applicationDatePlace: "",
    departureCity: "",
    employerName: "",
    employerLocation: "",
    maritalStatus: "",
    previousSchengenVisa: "",
    addressCity: "",
    addressDistrict: "",
    addressStreet: "",
  });

  // Update form when application data loads
  useEffect(() => {
    if (application) {
      setFormData({
        passportNumber: application.passportNumber || "",
        fullNameEnglish: application.fullNameEnglish || "",
        fullNameArabic: application.fullNameArabic || "",
        nationality: application.nationality || "",
        dateOfBirth: application.dateOfBirth || "",
        passportIssueDate: application.passportIssueDate || "",
        passportExpiryDate: application.passportExpiryDate || "",
        placeOfBirth: application.placeOfBirth || "",
        gender: application.gender || "",
        
        departureDate: application.departureDate || "",
        returnDate: application.returnDate || "",
        destination: application.destination || "",
        flightNumber: application.flightNumber || "",
        bookingReference: application.bookingReference || "",
        airline: application.airline || "",
        
        hotelName: application.hotelName || "",
        hotelAddressEnglish: application.hotelAddressEnglish || "",
        hotelAddressArabic: application.hotelAddressArabic || "",
        hotelPhone: application.hotelPhone || "",
        hotelEmail: application.hotelEmail || "",
        checkInDate: application.checkInDate || "",
        checkOutDate: application.checkOutDate || "",
        hotelBookingReference: application.hotelBookingReference || "",
        
        currentAddressEnglish: application.currentAddressEnglish || "",
        currentAddressArabic: application.currentAddressArabic || "",
        mobileNumber: application.mobileNumber || "",
        email: application.email || "",
        nationalIdNumber: application.nationalIdNumber || "",
        occupation: application.occupation || "",
        purposeOfTravel: application.purposeOfTravel || "",
        numberOfEntries: application.numberOfEntries || "",
        durationOfStay: application.durationOfStay || "",
        destinationCountry: application.destinationCountry || "",
        applicationDatePlace: application.applicationDatePlace || "",
        departureCity: application.departureCity || "",
        employerName: application.employerName || "",
        employerLocation: application.employerLocation || "",
        maritalStatus: application.maritalStatus || "",
        previousSchengenVisa: application.previousSchengenVisa || "",
        addressCity: application.addressCity || "",
        addressDistrict: application.addressDistrict || "",
        addressStreet: application.addressStreet || "",
      });
    }
  }, [application]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const handleSave = async () => {
    if (!applicationId) return;

    try {
      await updateManualFieldsMutation.mutateAsync({
        applicationId,
        ...formData,
      });
      
      await refetch();
      toast.success("تم حفظ التعديلات بنجاح!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("فشل حفظ التعديلات");
    }
  };

  const handleDownloadPDF = () => {
    if (!application) return;
    try {
      generateVisaPDF(application);
      toast.success("تم تصدير PDF بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في تصدير PDF");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>الطلب غير موجود</CardTitle>
            <CardDescription>لم يتم العثور على الطلب المطلوب</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">تعديل الطلب</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateManualFieldsMutation.isPending}
                size="sm"
              >
                {updateManualFieldsMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ التعديلات
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
              >
                <Download className="ml-2 h-4 w-4" />
                تصدير PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Passport Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>بيانات الجواز</CardTitle>
                <CardDescription>معلومات جواز السفر</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passportNumber">رقم الجواز</Label>
              <Input
                id="passportNumber"
                value={formData.passportNumber}
                onChange={(e) => handleChange("passportNumber", e.target.value)}
                placeholder="A12345678"
              />
            </div>
            <div>
              <Label htmlFor="fullNameEnglish">الاسم الكامل (إنجليزي)</Label>
              <Input
                id="fullNameEnglish"
                value={formData.fullNameEnglish}
                onChange={(e) => handleChange("fullNameEnglish", e.target.value)}
                placeholder="Ahmed Mohammed Ali"
              />
            </div>
            <div>
              <Label htmlFor="fullNameArabic">الاسم الكامل (عربي)</Label>
              <Input
                id="fullNameArabic"
                value={formData.fullNameArabic}
                onChange={(e) => handleChange("fullNameArabic", e.target.value)}
                placeholder="أحمد محمد علي"
              />
            </div>
            <div>
              <Label htmlFor="nationality">الجنسية</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                placeholder="Saudi Arabian"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">الجنس</Label>
              <Input
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                placeholder="Male / Female"
              />
            </div>
            <div>
              <Label htmlFor="placeOfBirth">مكان الميلاد</Label>
              <Input
                id="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={(e) => handleChange("placeOfBirth", e.target.value)}
                placeholder="Riyadh"
              />
            </div>
            <div>
              <Label htmlFor="passportIssueDate">تاريخ الإصدار</Label>
              <Input
                id="passportIssueDate"
                type="date"
                value={formData.passportIssueDate}
                onChange={(e) => handleChange("passportIssueDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="passportExpiryDate">تاريخ الانتهاء</Label>
              <Input
                id="passportExpiryDate"
                type="date"
                value={formData.passportExpiryDate}
                onChange={(e) => handleChange("passportExpiryDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flight Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>بيانات الطيران</CardTitle>
                <CardDescription>معلومات تذكرة الطيران</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airline">شركة الطيران</Label>
              <Input
                id="airline"
                value={formData.airline}
                onChange={(e) => handleChange("airline", e.target.value)}
                placeholder="Saudi Airlines"
              />
            </div>
            <div>
              <Label htmlFor="flightNumber">رقم الرحلة</Label>
              <Input
                id="flightNumber"
                value={formData.flightNumber}
                onChange={(e) => handleChange("flightNumber", e.target.value)}
                placeholder="SV123"
              />
            </div>
            <div>
              <Label htmlFor="bookingReference">رقم الحجز</Label>
              <Input
                id="bookingReference"
                value={formData.bookingReference}
                onChange={(e) => handleChange("bookingReference", e.target.value)}
                placeholder="ABC123"
              />
            </div>
            <div>
              <Label htmlFor="destination">الوجهة</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                placeholder="Paris, France"
              />
            </div>
            <div>
              <Label htmlFor="departureDate">تاريخ المغادرة</Label>
              <Input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={(e) => handleChange("departureDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="returnDate">تاريخ العودة</Label>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleChange("returnDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hotel Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Hotel className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>بيانات الفندق</CardTitle>
                <CardDescription>معلومات حجز الفندق</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="hotelName">اسم الفندق</Label>
              <Input
                id="hotelName"
                value={formData.hotelName}
                onChange={(e) => handleChange("hotelName", e.target.value)}
                placeholder="Hilton Paris"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="hotelAddressEnglish">عنوان الفندق (إنجليزي)</Label>
              <Input
                id="hotelAddressEnglish"
                value={formData.hotelAddressEnglish}
                onChange={(e) => handleChange("hotelAddressEnglish", e.target.value)}
                placeholder="123 Champs-Élysées, Paris, France"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="hotelAddressArabic">عنوان الفندق (عربي)</Label>
              <Input
                id="hotelAddressArabic"
                value={formData.hotelAddressArabic}
                onChange={(e) => handleChange("hotelAddressArabic", e.target.value)}
                placeholder="123 شارع الشانزليزيه، باريس، فرنسا"
              />
            </div>
            <div>
              <Label htmlFor="hotelPhone">رقم الهاتف</Label>
              <Input
                id="hotelPhone"
                value={formData.hotelPhone}
                onChange={(e) => handleChange("hotelPhone", e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div>
              <Label htmlFor="hotelEmail">البريد الإلكتروني</Label>
              <Input
                id="hotelEmail"
                type="email"
                value={formData.hotelEmail}
                onChange={(e) => handleChange("hotelEmail", e.target.value)}
                placeholder="paris@hilton.com"
              />
            </div>
            <div>
              <Label htmlFor="hotelBookingReference">رقم الحجز</Label>
              <Input
                id="hotelBookingReference"
                value={formData.hotelBookingReference}
                onChange={(e) => handleChange("hotelBookingReference", e.target.value)}
                placeholder="HTL456789"
              />
            </div>
            <div>
              <Label htmlFor="checkInDate">تاريخ الوصول</Label>
              <Input
                id="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={(e) => handleChange("checkInDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkOutDate">تاريخ المغادرة</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => handleChange("checkOutDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>بيانات إضافية</CardTitle>
                <CardDescription>معلومات إضافية مطلوبة للتأشيرة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="currentAddressEnglish">العنوان الحالي (إنجليزي)</Label>
              <Input
                id="currentAddressEnglish"
                value={formData.currentAddressEnglish}
                onChange={(e) => handleChange("currentAddressEnglish", e.target.value)}
                placeholder="123 King Fahd Road, Riyadh, Saudi Arabia"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="currentAddressArabic">العنوان الحالي (عربي)</Label>
              <Input
                id="currentAddressArabic"
                value={formData.currentAddressArabic}
                onChange={(e) => handleChange("currentAddressArabic", e.target.value)}
                placeholder="123 طريق الملك فهد، الرياض، المملكة العربية السعودية"
              />
            </div>
            <div>
              <Label htmlFor="mobileNumber">رقم الجوال</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                placeholder="+966 50 123 4567"
              />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="ahmed@example.com"
              />
            </div>
            <div>
              <Label htmlFor="nationalIdNumber">رقم الهوية الوطنية</Label>
              <Input
                id="nationalIdNumber"
                value={formData.nationalIdNumber}
                onChange={(e) => handleChange("nationalIdNumber", e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label htmlFor="occupation">المهنة</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
                placeholder="Engineer"
              />
            </div>
            <div>
              <Label htmlFor="purposeOfTravel">الغرض من السفر</Label>
              <Input
                id="purposeOfTravel"
                value={formData.purposeOfTravel}
                onChange={(e) => handleChange("purposeOfTravel", e.target.value)}
                placeholder="Tourism"
              />
            </div>
            <div>
              <Label htmlFor="numberOfEntries">عدد الدخول</Label>
              <Input
                id="numberOfEntries"
                value={formData.numberOfEntries}
                onChange={(e) => handleChange("numberOfEntries", e.target.value)}
                placeholder="Single / Multiple"
              />
            </div>
            <div>
              <Label htmlFor="durationOfStay">مدة الإقامة (أيام)</Label>
              <Input
                id="durationOfStay"
                value={formData.durationOfStay}
                onChange={(e) => handleChange("durationOfStay", e.target.value)}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="destinationCountry">الدولة المطلوبة</Label>
              <Input
                id="destinationCountry"
                value={formData.destinationCountry}
                onChange={(e) => handleChange("destinationCountry", e.target.value)}
                placeholder="France"
              />
            </div>
            <div>
              <Label htmlFor="applicationDatePlace">تاريخ ومكان التقديم</Label>
              <Input
                id="applicationDatePlace"
                value={formData.applicationDatePlace}
                onChange={(e) => handleChange("applicationDatePlace", e.target.value)}
                placeholder="2025-01-15, Riyadh"
              />
            </div>
            <div>
              <Label htmlFor="departureCity">مدينة المغادرة</Label>
              <Input
                id="departureCity"
                value={formData.departureCity}
                onChange={(e) => handleChange("departureCity", e.target.value)}
                placeholder="Riyadh"
              />
            </div>
            <div>
              <Label htmlFor="employerName">جهة العمل</Label>
              <Input
                id="employerName"
                value={formData.employerName}
                onChange={(e) => handleChange("employerName", e.target.value)}
                placeholder="ABC Company"
              />
            </div>
            <div>
              <Label htmlFor="employerLocation">مكان جهة العمل</Label>
              <Input
                id="employerLocation"
                value={formData.employerLocation}
                onChange={(e) => handleChange("employerLocation", e.target.value)}
                placeholder="Riyadh, Saudi Arabia"
              />
            </div>
            <div>
              <Label htmlFor="maritalStatus">الحالة الاجتماعية</Label>
              <Input
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => handleChange("maritalStatus", e.target.value)}
                placeholder="Married / Single"
              />
            </div>
            <div>
              <Label htmlFor="previousSchengenVisa">تأشيرة شنغن سابقة</Label>
              <Input
                id="previousSchengenVisa"
                value={formData.previousSchengenVisa}
                onChange={(e) => handleChange("previousSchengenVisa", e.target.value)}
                placeholder="Yes / No"
              />
            </div>
            <div>
              <Label htmlFor="addressCity">المدينة</Label>
              <Input
                id="addressCity"
                value={formData.addressCity}
                onChange={(e) => handleChange("addressCity", e.target.value)}
                placeholder="Riyadh"
              />
            </div>
            <div>
              <Label htmlFor="addressDistrict">الحي</Label>
              <Input
                id="addressDistrict"
                value={formData.addressDistrict}
                onChange={(e) => handleChange("addressDistrict", e.target.value)}
                placeholder="Al Malqa"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addressStreet">الشارع</Label>
              <Input
                id="addressStreet"
                value={formData.addressStreet}
                onChange={(e) => handleChange("addressStreet", e.target.value)}
                placeholder="King Fahd Road"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateManualFieldsMutation.isPending}
            className="flex-1"
          >
            {updateManualFieldsMutation.isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ جميع التعديلات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
