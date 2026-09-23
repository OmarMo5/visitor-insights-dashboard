import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import iconRight from "../../public/image2.png";
import iconLeft from "../../public/logo-DcKrXCdY.svg";
import iconCenter from "../../public/museum-logo-DLmHQUl0.png";

// مصفوفة المستخدمين المسموح لهم
const users = [
  {
    email: "view@asc.sa",
    password: "RCMC_2030",
    name: "مدير النظام",
    role: "admin",
  },
  {
    email: "omar@gmail.com",
    password: "pass12345",
    name: "مدير النظام",
    role: "admin",
  },
  {
    email: "user@asc.com",
    password: "user123",
    name: "Manage Dashboard",
    role: "user",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: user.email,
            name: user.name,
            role: user.role,
            loggedIn: true,
          }),
        );
        setLoading(false);
        navigate("/dashboard");
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header - شعار شركة السلام في الأعلى يسار */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <div className="bg-white rounded-xl p-1.5 sm:p-2 shadow-lg border border-gray-200">
          <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center">
            <img
              src={iconLeft}
              className="w-full h-full object-contain"
              alt="شركة السلام"
            />
          </div>
        </div>
      </div>

      {/* Header - شعار إضافي على اليمين فوق */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center">
            <img
              src={iconRight}
              className="w-full h-full object-contain"
              alt="الهيئة الملكية"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[90%] sm:max-w-md animate-fade-in z-10">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-card p-5 sm:p-8">
          {/* عنوان رئيسي وفرعي */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              تسجيل الدخول
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              احصائيات زوار المتحف الدولي للسيرة النبوية بمكة المكرمة
            </p>
            <p className="text-[10px] sm:text-xs text-primary/70 mt-1">
              (أبراج الساعة)
            </p>
          </div>

          {/* شعار المتحف الدولي للسيرة النبوية في المنتصف */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 shadow-lg p-2 sm:p-3">
                <img
                  src={iconCenter}
                  className="w-full h-full object-contain rounded-full"
                  alt="متحف السيرة النبوية"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-shake">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground block text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pr-10 pl-4 py-2 text-sm sm:py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:bg-white focus:text-gray-900"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground block text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pr-10 pl-10 py-2 text-sm sm:py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:bg-white focus:text-gray-900"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 sm:py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* تنبيه هام */}
          <div className="mt-6 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="text-center">
              <p
                className="text-xs sm:text-sm font-semibold text-amber-500/90 mb-2"
                dir="rtl"
              >
                ⚠️ تنبيه هام
              </p>
              <p
                className="text-[10px] sm:text-[11px] text-amber-500/80 leading-relaxed"
                dir="rtl"
              >
                كافة البيانات والمعلومات المتوفرة عبر هذا الموقع تعتبر سرية
                ومخصصة للاستخدام من قبل الهيئة الملكية لمدينة مكة المكرمة
                والمشاعر المقدسة. يمنع منعاً باتاً مشاركة بيانات الدخول لأي طرف
                ثالث.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - المشغل والمنظم الحصري */}
      <div className="absolute bottom-4 left-0 right-0 text-center px-4 sm:bottom-6">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          <span className="text-primary font-mono font-semibold tracking-wider">
            ASC
          </span>{" "}
          المشغل والمنظم الحصري{" "}
          <span className="text-primary font-semibold">شركة السلام</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
