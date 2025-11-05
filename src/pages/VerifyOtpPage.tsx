import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const phone = location.state?.phone;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate("/register");
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      setError("Mã OTP phải có 4 chữ số");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.verifyOtp({
        phone,
        code: otp,
      });

      // Cập nhật user trong context
      setUser({
        id: response._id,
        name: response.name,
        phone: response.phone,
        role: response.role,
        avatar: response.avatar,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(
        err.response?.data?.message || 
        "Mã OTP không đúng. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">STAREDU</span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Xác thực OTP</CardTitle>
            <CardDescription className="text-center">
              Nhập mã OTP đã được gửi đến số điện thoại <br />
              <span className="font-semibold text-gray-900">{phone}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <div className="flex flex-col items-center py-8 space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-lg font-semibold text-green-600">
                  Xác thực thành công!
                </p>
                <p className="text-sm text-gray-600">Đang chuyển hướng...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Mã OTP (4 chữ số)</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="1234"
                    className="text-center text-2xl tracking-widest font-bold"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={4}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Mã OTP test: <span className="font-mono font-bold">1234</span>
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 4}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    "Xác thực"
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Không nhận được mã?{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Gửi lại
                    </button>
                  </p>
                  <p className="text-sm text-gray-600">
                    <Link to="/register" className="text-blue-600 hover:underline">
                      ← Quay lại đăng ký
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
