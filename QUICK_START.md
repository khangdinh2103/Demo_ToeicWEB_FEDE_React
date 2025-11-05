# 🚀 Quick Start Guide - Vocabulary Practice Feature

## ✅ Checklist trước khi test

### Backend (StarEdu_BE)

1. **Kiểm tra file `.env`:**
   ```bash
   cd StarEdu_BE
   cat .env  # hoặc notepad .env
   ```

   Đảm bảo có đủ các biến:
   ```env
   AZURE_SPEECH_KEY=...
   AZURE_SPEECH_REGION=eastus
   AZURE_SPEECH_ENDPOINT=...
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_S3_BUCKET_NAME=...
   AWS_S3_REGION=...
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Chạy Backend:**
   ```bash
   npm run dev
   ```

   Backend sẽ chạy tại: `http://localhost:5000`

### Frontend (Demo_ToeicWEB_FE_React)

1. **Kiểm tra file `.env`:**
   ```bash
   cd Demo_ToeicWEB_FE_React
   cat .env  # hoặc notepad .env
   ```

   Phải có:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Cài đặt dependencies (nếu chưa):**
   ```bash
   npm install
   ```

3. **Chạy Frontend:**
   ```bash
   npm run dev
   ```

   Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác)

## 🧪 Test Cases

### Test 1: Xem danh sách Vocabulary Sets

1. Mở browser: `http://localhost:5173`
2. Vào trang **"Luyện tập"** (Practice)
3. Click tab **"Từ vựng"** (có icon 📖)
4. Chọn loại từ: **Noun / Verb / Adjective / Adverb**
5. **Kết quả mong đợi:**
   - Hiển thị danh sách các bộ vocabulary sets
   - Mỗi card hiển thị:
     - Day number (Day 1, Day 2...)
     - Số lượng từ vựng
     - Badges: FlashCard-Exam, Voca
     - Nút "Vào học"

### Test 2: Học với Flashcards

1. Click nút **"Vào học"** trên một vocabulary set
2. **Kết quả mong đợi:**
   - Hiển thị flashcard với từ vựng đầu tiên
   - Mặt trước: Từ + IPA + 2 nút audio (US/UK)
   - Progress bar hiển thị: "Thẻ 1 / X"

3. Click vào card để lật
4. **Kết quả mong đợi:**
   - Hiển thị mặt sau:
     - Nghĩa tiếng Việt
     - Collocations (nếu có)
     - Ví dụ câu + dịch

5. Test audio:
   - Click nút **"US"** → Phát âm giọng Mỹ
   - Click nút **"UK"** → Phát âm giọng Anh

### Test 3: Luyện Phát Âm (QUAN TRỌNG!)

1. Trong flashcard, kéo xuống phần **"Luyện phát âm"**
2. Click **"Bắt đầu thu âm"**
3. **Browser sẽ hỏi quyền microphone** → Click "Allow"
4. Nói từ vựng vào micro (ví dụ: "hello")
5. Click **"Dừng thu âm"**
6. **Kết quả mong đợi:**
   - Loading "Đang phân tích phát âm..."
   - Sau vài giây hiển thị kết quả:

#### a) Overall Scores (4 điểm)
   - **Tổng thể** (Overall)
   - **Chính xác** (Accuracy)
   - **Trôi chảy** (Fluency)
   - **Hoàn chỉnh** (Completeness)

   Màu sắc:
   - 🟢 Xanh (80-100): Tốt
   - 🟡 Vàng (60-79): Tạm ổn
   - 🔴 Đỏ (<60): Kém

#### b) Chi tiết từng âm tiết
   - Hiển thị IPA của âm tiết
   - Progress bar với màu tương ứng
   - Danh sách các phoneme:
     - Icon ✓ hoặc ✗
     - Âm target (ví dụ: /h/)
     - Nếu sai: "Bạn nói: /x/"
     - Badge điểm (%)
     - Feedback chi tiết

### Test 4: Navigation

1. Click **"Tiếp theo"** → Chuyển sang card tiếp
2. Click **"Trước"** → Quay lại card trước
3. Click **"Đánh dấu hoàn thành"** → Badge "Đã hoàn thành"
4. Sau card cuối cùng → Click "Hoàn thành" → Quay về danh sách

### Test 5: Debug Mode (Optional)

Nếu gặp lỗi, dùng component debug:

1. Tạo route mới trong `App.tsx`:
   ```tsx
   import VocabularyDebugger from '@/components/VocabularyDebugger'
   
   <Route path="/debug-vocab" element={<VocabularyDebugger />} />
   ```

2. Truy cập: `http://localhost:5173/debug-vocab`
3. Test từng API riêng lẻ

## 🐛 Common Issues & Solutions

### Issue 1: "Không thể tải flashcards"

**Nguyên nhân:**
- Backend chưa chạy
- Sai API URL

**Giải pháp:**
```bash
# Kiểm tra Backend
curl http://localhost:5000/api/admin/vocabulary/sets

# Nếu lỗi CORS, check file backend: src/index.ts
# Phải có:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 2: "Không thể truy cập microphone"

**Nguyên nhân:**
- Chưa cấp quyền microphone
- Chạy không phải HTTPS (nếu không phải localhost)

**Giải pháp:**
- Click Allow khi browser hỏi
- Nếu vẫn lỗi, check browser settings → Privacy → Microphone

### Issue 3: "Azure timeout"

**Nguyên nhân:**
- Mạng chậm
- Azure credentials sai

**Giải pháp:**
```bash
# Check .env Backend
echo $AZURE_SPEECH_KEY
echo $AZURE_SPEECH_REGION

# Test Azure API trực tiếp
curl -X POST "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issueToken" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY"
```

### Issue 4: Không có audio US/UK

**Nguyên nhân:**
- Chưa tạo TTS cho từ vựng
- S3 bucket không public

**Giải pháp:**
- Admin phải thêm flashcard qua API để tự động generate audio
- Hoặc check S3 bucket permissions

## 📊 Expected Data Flow

```
User clicks "Vào học"
    ↓
GET /admin/vocabulary/sets/{setId}/cards
    ↓
Render VocabularyFlashCard
    ↓
User clicks audio button
    ↓
Play audioUS_url or audioUK_url from S3
    ↓
User clicks "Bắt đầu thu âm"
    ↓
Record audio via MediaRecorder
    ↓
POST /student/pronunciation (FormData: audio, referenceText)
    ↓
Backend: Convert audio → Azure Speech SDK
    ↓
Response: {word, scores, syllables}
    ↓
Render pronunciation results with colors
```

## 🎯 Success Criteria

- ✅ Có thể xem danh sách vocabulary sets
- ✅ Flashcards lật được 2 mặt
- ✅ Audio US/UK phát được
- ✅ Thu âm và phân tích thành công
- ✅ Hiển thị điểm số với màu đúng:
  - Xanh (80-100)
  - Vàng (60-79)
  - Đỏ (<60)
- ✅ Feedback chi tiết từng phoneme
- ✅ Navigation (Next/Prev/Complete) hoạt động

## 📸 Screenshots để kiểm tra

Khi test, chụp màn hình các trường hợp:

1. **Danh sách vocabulary sets** (tab Từ vựng)
2. **Flashcard mặt trước** (từ + IPA + audio buttons)
3. **Flashcard mặt sau** (nghĩa + collocations + example)
4. **Pronunciation results:**
   - Overall scores (4 ô)
   - Syllable breakdown
   - Phoneme details với màu sắc

## 🚀 Next Steps

Sau khi test thành công:

1. **Tạo data mẫu:**
   - Vào admin panel
   - Thêm vocabulary sets cho 4 loại từ
   - Mỗi set có ít nhất 5-10 từ

2. **Test với nhiều từ khác nhau:**
   - Từ đơn giản: hello, world
   - Từ phức tạp: pronunciation, development

3. **Optimize performance:**
   - Cache audio files
   - Lazy load images
   - Optimize API calls

---

**Happy Testing! 🎉**

Nếu gặp vấn đề, check:
- Browser Console (F12)
- Backend logs
- Network tab (F12 → Network)
