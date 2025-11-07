import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { Loader2, Plus, FileText, Calendar, Trash2, Eye, Home } from "lucide-react";
import { toast } from "sonner";

export default function ApplicationsList() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: applications, isLoading, refetch } = trpc.visa.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const deleteMutation = trpc.visa.delete.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("تم حذف الطلب بنجاح");
      refetch();
    } catch (error) {
      toast.error("حدث خطأ في حذف الطلب");
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">طلبات التأشيرة</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/")}>
              <Home className="w-4 h-4 mr-2" />
              الرئيسية
            </Button>
            <Button onClick={() => setLocation("/new")}>
              <Plus className="w-4 h-4 mr-2" />
              طلب جديد
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-12 max-w-6xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : !applications || applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">لا توجد طلبات بعد</h3>
              <p className="text-muted-foreground mb-6">ابدأ بإنشاء طلب تأشيرة جديد</p>
              <Button onClick={() => setLocation("/new")}>
                <Plus className="w-4 h-4 mr-2" />
                إنشاء طلب جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span>طلب رقم {app.id}</span>
                        <Badge variant={app.status === "completed" ? "default" : app.status === "draft" ? "secondary" : "outline"}>
                          {app.status === "completed" ? "مكتمل" : app.status === "draft" ? "مسودة" : "مقدم"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/application/${app.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(app.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">الاسم</p>
                      <p className="font-semibold">{app.fullNameEnglish || "غير متوفر"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">رقم الجواز</p>
                      <p className="font-semibold">{app.passportNumber || "غير متوفر"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">الوجهة</p>
                      <p className="font-semibold">{app.destination || "غير متوفر"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${app.passportImageUrl ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-muted-foreground">الجواز</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${app.flightTicketImageUrl ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-muted-foreground">الطيران</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${app.hotelConfirmationImageUrl ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-muted-foreground">الفندق</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
