import { useState } from 'react'
import AdminMenu from '../../components/AdminMenu'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { 
  Settings as SettingsIcon, 
  Save, 
  Mail,
  Shield,
  CreditCard,
  Database,
  Palette
} from 'lucide-react'

type SystemSettings = {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  timezone: string
  language: string
  currency: string
  theme: string
}

type EmailSettings = {
  provider: string
  host: string
  port: string
  username: string
  password: string
  encryption: string
}

type PaymentSettings = {
  vnpayEnabled: boolean
  vnpayTmnCode: string
  vnpayHashSecret: string
  momoEnabled: boolean
  momoPartnerCode: string
  momoAccessKey: string
  zalopayEnabled: boolean
  zalopayAppId: string
  zalopayKey: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'TOEIC Learning Platform',
    siteDescription: 'Nền tảng học TOEIC trực tuyến hàng đầu Việt Nam',
    contactEmail: 'contact@toeiclearning.com',
    supportEmail: 'support@toeiclearning.com',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    currency: 'VND',
    theme: 'light'
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    provider: 'smtp',
    host: 'smtp.gmail.com',
    port: '587',
    username: '',
    password: '',
    encryption: 'tls'
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    vnpayEnabled: true,
    vnpayTmnCode: '',
    vnpayHashSecret: '',
    momoEnabled: true,
    momoPartnerCode: '',
    momoAccessKey: '',
    zalopayEnabled: false,
    zalopayAppId: '',
    zalopayKey: ''
  })

  const menuItems = [
    { id: 'general', label: 'Cài đặt chung', icon: SettingsIcon },
    { id: 'email', label: 'Email & Thông báo', icon: Mail },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'system', label: 'Hệ thống', icon: Database },
    { id: 'appearance', label: 'Giao diện', icon: Palette }
  ]

  const handleSaveSettings = () => {
    // Lưu cài đặt - trong thực tế sẽ gửi API
    console.log('Saving settings...', { systemSettings, emailSettings, paymentSettings })
    alert('Cài đặt đã được lưu thành công!')
  }

  const handleTestEmail = () => {
    // Test email configuration
    alert('Đang gửi email test...')
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin website</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tên website</label>
            <Input
              value={systemSettings.siteName}
              onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email liên hệ</label>
            <Input
              type="email"
              value={systemSettings.contactEmail}
              onChange={(e) => setSystemSettings({ ...systemSettings, contactEmail: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Mô tả website</label>
            <Textarea
              value={systemSettings.siteDescription}
              onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cài đặt khu vực</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Múi giờ</label>
            <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Hồ Chí Minh)</SelectItem>
                <SelectItem value="Asia/Bangkok">GMT+7 (Bangkok)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
            <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tiền tệ</label>
            <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND (Việt Nam Đồng)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cấu hình Email SMTP</h3>
          <Button onClick={handleTestEmail} variant="outline" size="sm">
            Test Email
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">SMTP Host</label>
            <Input
              value={emailSettings.host}
              onChange={(e) => setEmailSettings({ ...emailSettings, host: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Port</label>
            <Input
              value={emailSettings.port}
              onChange={(e) => setEmailSettings({ ...emailSettings, port: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              value={emailSettings.username}
              onChange={(e) => setEmailSettings({ ...emailSettings, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={emailSettings.password}
              onChange={(e) => setEmailSettings({ ...emailSettings, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Encryption</label>
            <Select value={emailSettings.encryption} onValueChange={(value) => setEmailSettings({ ...emailSettings, encryption: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">Email chào mừng</p>
              <p className="text-sm text-gray-600">Gửi khi người dùng đăng ký tài khoản</p>
            </div>
            <Button variant="outline" size="sm">Chỉnh sửa</Button>
          </div>
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">Email xác nhận thanh toán</p>
              <p className="text-sm text-gray-600">Gửi khi thanh toán thành công</p>
            </div>
            <Button variant="outline" size="sm">Chỉnh sửa</Button>
          </div>
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">Email quên mật khẩu</p>
              <p className="text-sm text-gray-600">Gửi khi người dùng yêu cầu reset mật khẩu</p>
            </div>
            <Button variant="outline" size="sm">Chỉnh sửa</Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">VNPay</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={paymentSettings.vnpayEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {paymentSettings.vnpayEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </Badge>
          </div>
          <Button
            variant={paymentSettings.vnpayEnabled ? 'outline' : 'default'}
            size="sm"
            onClick={() => setPaymentSettings({ ...paymentSettings, vnpayEnabled: !paymentSettings.vnpayEnabled })}
          >
            {paymentSettings.vnpayEnabled ? 'Tắt' : 'Bật'}
          </Button>
        </div>
        {paymentSettings.vnpayEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">TMN Code</label>
              <Input
                value={paymentSettings.vnpayTmnCode}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayTmnCode: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hash Secret</label>
              <Input
                type="password"
                value={paymentSettings.vnpayHashSecret}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayHashSecret: e.target.value })}
              />
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">MoMo</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={paymentSettings.momoEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {paymentSettings.momoEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </Badge>
          </div>
          <Button
            variant={paymentSettings.momoEnabled ? 'outline' : 'default'}
            size="sm"
            onClick={() => setPaymentSettings({ ...paymentSettings, momoEnabled: !paymentSettings.momoEnabled })}
          >
            {paymentSettings.momoEnabled ? 'Tắt' : 'Bật'}
          </Button>
        </div>
        {paymentSettings.momoEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Partner Code</label>
              <Input
                value={paymentSettings.momoPartnerCode}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, momoPartnerCode: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Access Key</label>
              <Input
                type="password"
                value={paymentSettings.momoAccessKey}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, momoAccessKey: e.target.value })}
              />
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ZaloPay</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={paymentSettings.zalopayEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {paymentSettings.zalopayEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </Badge>
          </div>
          <Button
            variant={paymentSettings.zalopayEnabled ? 'outline' : 'default'}
            size="sm"
            onClick={() => setPaymentSettings({ ...paymentSettings, zalopayEnabled: !paymentSettings.zalopayEnabled })}
          >
            {paymentSettings.zalopayEnabled ? 'Tắt' : 'Bật'}
          </Button>
        </div>
        {paymentSettings.zalopayEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">App ID</label>
              <Input
                value={paymentSettings.zalopayAppId}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, zalopayAppId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <Input
                type="password"
                value={paymentSettings.zalopayKey}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, zalopayKey: e.target.value })}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Chính sách mật khẩu</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Độ dài tối thiểu</p>
              <p className="text-sm text-gray-600">Mật khẩu phải có ít nhất 8 ký tự</p>
            </div>
            <Input className="w-20" value="8" readOnly />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Yêu cầu ký tự đặc biệt</p>
              <p className="text-sm text-gray-600">Bắt buộc có ký tự đặc biệt</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Bật</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Yêu cầu chữ hoa</p>
              <p className="text-sm text-gray-600">Bắt buộc có chữ in hoa</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Bật</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Xác thực hai yếu tố (2FA)</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA cho Admin</p>
              <p className="text-sm text-gray-600">Bắt buộc 2FA cho tài khoản admin</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Bật</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA cho Giảng viên</p>
              <p className="text-sm text-gray-600">Tùy chọn 2FA cho giảng viên</p>
            </div>
            <Badge className="bg-gray-100 text-gray-800">Tắt</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Nhật ký hệ thống</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">Nhật ký đăng nhập</p>
              <p className="text-sm text-gray-600">Lưu trữ lịch sử đăng nhập</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Đang bật</Badge>
          </div>
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">Nhật ký thay đổi dữ liệu</p>
              <p className="text-sm text-gray-600">Ghi lại các thay đổi quan trọng</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Đang bật</Badge>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hiệu suất hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">CPU Usage</p>
            <p className="text-2xl font-bold text-blue-900">45%</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Memory Usage</p>
            <p className="text-2xl font-bold text-green-900">62%</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Disk Usage</p>
            <p className="text-2xl font-bold text-orange-900">78%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sao lưu dữ liệu</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Sao lưu tự động</p>
              <p className="text-sm text-gray-600">Sao lưu hàng ngày lúc 2:00 AM</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Lần sao lưu cuối</p>
              <p className="text-sm text-gray-600">25/12/2024 02:00 AM</p>
            </div>
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Sao lưu ngay
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cache</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Application Cache</p>
              <p className="text-sm text-gray-600">256 MB được sử dụng</p>
            </div>
            <Button variant="outline" size="sm">Xóa Cache</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Database Cache</p>
              <p className="text-sm text-gray-600">128 MB được sử dụng</p>
            </div>
            <Button variant="outline" size="sm">Xóa Cache</Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings()
      case 'email': return renderEmailSettings()
      case 'payment': return renderPaymentSettings()
      case 'security': return renderSecuritySettings()
      case 'system': return renderSystemSettings()
      default: return renderGeneralSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Cài đặt hệ thống</h1>
              <p className="text-gray-600">Quản lý cấu hình và thiết lập hệ thống</p>
            </div>
            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Settings Menu */}
          <Card className="w-64 p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </Card>

          {/* Settings Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
