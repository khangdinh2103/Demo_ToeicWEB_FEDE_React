/**
 * VocabularyDebugger Component
 * 
 * Component debug để test tính năng vocabulary practice
 * Hiển thị thông tin chi tiết về API calls và responses
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { vocabularyApi } from "@/api/vocabularyApi";
import type { VocabularySet, FlashCard, PronunciationResult } from "@/api/vocabularyApi";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VocabularyDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Test: Load vocabulary sets
  const testLoadSets = async (partOfSpeech: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await vocabularyApi.getVocabularySets({
        part_of_speech: partOfSpeech,
        page: 1,
        limit: 10,
      });
      setVocabularySets(result?.data || []);
      console.log("✅ Vocabulary Sets:", result);
    } catch (err: any) {
      setError(err.message || "Failed to load vocabulary sets");
      console.error("❌ Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Test: Load flashcards
  const testLoadFlashCards = async (setId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyApi.getVocabularySetById(setId);
      setFlashCards(data?.cards || []);
      setSelectedSet(data);
      console.log("✅ FlashCards:", data);
    } catch (err: any) {
      setError(err.message || "Failed to load flashcards");
      console.error("❌ Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Test: Pronunciation assessment
  const testPronunciation = async (word: string) => {
    setIsLoading(true);
    setError(null);
    setPronunciationResult(null);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        console.log("📼 Audio recorded, size:", audioBlob.size);

        try {
          const result = await vocabularyApi.assessPronunciation(audioBlob, word);
          setPronunciationResult(result);
          console.log("✅ Pronunciation Result:", result);
        } catch (err: any) {
          setError(err.message || "Failed to assess pronunciation");
          console.error("❌ Error:", err);
        } finally {
          setIsLoading(false);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to access microphone");
      console.error("❌ Error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Vocabulary Feature Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Component debug để test các API calls và tính năng vocabulary practice
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="sets">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sets">Vocabulary Sets</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
        </TabsList>

        {/* Tab 1: Vocabulary Sets */}
        <TabsContent value="sets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Load Vocabulary Sets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {["noun", "verb", "adjective", "adverb"].map((pos) => (
                  <Button
                    key={pos}
                    onClick={() => testLoadSets(pos)}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </Button>
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {vocabularySets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Loaded {vocabularySets.length} sets</span>
                  </div>
                  {vocabularySets.map((set) => (
                    <div key={set._id} className="border p-4 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{set.title}</h4>
                          <p className="text-sm text-gray-600">
                            Day {set.day_number} • {set.total_cards || 0} cards
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => testLoadFlashCards(set._id)}
                        >
                          Load Cards
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Flashcards */}
        <TabsContent value="flashcards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flashcards Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSet && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{selectedSet.title}</h3>
                  <p className="text-sm text-gray-600">
                    {flashCards.length} flashcards
                  </p>
                </div>
              )}

              {flashCards.map((card, idx) => (
                <div key={card._id} className="border p-4 rounded space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary">Card {idx + 1}</Badge>
                      <h4 className="text-xl font-bold mt-2">{card.term}</h4>
                      {card.ipa && (
                        <p className="text-gray-600 font-mono">/{card.ipa}/</p>
                      )}
                      <p className="text-gray-900 mt-2">{card.mainMeaning}</p>
                    </div>
                  </div>

                  {card.collocations && card.collocations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold">Collocations:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {card.collocations.map((col, i) => {
                          const label = typeof col === 'string'
                            ? col
                            : `${col.phrase}${col.meaning ? ` — ${col.meaning}` : ''}`;
                          return (
                            <Badge key={i} variant="outline">
                              {label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {card.example && (
                    <div className="bg-gray-50 p-3 rounded">
                      {typeof card.example === 'string' ? (
                        <p className="text-sm italic">"{card.example}"</p>
                      ) : (
                        <>
                          <p className="text-sm italic">"{card.example.sentence}"</p>
                          {card.example.translation && (
                            <p className="text-sm text-gray-600 mt-1">{card.example.translation}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    {card.audioUS_url && (
                      <Badge variant="secondary">🔊 US Audio</Badge>
                    )}
                    {card.audioUK_url && (
                      <Badge variant="secondary">🔊 UK Audio</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Pronunciation */}
        <TabsContent value="pronunciation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Pronunciation Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Click button để test phát âm từ "hello" (sẽ tự động thu âm 3 giây)
                </p>
                <Button
                  onClick={() => testPronunciation("hello")}
                  disabled={isLoading || isRecording}
                >
                  {isRecording ? (
                    <>
                      <div className="animate-pulse mr-2 h-3 w-3 rounded-full bg-red-500" />
                      Recording... (3s)
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Test Pronunciation (hello)"
                  )}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {pronunciationResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Pronunciation analyzed successfully</span>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="border p-3 rounded text-center">
                      <div className="text-2xl font-bold">
                        {pronunciationResult.scores.overall?.toFixed(0) || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600">Overall</div>
                    </div>
                    <div className="border p-3 rounded text-center">
                      <div className="text-2xl font-bold">
                        {pronunciationResult.scores.accuracy?.toFixed(0) || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="border p-3 rounded text-center">
                      <div className="text-2xl font-bold">
                        {pronunciationResult.scores.fluency?.toFixed(0) || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600">Fluency</div>
                    </div>
                    <div className="border p-3 rounded text-center">
                      <div className="text-2xl font-bold">
                        {pronunciationResult.scores.completeness?.toFixed(0) || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600">Completeness</div>
                    </div>
                  </div>

                  <div className="border p-4 rounded">
                    <h4 className="font-semibold mb-2">Syllables Analysis</h4>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(pronunciationResult.syllables, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
