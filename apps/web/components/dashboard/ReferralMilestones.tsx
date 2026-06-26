'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Rocket, CheckCircle } from '@phosphor-icons/react';

interface Milestone {
  referrals: number;
  reward: string;
  icon: any;
  color: string;
  description: string;
}

interface ReferralMilestonesProps {
  currentReferrals: number;
}

const MILESTONES: Milestone[] = [
  {
    referrals: 1,
    reward: '1 Month Free',
    icon: Star,
    color: 'bg-amber-100 text-amber-700',
    description: 'First successful referral',
  },
  {
    referrals: 3,
    reward: '3 Months Free',
    icon: Trophy,
    color: 'bg-blue-100 text-blue-700',
    description: 'Growing your network',
  },
  {
    referrals: 5,
    reward: '6 Months Free',
    icon: Crown,
    color: 'bg-purple-100 text-purple-700',
    description: 'Community leader',
  },
  {
    referrals: 10,
    reward: '1 Year Free',
    icon: Rocket,
    color: 'bg-green-100 text-green-700',
    description: 'Top referrer status',
  },
];

export function ReferralMilestones({ currentReferrals }: ReferralMilestonesProps) {
  const getCurrentMilestone = () => {
    let achieved = 0;
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (currentReferrals >= MILESTONES[i].referrals) {
        achieved = i;
        break;
      }
    }
    return achieved;
  };

  const currentMilestoneIndex = getCurrentMilestone();
  const nextMilestone = MILESTONES[currentMilestoneIndex + 1];
  const progressToNext = nextMilestone
    ? ((currentReferrals - MILESTONES[currentMilestoneIndex].referrals) / 
       (nextMilestone.referrals - MILESTONES[currentMilestoneIndex].referrals)) * 100
    : 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="font-space-grotesk font-bold text-2xl text-neutral900 mb-6">
        रेफरल माइलस्टोन
      </h2>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-brandGreen50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-neutral700">
              Next: {nextMilestone.reward}
            </span>
            <span className="text-sm text-neutral600">
              {currentReferrals}/{nextMilestone.referrals} referrals
            </span>
          </div>
          <div className="w-full bg-neutral200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-brandGreen700 h-2 rounded-full"
            />
          </div>
          <p className="text-xs text-neutral600 mt-2">
            {nextMilestone.referrals - currentReferrals} more to unlock {nextMilestone.reward}
          </p>
        </motion.div>
      )}

      {/* Milestones Grid */}
      <div className="space-y-4">
        {MILESTONES.map((milestone, index) => {
          const isAchieved = currentReferrals >= milestone.referrals;
          const isCurrent = index === currentMilestoneIndex;
          const isNext = index === currentMilestoneIndex + 1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                ${isAchieved 
                  ? 'border-green-300 bg-green-50' 
                  : isNext 
                    ? 'border-brandGreen-300 bg-brandGreen-50' 
                    : 'border-neutral-200 bg-neutral-50'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0
                ${isAchieved 
                  ? milestone.color 
                  : isNext 
                    ? 'bg-brandGreen-100 text-brandGreen-700' 
                    : 'bg-neutral-200 text-neutral-400'
                }
              `}>
                {isAchieved ? (
                  <CheckCircle size={24} weight="fill" />
                ) : (
                  <milestone.icon size={24} weight={isNext ? 'fill' : 'regular'} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral900">
                    {milestone.reward}
                  </h3>
                  {isAchieved && (
                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-semibold">
                      Achieved ✓
                    </span>
                  )}
                  {isNext && (
                    <span className="px-2 py-0.5 bg-brandGreen-600 text-white text-xs rounded-full font-semibold">
                      Next
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral600">{milestone.description}</p>
                <p className="text-xs text-neutral500 mt-1">
                  {milestone.referrals} referral{milestone.referrals > 1 ? 's' : ''} required
                </p>
              </div>

              {/* Referral Count Badge */}
              <div className={`
                px-3 py-1 rounded-full text-sm font-bold
                ${isAchieved 
                  ? 'bg-green-600 text-white' 
                  : isNext 
                    ? 'bg-brandGreen-700 text-white' 
                    : 'bg-neutral-200 text-neutral-600'
                }
              `}>
                {milestone.referrals}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All Achieved Message */}
      {currentReferrals >= MILESTONES[MILESTONES.length - 1].referrals && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-6 text-center"
        >
          <Rocket size={48} className="text-amber-600 mx-auto mb-3" weight="fill" />
          <h3 className="font-space-grotesk font-bold text-xl text-neutral900 mb-2">
            आप एक टॉप रेफरर हैं! 🏆
          </h3>
          <p className="text-neutral700">
            आपने सभी माइलस्टोन पूरे कर लिए हैं। धन्यवाद!
          </p>
        </motion.div>
      )}
    </div>
  );
}
