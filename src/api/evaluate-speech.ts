// Real TOEIC Speech Evaluation using OpenAI API
import OpenAI from 'openai';

export interface SpeechEvaluationResult {
  transcribedText: string;
  evaluation: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true // Note: In production, this should be done server-side
});

export async function evaluateSpeech(audioFile: File): Promise<SpeechEvaluationResult> {
  try {
    console.log("Starting speech evaluation...", {
      fileName: audioFile.name,
      fileType: audioFile.type,
      fileSize: audioFile.size
    });

    // Step 1: Transcribe audio using OpenAI Whisper
    console.log("Transcribing audio with Whisper...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Specify English for TOEIC
    });

    const transcribedText = transcription.text;
    console.log("Transcription result:", transcribedText);

    if (!transcribedText) {
      throw new Error("Failed to transcribe audio");
    }

    // Step 2: Evaluate the transcribed text using GPT
    console.log("Evaluating with GPT...");
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn là một giáo viên tiếng Anh chuyên về luyện thi TOEIC và là một chuyên gia đánh giá phát âm và ngữ pháp. 
               Nhiệm vụ của bạn là phân tích văn bản do người dùng cung cấp (được chuyển đổi từ giọng nói của họ) 
               và đưa ra phản hồi chi tiết, mang tính xây dựng.

               Phản hồi của bạn nên bao gồm các phần sau:
               1.  **Đánh giá Phát âm (Pronunciation Evaluation)**: Dựa trên các từ trong văn bản, hãy chỉ ra những từ có thể khó phát âm đối với người học tiếng Việt và gợi ý cách cải thiện (ví dụ: nhấn âm, âm cuối, nối âm). Giả định rằng văn bản này là những gì người dùng đã cố gắng nói.
               2.  **Phân tích Ngữ pháp và Cấu trúc câu (Grammar and Sentence Structure Analysis)**: Chỉ ra bất kỳ lỗi ngữ pháp nào (thì, mạo từ, giới từ, số ít/số nhiều, cấu trúc câu) và đề xuất cách sửa.
               3.  **Gợi ý Từ vựng và Cách diễn đạt (Vocabulary and Expression Suggestions)**: Đề xuất các từ hoặc cụm từ thay thế để làm cho câu nói tự nhiên hơn, chính xác hơn hoặc phù hợp hơn với ngữ cảnh TOEIC.
               4.  **Điểm mạnh (Strengths)**: Nêu bật những điểm tốt trong câu nói của người dùng.
               5.  **Lời khuyên chung (General Advice)**: Đưa ra một lời khuyên tổng quát để cải thiện kỹ năng nói tiếng Anh cho TOEIC.

               Hãy giữ phản hồi của bạn rõ ràng, súc tích và dễ hiểu. Sử dụng định dạng Markdown để dễ đọc.`
        },
        {
          role: "user",
          content: `Văn bản đã được chuyển đổi từ giọng nói: "${transcribedText}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const evaluationResult = evaluation.choices[0]?.message?.content || "Không thể tạo đánh giá.";
    console.log("Evaluation complete");

    return {
      transcribedText,
      evaluation: evaluationResult
    };

  } catch (error: any) {
    console.error("Error in speech evaluation:", error);
    
    // Provide specific error messages
    if (error.message?.includes('api key')) {
      throw new Error("Lỗi API Key. Vui lòng kiểm tra cấu hình OpenAI API Key.");
    } else if (error.message?.includes('quota')) {
      throw new Error("Đã vượt quá hạn mức API. Vui lòng thử lại sau.");
    } else if (error.message?.includes('network')) {
      throw new Error("Lỗi kết nối mạng. Vui lòng kiểm tra internet.");
    } else {
      throw new Error(`Lỗi đánh giá giọng nói: ${error.message || 'Unknown error'}`);
    }
  }
}
