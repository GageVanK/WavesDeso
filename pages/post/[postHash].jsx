import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSinglePost, getPostsStateless } from 'deso-protocol';
import { Space, Container, Group } from '@mantine/core';
import Post from '@/components/Post';

export default function PostPage() {
  const router = useRouter();
  const { postHash } = router.query;
  const [singlePost, setSinglePost] = useState({});
  const [topLevelComments, setTopLevelComments] = useState([]);

  const fetchCommentsRecursively = async (comments) => {
    const updatedComments = [];
    for (const comment of comments) {
      const commentData = await getSinglePost({
        PostHashHex: comment.PostHashHex,
        CommentLimit: 50,
      });

      comment.Comments = commentData.PostFound.Comments;
      if (comment.Comments && comment.Comments.length > 0) {
        comment.Comments = await fetchCommentsRecursively(comment.Comments);
      }

      updatedComments.push(comment);
    }
    return updatedComments;
  };

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postData = await getSinglePost({
          PostHashHex: postHash,
          CommentLimit: 50,
        });

        setSinglePost(postData.PostFound);
 
        // Fetch top-level comments
        setTopLevelComments(postData.PostFound.Comments);
   
        // Fetch nested comments recursively
        const updatedTopLevelComments = await fetchCommentsRecursively(postData.PostFound.Comments);
        setTopLevelComments(updatedTopLevelComments);
    
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    if (postHash) {
      fetchPostAndComments();
    }
  }, [postHash]);

  const Comment = ({ comment }) => (
    <Container size="lg" key={comment.PostHashHex}>
      <Post post={comment} username={comment.ProfileEntryResponse?.Username || 'Anon'} />
      {comment.Comments && comment.Comments.length > 0 && (
        <Container style={{ marginLeft: '20px' }}>
          {comment.Comments.map((nestedComment) => (
            <Comment key={nestedComment.PostHashHex} comment={nestedComment} />
          ))}
        </Container>
      )}
    </Container>
  );

  return (
    <>
      <Space h={55} />
      <Container size="xxl">
        <Post
          post={singlePost}
          username={singlePost.ProfileEntryResponse?.Username}
          key={singlePost.PostHashHex}
        />
      </Container>

      {topLevelComments && topLevelComments.length > 0 ? (
        topLevelComments.map((comment) => <Comment key={comment.PostHashHex} comment={comment} />)
      ) : (
        <></>
      )}
      <Space h={111} />
    </>
  );
}
