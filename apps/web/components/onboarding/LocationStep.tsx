'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface LocationStepProps {
  onNext: (data: { district: string }) => void;
  onBack: () => void;
  initialData?: { district?: string };
}

const DISTRICTS = [
  { id: 'gorakhpur', nameHi: 'गोरखपुर', nameEn: 'Gorakhpur' },
  { id: 'deoria', nameHi: 'देवरिया', nameEn: 'Deoria' },
  { id: 'kushinagar', nameHi: 'कुशीनगर', nameEn: 'Kushinagar' },
  { id: 'basti', nameHi: 'बस्ती', nameEn: 'Basti' },
  { id: 'maharajganj', nameHi: 'महाराजगंज', nameEn: 'Maharajganj' },
  { id: 'sant_kabir_nagar', nameHi: 'संत कबीर नगर', nameEn: 'Sant Kabir Nagar' },
];

export function LocationStep({ onNext, onBack, initialData }: LocationStepProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    initialData?.district || null
  );
  const [showOther, setShowOther] = useState(false);

  const handleNext = () => {
    if (selectedDistrict) {
      onNext({ district: selectedDistrict });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-neutral-600 text-sm hover:text-neutral-900 transition-colors"
      >
        ← पिछला
      </button>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center font-space-grotesk">
        आपकी farm कहाँ है?
      </h1>
      <p className="text-neutral-600 text-center">
        हम आपके जिले का सटीक भाव दिखाएंगे
      </p>

      {/* District Cards */}
      {!showOther ? (
        <div className="grid grid-cols-2 gap-3">
          {DISTRICTS.map((district) => (
            <motion.button
              key={district.id}
              onClick={() => setSelectedDistrict(district.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${selectedDistrict === district.id
                  ? 'border-brandGreen-700 bg-brandGreen-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
                }
              `}
            >
              <div className="text-center">
                <p className="font-semibold text-neutral-900 text-sm">{district.nameHi}</p>
                <p className="text-xs text-neutral-500 mt-1">{district.nameEn}</p>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <select
            className="w-full min-h-[52px] py-4 px-4 rounded-xl border-2 border-neutral-200 bg-white focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500 outline-none"
            onChange={(e) => setSelectedDistrict(e.target.value)}
            value={selectedDistrict || ''}
          >
            <option value="">जिला चुनें</option>
            {DISTRICTS.map((district) => (
              <option key={district.id} value={district.id}>
                {district.nameHi} ({district.nameEn})
              </option>
            ))}
            <option value="other">अन्य जिला</option>
          </select>
          <p className="text-xs text-neutral-500 text-center">
            Phase 0 में सिर्फ Gorakhpur belt cover है। आपका जिला Phase 1 में आएगा।
          </p>
        </div>
      )}

      {/* Other District Link */}
      {!showOther && (
        <button
          onClick={() => setShowOther(true)}
          className="w-full text-center text-sm text-brandGreen-600 hover:underline"
        >
          मेरा जिला यहाँ नहीं है →
        </button>
      )}

      {/* CTA */}
      <button
        onClick={handleNext}
        disabled={!selectedDistrict}
        className="w-full min-h-[52px] py-4 bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        आगे →
      </button>
    </motion.div>
  );
}
