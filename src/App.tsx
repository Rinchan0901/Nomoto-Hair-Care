import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { INGREDIENT_OPTIONS, CONCERN_OPTIONS, REASON_OPTIONS } from './constants';
import { generateDiagnosis, DiagnosisResult } from './lib/gemini';

type Step = 'intro' | 'ingredients' | 'concerns' | 'reasons' | 'loading' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => setStep('ingredients');

  const handleNext = async () => {
    if (step === 'ingredients') setStep('concerns');
    else if (step === 'concerns') setStep('reasons');
    else if (step === 'reasons') {
      setStep('loading');
      try {
        const ingredients = INGREDIENT_OPTIONS.filter(o => selectedIngredients.includes(o.id)).map(o => o.label);
        const concerns = CONCERN_OPTIONS.filter(o => selectedConcerns.includes(o.id)).map(o => o.label);
        const reasons = REASON_OPTIONS.filter(o => selectedReasons.includes(o.id)).map(o => o.label);
        
        const result = await generateDiagnosis(ingredients, concerns, reasons);
        setDiagnosis(result);
        setStep('result');
      } catch (err) {
        console.error(err);
        setError('診断中にエラーが発生しました。もう一度お試しください。');
        setStep('reasons');
      }
    }
  };

  const handleBack = () => {
    if (step === 'ingredients') setStep('intro');
    else if (step === 'concerns') setStep('ingredients');
    else if (step === 'reasons') setStep('concerns');
  };

  const toggleSelection = (id: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(id)) {
      setter(current.filter(i => i !== id));
    } else {
      setter([...current, id]);
    }
  };

  const isNextDisabled = () => {
    if (step === 'ingredients') return selectedIngredients.length === 0;
    if (step === 'concerns') return selectedConcerns.length === 0;
    if (step === 'reasons') return selectedReasons.length === 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-stone-900 font-sans selection:bg-stone-200">
      <header className="w-full py-6 px-6 flex justify-center items-center border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="text-sm font-serif tracking-[0.2em] uppercase text-stone-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Hair Care Diagnosis
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-stone-800 leading-tight">
                  あなたの髪の悩み、<br className="md:hidden" />
                  シャンプーが原因かもしれません。
                </h1>
                <p className="text-stone-600 leading-relaxed max-w-lg mx-auto">
                  プロ美容師「野本潤」の知見を元に、あなたが現在使っているシャンプー成分と、理想の髪との「乖離（ギャップ）」を鋭く診断します。
                </p>
              </div>
              
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-colors w-full sm:w-auto"
              >
                診断を始める
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'ingredients' && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Step 01</span>
                <h2 className="text-2xl font-serif text-stone-800">シャンプーの裏側を見て、1行目〜3行目にある言葉を選んでください</h2>
                <p className="text-sm text-stone-500">※複数選択可。わからない場合は「その他」を選んでください。</p>
              </div>

              <div className="grid gap-3">
                {INGREDIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleSelection(opt.id, selectedIngredients, setSelectedIngredients)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedIngredients.includes(opt.id)
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className={`text-xs mt-1 ${selectedIngredients.includes(opt.id) ? 'text-stone-300' : 'text-stone-500'}`}>
                      代表例: {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'concerns' && (
            <motion.div
              key="concerns"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Step 02</span>
                <h2 className="text-2xl font-serif text-stone-800">今、あなたが「本当に解決したいこと」は何ですか？</h2>
                <p className="text-sm text-stone-500">※複数選択可</p>
              </div>

              <div className="grid gap-3">
                {CONCERN_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleSelection(opt.id, selectedConcerns, setSelectedConcerns)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedConcerns.includes(opt.id)
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'reasons' && (
            <motion.div
              key="reasons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Step 03</span>
                <h2 className="text-2xl font-serif text-stone-800">今のシャンプーを選んだ理由は何ですか？</h2>
                <p className="text-sm text-stone-500">※複数選択可</p>
              </div>

              <div className="grid gap-3">
                {REASON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleSelection(opt.id, selectedReasons, setSelectedReasons)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedReasons.includes(opt.id)
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center space-y-6 text-center"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-stone-900 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif text-stone-800">成分と悩みの乖離を分析中...</h3>
                <p className="text-sm text-stone-500">プロの視点であなたのヘアケアを診断しています</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && diagnosis && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <span className="inline-block px-3 py-1 bg-stone-200 text-stone-800 text-xs font-bold tracking-widest uppercase rounded-full">
                  Diagnosis Result
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-stone-900 leading-tight">
                  {diagnosis.title}
                </h2>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100 space-y-8">
                <div className="flex flex-col items-center justify-center py-6 border-b border-stone-100">
                  <div className="text-sm font-bold text-stone-400 tracking-widest uppercase mb-2">現在の乖離度</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-serif text-stone-900">{diagnosis.score}</span>
                    <span className="text-2xl text-stone-400">%</span>
                  </div>
                  <div className="w-full max-w-xs h-2 bg-stone-100 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${diagnosis.score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${diagnosis.score > 70 ? 'bg-red-500' : diagnosis.score > 40 ? 'bg-amber-500' : 'bg-stone-800'}`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-stone-400" />
                      乖離の正体
                    </h3>
                    <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {diagnosis.explanation}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-stone-400" />
                      プロの処方箋
                    </h3>
                    <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {diagnosis.prescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                <h3 className="text-xl font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  最終提案
                </h3>
                <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {diagnosis.proposal}
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-white text-stone-900 py-4 rounded-xl font-bold hover:bg-stone-100 transition-colors"
                  >
                    もう一度診断する
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {['ingredients', 'concerns', 'reasons'].includes(step) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mt-12 pt-6 border-t border-stone-200"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-800 font-medium transition-colors px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
            
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'reasons' ? '診断する' : '次へ'}
              {step !== 'reasons' && <ChevronRight className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
