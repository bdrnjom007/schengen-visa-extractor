import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { FileText, Upload, Languages, Download, CheckCircle2, Plane, Hotel, CreditCard } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-10 w-10" />}
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => setLocation("/applications")}>
                  طلباتي
                </Button>
                <Button onClick={() => setLocation("/new")}>
                  طلب جديد
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>تسجيل الدخول</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            استخراج بيانات تأشيرة الشنغن
            <br />
            <span className="text-primary">بذكاء اصطناعي متقدم</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            قم برفع صور جوازك وتذاكر الطيران وحجوزات الفنادق، وسنقوم باستخراج جميع البيانات المطلوبة تلقائياً وترجمتها إلى الإنجليزية
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => setLocation("/new")} className="text-lg px-8 py-6">
                ابدأ الآن
              </Button>
            ) : (
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <a href={getLoginUrl()}>ابدأ مجاناً</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">كيف يعمل النظام؟</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>رفع المستندات</CardTitle>
                <CardDescription>
                  قم برفع صور الجواز وتذاكر الطيران وتأكيد الفنادق
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>استخراج البيانات</CardTitle>
                <CardDescription>
                  الذكاء الاصطناعي يقرأ ويستخرج جميع البيانات تلقائياً
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Languages className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>الترجمة التلقائية</CardTitle>
                <CardDescription>
                  ترجمة جميع البيانات إلى اللغة الإنجليزية فوراً
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>تصدير PDF</CardTitle>
                <CardDescription>
                  احصل على ملف PDF جاهز للطباعة والتقديم
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Extracted Section */}
      <section className="container py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">البيانات المستخرجة</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-semibold">بيانات الجواز</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>رقم الجواز والاسم الكامل</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تاريخ الميلاد والجنسية</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تاريخ الإصدار والانتهاء</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>مكان الميلاد والجنس</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Plane className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-semibold">بيانات الطيران</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تاريخ الذهاب والعودة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>وجهة السفر</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>رقم الرحلة والحجز</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>اسم شركة الطيران</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Hotel className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-semibold">بيانات الفندق</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>اسم الفندق وعنوانه</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>رقم التواصل والإيميل</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تاريخ تسجيل الوصول والمغادرة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>رقم الحجز</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-primary/5 rounded-2xl p-12 border-2 border-primary/20">
          <h3 className="text-3xl font-bold text-foreground">جاهز للبدء؟</h3>
          <p className="text-lg text-muted-foreground">
            وفر وقتك وجهدك في تعبئة نماذج التأشيرة يدوياً. دع الذكاء الاصطناعي يقوم بالعمل نيابة عنك
          </p>
          {isAuthenticated ? (
            <Button size="lg" onClick={() => setLocation("/new")} className="text-lg px-8 py-6">
              إنشاء طلب جديد
            </Button>
          ) : (
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>ابدأ الآن مجاناً</a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container py-8 text-center text-muted-foreground">
          <p>© 2025 {APP_TITLE}. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
