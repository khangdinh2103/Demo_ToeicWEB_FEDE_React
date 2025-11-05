import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem hồ sơ.</p>
            <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-blue-600 text-white text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-gray-500">{user.phone}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Thông tin cá nhân</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="text-gray-500">Họ tên:</span> {user.name}
                </p>
                <p>
                  <span className="text-gray-500">Số điện thoại:</span> {user.phone}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Hành động</h3>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/dashboard")}>Tới Dashboard</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
