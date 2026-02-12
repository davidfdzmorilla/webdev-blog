'use client';

import { useState, useOptimistic } from 'react';
import { useSession } from '@/lib/auth-client';
import type { ExtendedSession } from '@/lib/auth-types';
import { toggleReaction, type ReactionType, type ReactionCounts } from '@/app/actions/reactions';
import Link from 'next/link';

interface ReactionBarProps {
  postId: string;
  initialCounts: ReactionCounts;
}

const reactionIcons: Record<ReactionType, string> = {
  like: '👍',
  heart: '❤️',
  fire: '🔥',
  clap: '👏',
};

export default function ReactionBar({ postId, initialCounts }: ReactionBarProps) {
  const { data: sessionData } = useSession();
  const session = sessionData as ExtendedSession | null;
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [optimisticCounts, addOptimisticUpdate] = useOptimistic(
    counts,
    (state, newReaction: ReactionType | null) => {
      const updated = { ...state };

      // Remove old reaction if any
      if (state.userReaction) {
        updated[state.userReaction]--;
        updated.total--;
      }

      // Add new reaction if provided
      if (newReaction) {
        updated[newReaction]++;
        updated.total++;
      }

      updated.userReaction = newReaction;
      return updated;
    }
  );

  const handleReaction = async (reactionType: ReactionType) => {
    if (!session || isSubmitting) return;

    setIsSubmitting(true);

    // Optimistic update
    if (optimisticCounts.userReaction === reactionType) {
      addOptimisticUpdate(null);
    } else {
      addOptimisticUpdate(reactionType);
    }

    try {
      const result = await toggleReaction(postId, reactionType);

      // Update actual state
      const newCounts = { ...counts };

      if (result.action === 'removed') {
        newCounts[reactionType]--;
        newCounts.total--;
        newCounts.userReaction = null;
      } else if (result.action === 'added') {
        // Remove old reaction count if changing type
        if (counts.userReaction && counts.userReaction !== reactionType) {
          newCounts[counts.userReaction]--;
        } else {
          newCounts.total++;
        }

        newCounts[reactionType]++;
        newCounts.userReaction = reactionType;
      }

      setCounts(newCounts);
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      // Revert optimistic update on error
      setCounts(counts);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-t border-b border-gray-200 my-6">
      {session ? (
        <>
          <div className="text-sm text-gray-500">React:</div>
          {(['like', 'heart', 'fire', 'clap'] as ReactionType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                optimisticCounts.userReaction === type
                  ? 'bg-blue-100 border-2 border-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              <span className="text-2xl">{reactionIcons[type]}</span>
              <span className="font-medium text-gray-900">{optimisticCounts[type]}</span>
            </button>
          ))}
          <div className="text-sm text-gray-500 ml-auto">
            {optimisticCounts.total} {optimisticCounts.total === 1 ? 'reaction' : 'reactions'}
          </div>
        </>
      ) : (
        <div className="text-center w-full py-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">
            Please{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              login
            </Link>{' '}
            to react to this post
          </span>
          <div className="flex justify-center items-center space-x-4 mt-2">
            {(['like', 'heart', 'fire', 'clap'] as ReactionType[]).map((type) => (
              <div key={type} className="flex items-center space-x-1">
                <span className="text-xl">{reactionIcons[type]}</span>
                <span className="text-sm text-gray-600">{optimisticCounts[type]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
