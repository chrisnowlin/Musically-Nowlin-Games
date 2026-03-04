import React, { useState, useEffect } from 'react';
import { X, Sparkles, Sun, Moon, Star, Wind } from 'lucide-react';

type GameType = 'runeCast' | 'cardReading' | 'omenSigns';
type Rune = typeof RUNES[number];

interface Props {
  playerGold: number;
  onResult: (goldChange: number) => void;
  onClose: () => void;
}

const OFFERING_OPTIONS = [10, 25, 50, 100];

const RUNES = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz'] as const;

const TAROT_CARDS = [
  { name: 'The Star', icon: Star, value: 50, meaning: 'Good fortune ahead' },
  { name: 'The Sun', icon: Sun, value: 75, meaning: 'Prosperity shines' },
  { name: 'The Moon', icon: Moon, value: 100, meaning: 'Hidden opportunities' },
  { name: 'The Winds', icon: Wind, value: 150, meaning: 'Great change coming' },
] as const;

const generateOmenPattern = (): number[] => {
  const pattern = [];
  for (let i = 0; i < 4; i++) {
    pattern.push(Math.random() < 0.5 ? 0 : 1);
  }
  return pattern;
};

const FortuneModal: React.FC<Props> = ({ playerGold, onResult, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('runeCast');
  const [offering, setOffering] = useState<number>(10);
  const [result, setResult] = useState<{ won: boolean; amount: number; detail: string } | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
  const [revealedCard, setRevealedCard] = useState<null | { card: typeof TAROT_CARDS[number]; result: boolean }>(null);
  const [signsFlipped, setSignsFlipped] = useState<number[]>([]);
  const [finalSignReveal, setFinalSignReveal] = useState<number | null>(null);
  const [omenPattern, setOmenPattern] = useState<number[]>(generateOmenPattern());

  const castRune = (rune: Rune) => {
    setIsCasting(true);
    setSelectedRune(rune);
    setTimeout(() => {
      const blessing = Math.random() < 0.4;
      const amount = blessing ? Math.floor(offering * 1.8) : -Math.floor(offering * 0.2);
      const detail = blessing 
        ? `The ${rune} rune glows with power! +${amount} gold`
        : `The ${rune} rune fades... -${Math.abs(amount)} gold (small misfortune)`;
      setResult({ won: blessing, amount, detail });
      onResult(amount);
      setIsCasting(false);
    }, 1200);
  };

  const drawTarot = () => {
    setIsCasting(true);
    setRevealedCard(null);
    setTimeout(() => {
      const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
      const success = Math.random() < 0.35;
      const amount = success ? card.value : -offering;
      const detail = success 
        ? `You drew ${card.name}! ${card.meaning}. +${amount} gold`
        : `You drew ${card.name}... The stars are not aligned. -${offering} gold`;
      setRevealedCard({ card, result: success });
      setResult({ won: success, amount, detail });
      onResult(amount);
      setIsCasting(false);
    }, 1500);
  };

  const flipSign = (index: number) => {
    if (signsFlipped.includes(index) || finalSignReveal !== null || isCasting) return;
    
    const newFlipped = [...signsFlipped, index];
    setSignsFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setIsCasting(true);
      setTimeout(() => {
        const match = omenPattern[newFlipped[0]] === omenPattern[newFlipped[1]];
        const amount = match ? Math.floor(offering * 2) : -Math.floor(offering * 0.3);
        const detail = match 
          ? `The signs align! +${amount} gold`
          : `The spirits whisper misfortune... -${Math.abs(amount)} gold`;
        setResult({ won: match, amount, detail });
        onResult(amount);
        setFinalSignReveal(match ? newFlipped[0] : null);
        setIsCasting(false);
      }, 1000);
    }
  };

  const resetGame = () => {
    setResult(null);
    setSelectedRune(null);
    setRevealedCard(null);
    setSignsFlipped([]);
    setFinalSignReveal(null);
    if (selectedGame === 'omenSigns') {
      setOmenPattern(generateOmenPattern());
    }
  };

  const canOffer = offering <= playerGold && !isCasting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border-2 border-purple-500 bg-gradient-to-b from-purple-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold text-purple-300">Mystic Circle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <p className="text-center text-purple-400/70 text-sm mb-4 italic shrink-0">
          &quot;Ancient forces guide those who seek wisdom...&quot;
        </p>

        <div className="flex justify-center mb-4 shrink-0">
          <span className="text-amber-400 font-bold text-lg">
            {'\uD83E\uDE99'} {playerGold} gold
          </span>
        </div>

        {!result && (
          <>
            <div className="flex gap-2 mb-4 shrink-0">
              {OFFERING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setOffering(opt)}
                  disabled={opt > playerGold}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                    offering === opt
                      ? 'bg-purple-600 text-white'
                      : opt > playerGold
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
              {playerGold > 100 && (
                <button
                  onClick={() => setOffering(playerGold)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                    offering === playerGold
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  ALL
                </button>
              )}
            </div>

            <div className="flex gap-2 mb-4 shrink-0">
              {(['runeCast', 'cardReading', 'omenSigns'] as GameType[]).map((game) => (
                <button
                  key={game}
                  onClick={() => { setSelectedGame(game); resetGame(); }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedGame === game
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {game === 'runeCast' && 'Runes'}
                  {game === 'cardReading' && 'Tarot'}
                  {game === 'omenSigns' && 'Omens'}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
              {selectedGame === 'runeCast' && (
                <div className="text-center">
                  <p className="text-gray-300 mb-4 text-sm">Choose a rune to cast your offering.</p>
                  {!selectedRune && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {RUNES.map((rune) => (
                          <button
                            key={rune}
                            onClick={() => canOffer && castRune(rune)}
                            disabled={!canOffer}
                            className={`py-3 px-4 rounded-lg font-bold transition-all ${
                              canOffer
                                ? 'bg-gradient-to-br from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white border border-purple-600/50'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="inline mr-2" size={16} />
                            {rune}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {selectedRune && isCasting && (
                    <div className="text-purple-300 animate-pulse">
                      <Sparkles className="inline animate-spin mr-2" size={24} />
                      Casting {selectedRune}...
                    </div>
                  )}
                </div>
              )}

              {selectedGame === 'cardReading' && (
                <div className="text-center">
                  {!revealedCard && !isCasting && (
                    <>
                      <p className="text-gray-300 mb-2 text-sm">Draw a card to receive guidance.</p>
                      <button
                        onClick={drawTarot}
                        disabled={!canOffer}
                        className={`py-3 px-8 rounded-xl font-bold text-lg transition-all ${
                          canOffer
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Star className="inline mr-2" size={20} />
                        Draw Card ({offering} gold)
                      </button>
                    </>
                  )}
                  {isCasting && (
                    <div className="text-purple-300 animate-pulse">
                      <Star className="inline spin-slow mr-2" size={32} />
                      The cards reveal...
                    </div>
                  )}
                  {revealedCard && (
                    <div className="text-center">
                      <div className={`text-5xl mb-3 ${revealedCard.result ? 'text-amber-400' : 'text-gray-500'}`}>
                        <revealedCard.card.icon size={64} />
                      </div>
                      <p className={`font-bold text-lg ${revealedCard.result ? 'text-green-400' : 'text-red-400'}`}>
                        {revealedCard.card.name}
                      </p>
                      <p className="text-gray-400 text-sm">{revealedCard.card.meaning}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedGame === 'omenSigns' && (
                <div className="text-center">
                  {!finalSignReveal && (
                    <>
                      <p className="text-gray-300 mb-2 text-sm">Flip two signs. Match them for fortune.</p>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => flipSign(i)}
                            disabled={!canOffer || signsFlipped.includes(i)}
                            className={`py-4 rounded-lg font-bold text-xl transition-all ${
                              signsFlipped.includes(i)
                                ? 'bg-purple-700 text-white'
                                : canOffer
                                  ? 'bg-gray-800 hover:bg-gray-700 text-purple-300'
                                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {signsFlipped.includes(i) || finalSignReveal !== null 
                              ? (omenPattern[i] === 0 ? '☀' : '☽') 
                              : '?'}
                          </button>
                        ))}
                      </div>
                      {isCasting && (
                        <p className="text-purple-300 animate-pulse text-sm">
                          <Sparkles className="inline animate-spin mr-1" size={14} />
                          Consulting the spirits...
                        </p>
                      )}
                    </>
                  )}
                  {finalSignReveal !== null && (
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {omenPattern[finalSignReveal] === 0 ? '☀☀' : '☽☽'}
                      </div>
                      <p className="text-green-400 font-bold">The signs align!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {result && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`text-5xl mb-3 ${result.won ? 'animate-bounce' : ''}`}>
              {result.won ? '\u2728' : '\uD83E\uDEC6'}
            </div>
            <p className={`text-lg font-bold mb-2 ${result.won ? 'text-green-400' : result.amount === 0 ? 'text-gray-400' : 'text-red-400'}`}>
              {result.detail}
            </p>
            <p className={`text-2xl font-bold ${result.amount > 0 ? 'text-green-400' : result.amount < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {result.amount > 0 ? `+${result.amount}` : result.amount} gold
            </p>
            <button
              onClick={resetGame}
              className="mt-6 py-2 px-6 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white"
            >
              Consult Again
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors shrink-0"
        >
          Leave Circle
        </button>
      </div>
    </div>
  );
};

export default FortuneModal;