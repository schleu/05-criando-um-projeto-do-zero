import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    formatPost(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination]);

  const formatPost = (data: Post[]) => {
    const formattedPost = data?.map(post => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    });
    setPosts(prev => [...prev, ...formattedPost]);
  };

  const handleNextPage = async () => {
    const result: PostPagination = await fetch(`${nextPage}`, { method: 'get' })
      .then(response => response.json())
      .catch(err => console.error('err', err));
    formatPost(result.results);
    setNextPage(result.next_page);
  };

  return (
    <>
      <div className={styles.posts}>
        {posts?.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`} prefetch>
            <a className={styles.a}>
              <strong className={styles.title}>{post.data.title}</strong>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={styles.dateAuthor}>
                <time className={styles.date}>
                  <AiOutlineCalendar />
                  {post.first_publication_date}
                </time>
                <p className={styles.author}>
                  <AiOutlineUser />
                  {post.data.author}
                </p>
              </div>
            </a>
          </Link>
        ))}

        {nextPage && (
          <div
            onClick={() => {
              handleNextPage();
            }}
            className={styles.more}
          >
            Carregar mais posts
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle || 'Subtitle',
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
