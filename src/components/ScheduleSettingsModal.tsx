"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { learningScheduleApi } from "@/api/learningScheduleApi"

interface ScheduleSettingsModalProps {
  currentConfig: {
    days_per_week: number
    min_hours_per_day: number
    max_hours_per_day: number
  }
  onClose: () => void
  onSaved: () => void
}

export default function ScheduleSettingsModal({
  currentConfig,
  onClose,
  onSaved
}: ScheduleSettingsModalProps) {
  const [daysPerWeek, setDaysPerWeek] = useState(currentConfig.days_per_week)
  const [minHours, setMinHours] = useState(currentConfig.min_hours_per_day)
  const [maxHours, setMaxHours] = useState(currentConfig.max_hours_per_day)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await learningScheduleApi.updateConfig({
        days_per_week: daysPerWeek,
        min_hours_per_day: minHours,
        max_hours_per_day: maxHours
      })
      alert('Đã cập nhật cấu hình lịch học!')
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Error updating config:', error)
      alert(`Lỗi cập nhật: ${error.response?.data?.message || error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="text-xl font-bold">Cài đặt lịch học</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Days per week */}
          <div className="mb-6">
            <Label className="text-sm font-semibold mb-2 block">
              Số ngày học mỗi tuần: {daysPerWeek} ngày
            </Label>
            <Slider
              value={[daysPerWeek]}
              onValueChange={(val) => setDaysPerWeek(val[0])}
              min={1}
              max={7}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 ngày</span>
              <span>7 ngày</span>
            </div>
          </div>

          {/* Min hours per day */}
          <div className="mb-6">
            <Label className="text-sm font-semibold mb-2 block">
              Số giờ học tối thiểu mỗi ngày: {minHours} giờ
            </Label>
            <Slider
              value={[minHours]}
              onValueChange={(val) => {
                const newMin = val[0]
                setMinHours(newMin)
                if (newMin > maxHours) {
                  setMaxHours(newMin)
                }
              }}
              min={0.5}
              max={8}
              step={0.5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Max hours per day */}
          <div className="mb-6">
            <Label className="text-sm font-semibold mb-2 block">
              Số giờ học tối đa mỗi ngày: {maxHours} giờ
            </Label>
            <Slider
              value={[maxHours]}
              onValueChange={(val) => {
                const newMax = val[0]
                setMaxHours(newMax)
                if (newMax < minHours) {
                  setMinHours(newMax)
                }
              }}
              min={0.5}
              max={8}
              step={0.5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Thay đổi cấu hình sẽ tự động sắp xếp lại các bài học chưa hoàn thành trong lịch.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
