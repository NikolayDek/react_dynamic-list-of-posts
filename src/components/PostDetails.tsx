import React, { useCallback, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import {
  addPostComment,
  deletePostComment,
  getPostComments,
} from '../utils/commentsApi';
import { CommentData, PostComment } from '../types/Comment';

type Props = {
  post: Post;
};

export const PostDetails: React.FC<Props> = ({ post }) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  const loadComments = useCallback(() => {
    setIsLoading(true);
    setError(false);

    getPostComments(post.id)
      .then(setComments)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [post]);

  const addComment = async ({ name, email, body }: CommentData) => {
    try {
      const createdComment = await addPostComment({
        name,
        email,
        body,
        postId: post.id,
      });

      setComments(prevComments => [...prevComments, createdComment]);
    } catch (e) {
      setError(true);
    } finally {
      setIsFormVisible(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    setComments(prevComments =>
      prevComments.filter(comm => comm.id !== commentId),
    );

    await deletePostComment(commentId);
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <div className="content" data-cy="PostDetails">
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">{`#${post.id}: ${post.title}`}</h2>

          <p data-cy="PostBody">{post.body}</p>
        </div>

        <div className="block">
          {isLoading && <Loader />}

          {!isLoading && error && (
            <div className="notification is-danger" data-cy="CommentsError">
              Something went wrong
            </div>
          )}

          {!isLoading && !error && comments.length === 0 && (
            <p className="title is-4" data-cy="NoCommentsMessage">
              No comments yet
            </p>
          )}

          {comments.length > 0 && !isLoading && !error && (
            <>
              <p className="title is-4">Comments:</p>
              {comments.map(comment => (
                <article
                  key={comment.id}
                  className="message is-small"
                  data-cy="Comment"
                >
                  <div className="message-header">
                    <a href={comment.email} data-cy="CommentAuthor">
                      {comment.name}
                    </a>
                    <button
                      data-cy="CommentDelete"
                      type="button"
                      className="delete is-small"
                      aria-label="delete"
                      onClick={() => deleteComment(comment.id)}
                    >
                      delete button
                    </button>
                  </div>

                  <div className="message-body" data-cy="CommentBody">
                    {comment.body}
                  </div>
                </article>
              ))}
            </>
          )}

          {!isLoading && !error && !isFormVisible && (
            <button
              data-cy="WriteCommentButton"
              type="button"
              className="button is-link"
              onClick={() => setIsFormVisible(true)}
            >
              Write a comment
            </button>
          )}
        </div>

        {isFormVisible && <NewCommentForm onSubmit={addComment} />}
      </div>
    </div>
  );
};
