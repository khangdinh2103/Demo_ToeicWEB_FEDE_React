# 📚 Hệ Thống Luyện Tập Từ Vựng - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

Hệ thống luyện tập từ vựng bao gồm **5 chế độ học tập** được thiết kế để giúp người học nắm vững từ vựng TOEIC một cách toàn diện.

## 🗂️ Cấu Trúc Files

```
src/
├── pages/
│   └── VocabularyExercisePage.tsx          # Trang chính với layout 3 cột
├── components/
│   └── vocabulary/
│       ├── FlashCardExercise.tsx           # Tab 1: FlashCard + Pronunciation
│       ├── MultipleChoiceExercise.tsx      # Bài tập Trắc nghiệm
│       ├── ListeningExercise.tsx           # Bài tập Nghe từ
│       ├── UnscrambleExercise.tsx          # Bài tập Ghép từ
│       └── TypingExercise.tsx              # Bài tập Viết từ
```

## 🎮 Các Chế Độ Luyện Tập

### 1️⃣ FlashCard Mode (Tab 1)

**Tính năng:**
- ✅ Hiển thị từ vựng với phiên âm IPA
- ✅ Audio phát âm UK và US
- ✅ Click để lật xem nghĩa, collocations, examples
- ✅ **Luyện phát âm với AI** (Azure Speech SDK):
  - Thu âm giọng nói
  - Phân tích chi tiết (Overall, Accuracy, Fluency, Completeness)
  - Color-coded feedback cho từng âm tiết và phoneme
  - Xanh lá (≥80%), Vàng (60-79%), Đỏ (<60%)

**Cách sử dụng:**
1. Click vào thẻ để lật xem nghĩa
2. Click "UK" hoặc "US" để nghe phát âm
3. Scroll xuống phần "Luyện phát âm"
4. Click "Bắt đầu thu âm" → Nói từ → "Dừng thu âm"
5. Xem kết quả phân tích chi tiết

### 2️⃣ Trắc Nghiệm (Multiple Choice)

**Mục tiêu:** Kiểm tra khả năng hiểu nghĩa từ vựng

**Logic:**
- Hiển thị nghĩa tiếng Việt
- 4 đáp án là từ tiếng Anh (1 đúng + 3 nhiễu ngẫu nhiên)
- Tự động chuyển câu sau 2 giây

**Feedback:**
- ✅ Đúng: Nút xanh lá + tự động next
- ❌ Sai: Nút đỏ + hiện đáp án đúng (xanh lá) + tự động next

### 3️⃣ Nghe Từ (Listening)

**Mục tiêu:** Kiểm tra khả năng nhận diện từ qua âm thanh

**Logic:**
- Phát audio tự động khi vào câu
- Nút loa lớn ở giữa để nghe lại
- 4 đáp án là từ tiếng Anh

**Feedback:** Tương tự Trắc nghiệm

### 4️⃣ Ghép Từ (Unscramble)

**Mục tiêu:** Kiểm tra chính tả và cấu trúc từ

**Logic:**
- Hiển thị nghĩa tiếng Việt
- Các chữ cái bị xáo trộn
- Click để sắp xếp vào ô trống

**Actions:**
- "Đổi": Reset lại thứ tự chữ cái
- "Kiểm tra": Kiểm tra đáp án
- "Kết quả": Hiện đáp án đúng

### 5️⃣ Viết Từ (Typing)

**Mục tiêu:** Kiểm tra khả năng ghi nhớ chính tả hoàn toàn

**Logic:**
- Hiển thị nghĩa tiếng Việt
- Gõ từ tiếng Anh vào ô input

**Feedback:**
- ✅ Đúng: Input xanh lá
- ❌ Sai: Input đỏ + hiện đáp án đúng

## 🎨 Layout 3 Cột

### Cột Trái: Menu Tabs
- Tab 1: FlashCard
- Tab 2: Bài tập (với 4 sub-tabs)
  - Trắc nghiệm
  - Nghe từ
  - Ghép từ
  - Viết từ

### Khu Vực Giữa: Nội Dung Bài Tập
Hiển thị nội dung của tab đang chọn

### Cột Phải: Danh Sách Từ Vựng
- Hiển thị tất cả từ trong bộ
- Click vào từ → chuyển sang FlashCard mode của từ đó
- ✓ Icon xanh: Từ đã hoàn thành
- ○ Icon xám: Từ chưa hoàn thành

## 📊 Tracking Tiến Độ

Mỗi bài tập có:
- Progress bar (% hoàn thành)
- Score hiện tại (đúng / tổng số)
- Đánh dấu từ đã hoàn thành

## 🚀 Cách Truy Cập

1. Vào trang **Practice**
2. Click tab **Từ vựng**
3. Chọn bộ từ vựng (ví dụ: "Danh từ ngày 1")
4. Click nút **"Vào học"**
5. Sẽ mở trang exercises với đầy đủ tính năng

## 🔗 Route

```
/practice/vocabulary/:setId/exercises
```

## 🎯 Tips Học Hiệu Quả

1. **Bắt đầu với FlashCard**: Làm quen với từ mới
2. **Luyện phát âm ngay**: Ghi nhớ tốt hơn khi phát âm đúng
3. **Làm Trắc nghiệm**: Kiểm tra hiểu nghĩa
4. **Luyện Nghe**: Cải thiện listening skill
5. **Ghép từ & Viết từ**: Củng cố chính tả
6. **Theo dõi Progress**: Đảm bảo hoàn thành tất cả từ

## 🎨 Color Scheme

- 🟢 Xanh lá (`green-500`): Đúng / Tốt (≥80%)
- 🟡 Vàng (`yellow-500`): Khá (60-79%)
- 🔴 Đỏ (`red-500`): Sai / Cần cải thiện (<60%)
- 🔵 Xanh dương (`blue-500`): Highlight / Active

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui
- **Pronunciation AI**: Azure Speech SDK
- **State Management**: React Hooks
- **Routing**: React Router v6

## 📝 Note

- Tất cả bài tập tự động xáo trộn thứ tự để tránh ghi nhớ vị trí
- Pronunciation analysis chỉ hoạt động khi có microphone
- Cần kết nối Internet để sử dụng Azure Speech API

---

✨ **Happy Learning!** 🎓
