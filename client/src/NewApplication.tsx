import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, FileText, Plane, Hotel, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Step = "passport" | "flight" | "hotel" | "additional";

export default function NewApplication() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("passport");
  const [applicationId, setApplicationId] = useState<number | null>(null);
  
  // Text inputs
  const [passportText, setPassportText] = useState("");
  const [flightText, setFlightText] = useState("");
  const [hotelText, setHotelText] = useState("");
  const [additionalText, setAdditionalText] = useState("");
  
  // Processing states
  const [isProcessingPassport, setIsProcessingPassport] = useState(false);
  const [isProcessingFlight, setIsProcessingFlight] = useState(false);
  const [isProcessingHotel, setIsProcessingHotel] = useState(false);
  const [isProcessingAdditional, setIsProcessingAdditional] = useState(false);
  
  // Completion states
  const [passportCompleted, setPassportCompleted] = useState(false);
  const [flightCompleted, setFlightCompleted] = useState(false);
  const [hotelCompleted, setHotelCompleted] = useState(false);
  const [additionalCompleted, setAdditionalCompleted] = useState(false);

  const createMutation = trpc.visa.create.useMutation();
  const processTextMutation = trpc.visa.processTextInput.useMutation();

  const handleProcessPassport = async () => {
    if (!passportText.trim()) {
      toast.error("الرجاء إدخال نص بيانات الجواز");
      return;
    }

    setIsProcessingPassport(true);
    
    try {
      // Create application if not exists
      let appId = applicationId;
      if (!appId) {
        const newApp = await createMutation.mutateAsync();
        appId = newApp.id;
        setApplicationId(appId);
      }

      // Process text with AI
      await processTextMutation.mutateAsync({
        applicationId: appId,
        textType: "passport",
        rawText: passportText
      });

      setPassportCompleted(true);
      toast.success("تم معالجة بيانات الجواز بنجاح!");
    } catch (error) {
      console.error("Error processing passport:", error);
      toast.error("فشلت معالجة بيانات الجواز");
    } finally {
      setIsProcessingPassport(false);
    }
  };

  const handleProcessFlight = async () => {
    if (!flightText.trim()) {
      toast.error("الرجاء إدخال نص بيانات الطيران");
      return;
    }

    if (!applicationId) {
      toast.error("خطأ: لم يتم إنشاء الطلب");
      return;
    }

    setIsProcessingFlight(true);
    
    try {
      await processTextMutation.mutateAsync({
        applicationId,
        textType: "flight",
        rawText: flightText
      });

      setFlightCompleted(true);
      toast.success("تم معالجة بيانات الطيران بنجاح!");
    } catch (error) {
      console.error("Error processing flight:", error);
      toast.error("فشلت معالجة بيانات الطيران");
    } finally {
      setIsProcessingFlight(false);
    }
  };

  const handleProcessHotel = async () => {
    if (!hotelText.trim()) {
      toast.error("الرجاء إدخال نص بيانات الفندق");
      return;
    }

    if (!applicationId) {
      toast.error("خطأ: لم يتم إنشاء الطلب");
      return;
    }

    setIsProcessingHotel(true);
    
    try {
      await processTextMutation.mutateAsync({
        applicationId,
        textType: "hotel",
        rawText: hotelText
      });

      setHotelCompleted(true);
      toast.success("تم معالجة بيانات الفندق بنجاح!");
    } catch (error) {
      console.error("Error processing hotel:", error);
      toast.error("فشلت معالجة بيانات الفندق");
    } finally {
      setIsProcessingHotel(false);
    }
  };

  const handleProcessAdditional = async () => {
    if (!additionalText.trim()) {
      toast.error("الرجاء إدخال البيانات الإضافية");
      return;
    }

    if (!applicationId) {
      toast.error("خطأ: لم يتم إنشاء الطلب");
      return;
    }

    setIsProcessingAdditional(true);
    
    try {
      await processTextMutation.mutateAsync({
        applicationId,
        textType: "additional",
        rawText: additionalText
      });

      setAdditionalCompleted(true);
      toast.success("تم معالجة البيانات الإضافية بنجاح!");
    } catch (error) {
      console.error("Error processing additional data:", error);
      toast.error("فشلت معالجة البيانات الإضافية");
    } finally {
      setIsProcessingAdditional(false);
    }
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case "passport": return 1;
      case "flight": return 2;
      case "hotel": return 3;
      case "additional": return 4;
    }
  };

  const currentStepNumber = getStepNumber(currentStep);
  const progressPercentage = (currentStepNumber / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">طلب تأشيرة جديد</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 ${currentStep === "passport" ? "text-blue-600" : passportCompleted ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "passport" ? "bg-blue-600 text-white" : passportCompleted ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                {passportCompleted ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <span className="text-sm font-medium hidden sm:inline">الجواز</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${passportCompleted ? "bg-green-600" : "bg-gray-200"}`} />
            </div>
            <div className={`flex items-center gap-2 ${currentStep === "flight" ? "text-blue-600" : flightCompleted ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "flight" ? "bg-blue-600 text-white" : flightCompleted ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                {flightCompleted ? <CheckCircle2 className="h-5 w-5" /> : "2"}
              </div>
              <span className="text-sm font-medium hidden sm:inline">الطيران</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${flightCompleted ? "bg-green-600" : "bg-gray-200"}`} />
            </div>
            <div className={`flex items-center gap-2 ${currentStep === "hotel" ? "text-blue-600" : hotelCompleted ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "hotel" ? "bg-blue-600 text-white" : hotelCompleted ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                {hotelCompleted ? <CheckCircle2 className="h-5 w-5" /> : "3"}
              </div>
              <span className="text-sm font-medium hidden sm:inline">الفندق</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${hotelCompleted ? "bg-green-600" : "bg-gray-200"}`} />
            </div>
            <div className={`flex items-center gap-2 ${currentStep === "additional" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "additional" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                4
              </div>
              <span className="text-sm font-medium hidden sm:inline">إضافية</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Passport Step */}
        {currentStep === "passport" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>بيانات الجواز</CardTitle>
                  <CardDescription>
                    انسخ والصق جميع النصوص من جوازك هنا. سيقوم الذكاء الاصطناعي بتنسيقها وترجمتها تلقائياً.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passport-text">النص من الجواز</Label>
                <Textarea
                  id="passport-text"
                  placeholder="مثال:&#10;رقم الجواز: A12345678&#10;الاسم: أحمد محمد علي&#10;الجنسية: سعودي&#10;تاريخ الميلاد: 1990-05-15&#10;..."
                  value={passportText}
                  onChange={(e) => setPassportText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isProcessingPassport || passportCompleted}
                />
              </div>

              <div className="flex gap-3">
                {!passportCompleted ? (
                  <Button
                    onClick={handleProcessPassport}
                    disabled={isProcessingPassport || !passportText.trim()}
                    className="flex-1"
                  >
                    {isProcessingPassport ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      "معالجة البيانات"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep("flight")}
                    className="flex-1"
                  >
                    التالي
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flight Step */}
        {currentStep === "flight" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>بيانات الطيران</CardTitle>
                  <CardDescription>
                    انسخ والصق النصوص من تذكرة الطيران أو تأكيد الحجز.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="flight-text">النص من تذكرة الطيران</Label>
                <Textarea
                  id="flight-text"
                  placeholder="مثال:&#10;رقم الحجز: ABC123&#10;الخطوط الجوية: الخطوط السعودية&#10;رقم الرحلة: SV123&#10;تاريخ المغادرة: 2025-06-15&#10;تاريخ العودة: 2025-06-30&#10;الوجهة: باريس، فرنسا&#10;..."
                  value={flightText}
                  onChange={(e) => setFlightText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isProcessingFlight || flightCompleted}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("passport")}
                  disabled={isProcessingFlight}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  السابق
                </Button>
                {!flightCompleted ? (
                  <Button
                    onClick={handleProcessFlight}
                    disabled={isProcessingFlight || !flightText.trim()}
                    className="flex-1"
                  >
                    {isProcessingFlight ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      "معالجة البيانات"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep("hotel")}
                    className="flex-1"
                  >
                    التالي
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hotel Step */}
        {currentStep === "hotel" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Hotel className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>بيانات الفندق</CardTitle>
                  <CardDescription>
                    انسخ والصق النصوص من تأكيد حجز الفندق.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hotel-text">النص من تأكيد الفندق</Label>
                <Textarea
                  id="hotel-text"
                  placeholder="مثال:&#10;اسم الفندق: فندق هيلتون باريس&#10;العنوان: 123 شارع الشانزليزيه، باريس، فرنسا&#10;رقم الهاتف: +33 1 23 45 67 89&#10;البريد الإلكتروني: paris@hilton.com&#10;رقم الحجز: HTL456789&#10;تاريخ الوصول: 2025-06-15&#10;تاريخ المغادرة: 2025-06-30&#10;..."
                  value={hotelText}
                  onChange={(e) => setHotelText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isProcessingHotel || hotelCompleted}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("flight")}
                  disabled={isProcessingHotel}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  السابق
                </Button>
                {!hotelCompleted ? (
                  <Button
                    onClick={handleProcessHotel}
                    disabled={isProcessingHotel || !hotelText.trim()}
                    className="flex-1"
                  >
                    {isProcessingHotel ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      "معالجة البيانات"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep("additional")}
                    className="flex-1"
                  >
                    التالي
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Data Step */}
        {currentStep === "additional" && applicationId && (
          <Card>
            <CardHeader>
              <CardTitle>البيانات الإضافية</CardTitle>
              <CardDescription>
                الصق جميع البيانات الإضافية هنا (العنوان، الجوال، الإيميل، الهوية، المهنة، إلخ) وسيتم ترجمتها وتوزيعها تلقائياً
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="additionalText">البيانات الإضافية</Label>
                <Textarea
                  id="additionalText"
                  value={additionalText}
                  onChange={(e) => setAdditionalText(e.target.value)}
                  placeholder={`مثال:\nالعنوان: شارع الملك فهد، الرياض\nالجوال: 0501234567\nالإيميل: ahmed@example.com\nرقم الهوية: 1234567890\nالمهنة: مهندس\nالغرض من السفر: سياحة\nمدة الإقامة: 15 يوم`}
                  rows={10}
                  className="font-arabic text-base"
                  disabled={isProcessingAdditional}
                />
              </div>

              {isProcessingAdditional && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">جاري المعالجة والترجمة...</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}

              {additionalCompleted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">تمت معالجة البيانات الإضافية بنجاح</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("hotel")}
                  disabled={isProcessingAdditional}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  السابق
                </Button>
                {!additionalCompleted ? (
                  <Button
                    onClick={handleProcessAdditional}
                    disabled={!additionalText.trim() || isProcessingAdditional}
                    className="flex-1"
                  >
                    {isProcessingAdditional ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      "معالجة البيانات"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setLocation(`/application/${applicationId}`)}
                    className="flex-1"
                  >
                    إكمال وعرض جميع البيانات
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
