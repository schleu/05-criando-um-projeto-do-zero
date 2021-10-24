import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { GetServerSideProps, GetStaticProps } from 'next';

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
  return (
    <>
      <div className={styles.posts}>
        {postsPagination.results?.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`} prefetch>
            <a className={styles.a}>
              <strong className={styles.title}>{post.data.title}</strong>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={styles.dateAuthor}>
                <time className={styles.date}>
                  <AiOutlineCalendar />
                  {new Date(post.first_publication_date).toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }
                  )}
                </time>
                <p className={styles.author}>
                  <AiOutlineUser />
                  {post.data.author}
                </p>
              </div>
            </a>
          </Link>
        ))}

        {postsPagination.next_page && (
          <div className={styles.more}>
            <Link href={`?page=${postsPagination.next_page}`}>
              Carregar mais posts
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 5,
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
        next_page: postsResponse.next_page && postsResponse.page + 1,
        results: posts,
      },
    },
  };
};
