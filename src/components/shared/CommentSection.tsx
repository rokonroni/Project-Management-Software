import { IComment, IUser } from "@/types";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useState } from "react";

interface CommentSectionProps {
  comments: IComment[];
  currentUserId: string;
  onAddComment: (content: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => void;
  placeholder?: string;
  showRoleBadge?: boolean;
}

export function CommentSection({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
  placeholder = "Write a comment...",
  showRoleBadge = true,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddComment(newComment);
    if (success) {
      setNewComment("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Add Your Comment
        </label>
        <textarea
          className="input min-h-[100px]"
          placeholder={placeholder}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>💡</span>
            Keep your team updated with regular communication
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          Comments ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-blue-600" />
            </div>
            <p className="text-gray-500 font-medium">No comments yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const author =
                typeof comment.author === "string"
                  ? { _id: comment.author, name: "Unknown", role: "developer" }
                  : (comment.author as IUser);
              const isOwner = author._id === currentUserId;

              return (
                <div
                  key={comment._id}
                  className="card p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            author.role === "manager"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : "bg-gradient-to-br from-purple-500 to-purple-600"
                          }`}
                        >
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {author.name}
                            </span>
                            {showRoleBadge && (
                              <span
                                className={`badge text-xs ${
                                  author.role === "manager"
                                    ? "badge-primary"
                                    : "badge-purple"
                                }`}
                              >
                                {author.role === "manager"
                                  ? "👔 Manager"
                                  : "💻 Developer"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-12">
                        {comment.content}
                      </p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() =>
                          comment._id && onDeleteComment(comment._id)
                        }
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
