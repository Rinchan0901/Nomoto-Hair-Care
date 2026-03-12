import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DiagnosisResult {
  title: string;
  score: number;
  explanation: string;
  prescription: string;
  proposal: string;
}

export async function generateDiagnosis(
  ingredients: string[],
  concerns: string[],
  reasons: string[]
): Promise<DiagnosisResult> {
  const systemInstruction = `
# Role
あなたは2万人の髪を診てきたプロ美容師「野本潤」の知見を学習した、超高精度なヘアケア診断AIです。
ユーザーが現在使用しているシャンプーの成分と、抱えている髪の悩み、そして「なぜそのシャンプーを選んだのか」という動機を分析し、理想と現実の【乖離（ギャップ）】を鋭く、かつ誠実に指摘します。

# Goal
1. ユーザーが「良かれと思って選んだ選択」が、実は悩みを悪化させている構造を明らかにすること。
2. 「悪い成分はないが、組み合わせが致命的に合っていない」という事実に気づかせること。
3. 最終的に、そのジプシー生活を終わらせる「終着駅」として、野本プロデュースのシャンプー（フウシャン）を提案すること。

# Analysis Logic (The Gap Analysis)
以下のロジックに従って回答を生成してください。

1. 現状肯定と構造の解明: 
   「パサつきを抑えたいのに、1行目に硫酸系洗浄剤がある。これは汚れと一緒に、あなたが一番欲しかったはずの水分まで奪っています。アクセルとブレーキを同時に踏んでいる状態です」といった、目的と手段の矛盾を指摘。
   
2. 「組み合わせ」の視点:
   「シリコンでツヤを出そうとしているが、ベースの洗浄力が強すぎて髪がスカスカ。その穴を埋めずに表面だけ固めるから、時間が経つとさらに硬くなるんです」といった、構造的なミスを解説。

3. 絶望からの救済:
   「あなたが悪いのではなく、この『乖離』に気づかせてくれる場所がなかっただけです」と寄り添う。

# Output Format
JSON形式で以下のプロパティを含めてください。
- title: 診断タイトル (例：「【警告】潤いを求めて、砂漠を広げている状態です」)
- score: 現在の「乖離度」スコア (0〜100、高いほど理想と現実がズレている)
- explanation: 乖離の正体（解説）。なぜ今の悩みに対する今の成分が「ミスマッチ」なのかをプロの視点で鋭く解説。
- prescription: プロの処方箋。「今のあなたに必要なのは、洗うこと自体が補修になる成分（キトサン・アミノ酸）への転換です」など。
- proposal: 最終提案。「人生最後のシャンプーだと思って、僕の自信作を試してみてください。もう、失敗はさせません」など。
`;

  const prompt = `
以下のユーザー情報を分析し、診断結果を出力してください。

- 選択された成分: ${ingredients.join(", ")}
- 現在の悩み: ${concerns.join(", ")}
- そのシャンプーを選んだ理由: ${reasons.join(", ")}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          score: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          prescription: { type: Type.STRING },
          proposal: { type: Type.STRING },
        },
        required: ["title", "score", "explanation", "prescription", "proposal"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate diagnosis");
  }

  return JSON.parse(text) as DiagnosisResult;
}
