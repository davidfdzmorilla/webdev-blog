'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import type { ExtendedSession } from '@/lib/auth-types';
import { addComment, deleteComment, type Comment } from '@/app/actions/comments';
import Image from 'next/image';
import Link from 'next/link';

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: sessionData } = useSession();
  const session = sessionData as ExtendedSession | null;
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setIsSubmitting(true);
    setError('');

    try {
      await addComment({
        postId,
        content: newComment,
      });

      setNewComment('');
      window.location.reload(); // Refresh to show new comment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || !session) return;

    setIsSubmitting(true);
    setError('');

    try {
      await addComment({
        postId,
        content: replyContent,
        parentId,
      });

      setReplyContent('');
      setReplyingTo(null);
      window.location.reload(); // Refresh to show new reply
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      window.location.reload(); // Refresh after deletion
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {comment.user.avatarUrl ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={comment.user.avatarUrl}
                alt={comment.user.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900">{comment.user.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!isReply && session && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Reply
                  </button>
                )}
                {session &&
                  (comment.userId === session.user.id || session.user.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
              </div>
            </div>

            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">{comment.replies.map((reply) => renderComment(reply, true))}</div>
      )}
    </div>
  );

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({initialComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-700">
            Please{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              login
            </Link>{' '}
            or{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              sign up
            </Link>{' '}
            to comment.
          </p>
        </div>
      )}

      <div>{initialComments.map((comment) => renderComment(comment))}</div>

      {initialComments.length === 0 && (
        <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
