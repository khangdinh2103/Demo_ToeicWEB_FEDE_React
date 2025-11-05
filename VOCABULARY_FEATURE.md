# Tính năng Luyện Từ Vựng với AI Phát Âm

## 📋 Tổng quan

Tính năng luyện từ vựng cho phép học viên:
- **Học từ vựng** qua flashcards theo các loại từ (Noun, Verb, Adjective, Adverb)
- **Luyện phát âm** với AI Azure Speech SDK
- **Nhận feedback chi tiết** về từng âm tiết và phoneme
- **Nghe phát âm** chuẩn giọng Mỹ (US) và Anh (UK)

## 🎨 UI/UX Design

### Màu sắc theo độ chính xác phát âm:

| Màu sắc | Điểm (Accuracy) | Ý nghĩa |
|---------|-----------------|---------|
| 🟢 **Xanh lá (Green)** | 80 - 100 | Phát âm **Tốt/Hoàn hảo** |
| 🟡 **Vàng (Yellow)** | 60 - 79 | Phát âm **Tạm ổn/Cần cải thiện** |
| 🔴 **Đỏ (Red)** | < 60 | Phát âm **Kém/Sai** |

## 🚀 Cài đặt

### 1. Backend Configuration

Đảm bảo file `.env` trong StarEdu_BE có các biến:

```env
# Azure Speech
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_ENDPOINT=https://eastus.api.cognitive.microsoft.com/

# AWS S3 (cho lưu audio TTS)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=your_bucket
AWS_S3_REGION=us-east-1
```

### 2. Frontend Configuration

File `.env` trong Demo_ToeicWEB_FE_React:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Chạy ứng dụng

**Backend:**
```bash
cd StarEdu_BE
npm install
npm run dev
```

**Frontend:**
```bash
cd Demo_ToeicWEB_FE_React
npm install
npm run dev
```

## 📂 Cấu trúc Files

```
Demo_ToeicWEB_FE_React/
├── src/
│   ├── api/
│   │   ├── axiosConfig.ts          # Axios instance + interceptors
│   │   └── vocabularyApi.ts        # API calls cho vocabulary & pronunciation
│   ├── components/
│   │   ├── VocabularyPractice.tsx  # Component chính hiển thị danh sách
│   │   └── VocabularyFlashCard.tsx # Flashcard + tính năng phát âm
│   └── pages/
│       └── PracticePage.tsx        # Tích hợp tab Vocabulary
```

## 🎯 Workflow

### 1. Học từ vựng (VocabularyPractice)

```
Chọn loại từ (Noun/Verb/Adjective/Adverb)
    ↓
Load danh sách vocabulary sets từ API
    ↓
Click "Vào học" → Load flashcards
    ↓
Hiển thị VocabularyFlashCard
```

### 2. Flashcard Learning (VocabularyFlashCard)

**Mặt trước:**
- Hiển thị từ vựng (term) + IPA
- Nút phát âm US/UK
- Click card để lật

**Mặt sau:**
- Nghĩa (mainMeaning)
- Collocations
- Ví dụ câu + dịch

### 3. Luyện phát âm

```
Click "Bắt đầu thu âm"
    ↓
Người dùng nói từ vựng
    ↓
Click "Dừng thu âm"
    ↓
Gửi audio blob lên API /student/pronunciation
    ↓
Nhận kết quả phân tích
    ↓
Hiển thị:
  - Điểm tổng thể (Overall, Accuracy, Fluency, Completeness)
  - Chi tiết từng âm tiết (Syllables)
  - Chi tiết từng phoneme với màu sắc tương ứng
  - Feedback cụ thể cho từng âm sai
```

## 📊 Dữ liệu trả về từ API

### GET /admin/vocabulary/sets

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "_id": "...",
        "course_id": "...",
        "title": "Day 1 - Noun",
        "part_of_speech": "noun",
        "day_number": 1,
        "cards": [
          {
            "_id": "...",
            "term": "hello",
            "mainMeaning": "Xin chào",
            "ipa": "həˈloʊ",
            "collocations": ["say hello", "hello world"],
            "example": {
              "sentence": "Hello, how are you?",
              "translation": "Xin chào, bạn khỏe không?"
            },
            "audioUS_url": "https://...",
            "audioUK_url": "https://..."
          }
        ]
      }
    ]
  }
}
```

### POST /student/pronunciation

**Request:**
```
FormData:
  - audio: Blob (WAV file)
  - referenceText: "hello"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word": "hello",
    "scores": {
      "accuracy": 85,
      "fluency": 90,
      "completeness": 100,
      "overall": 88
    },
    "syllables": [
      {
        "ipa": "həˈloʊ",
        "grapheme": "hello",
        "accuracy": 85,
        "phonemes": [
          {
            "target": "h",
            "accuracy": 95,
            "result": "perfect",
            "feedback": "Phát âm /h/ rất tốt."
          },
          {
            "target": "ə",
            "accuracy": 70,
            "result": "medium",
            "altPh": "ʌ",
            "diff": 15,
            "feedback": "Âm /ə/ cần luyện thêm. Giảm lực, nhẹ giọng hơn."
          }
        ]
      }
    ]
  }
}
```

## 🎨 UI Components

### VocabularyPractice
- Tabs theo loại từ (Noun/Verb/Adj/Adv)
- Grid cards hiển thị các vocabulary sets
- Thống kê học tập

### VocabularyFlashCard
- **Progress bar** hiển thị tiến độ
- **Flashcard** lật 2 mặt (click to flip)
- **Audio player** cho US/UK voice
- **Recording controls** với animation
- **Pronunciation results:**
  - Overall scores với màu tương ứng
  - Syllables breakdown
  - Phoneme-level feedback với icons & colors
- **Navigation** (Previous/Next/Complete)

## 🔧 Customization

### Thay đổi màu sắc accuracy:

File: `VocabularyFlashCard.tsx`

```typescript
const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 80) return "text-green-600 bg-green-50";
  if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};
```

### Thêm loại từ mới:

File: `VocabularyPractice.tsx`

```typescript
const PART_OF_SPEECH_INFO = {
  noun: { label: "Noun", icon: "📚", color: "bg-green-500" },
  verb: { label: "Verb", icon: "🎬", color: "bg-blue-500" },
  // Thêm loại từ mới...
  preposition: { label: "Preposition", icon: "🔗", color: "bg-pink-500" },
};
```

## 🐛 Troubleshooting

### Lỗi: "Không thể truy cập microphone"
- Kiểm tra quyền microphone trong browser
- Đảm bảo website chạy trên HTTPS hoặc localhost

### Lỗi: "Không thể tải flashcards"
- Kiểm tra Backend đã chạy
- Verify API URL trong `.env`
- Check CORS settings ở Backend

### Lỗi: "Azure timeout"
- Tăng timeout trong `pronunciation.service.ts`
- Kiểm tra Azure Speech credentials

## 📝 TODO / Future Improvements

- [ ] Lưu progress học tập vào database
- [ ] Gamification (streaks, achievements)
- [ ] Spaced repetition algorithm
- [ ] Export progress report
- [ ] Offline mode với cached audio
- [ ] Multi-word phrase pronunciation
- [ ] Voice comparison visualization

## 👨‍💻 Developer Notes

### Audio Recording Format
- Browser MediaRecorder tạo file WebM/Opus
- Backend convert sang PCM 16kHz mono bằng FFmpeg
- Azure SDK yêu cầu format chuẩn

### Performance Tips
- Sử dụng `Promise.all()` để load TTS song song (US + UK)
- Cache Azure token (9 phút)
- Lazy load flashcards khi click "Vào học"

---

**Created:** 2024-10-22  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
