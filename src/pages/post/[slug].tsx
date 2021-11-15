import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import Prismic from '@prismicio/client';
import styles from './post.module.scss';
import Loader from 'react-loader-spinner';
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineUser,
} from 'react-icons/ai';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  console.log('Before', post);

  let formattedPost: Post = {
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: post.data.title,
      banner: {
        url: post.data.banner.url,
      },
      author: post.data.author,
      content: post.data.content,
    },
  };
  console.log('After', formattedPost);

  return (
    <>
      <main className={styles.container}>
        <img
          src={formattedPost.data.banner.url || ''}
          alt={formattedPost.data.title}
        />
        <div className={styles.post}>
          <div className={styles.title}>{formattedPost.data.title}</div>
          <div className={styles.infos}>
            <div className={styles.info}>
              <AiOutlineCalendar />
              {formattedPost.first_publication_date}
            </div>
            <div className={styles.info}>
              <AiOutlineUser />
              {formattedPost.data.author}
            </div>
            <div className={styles.info}>
              <AiOutlineClockCircle />4 min
            </div>
          </div>

          <div className={styles.content}>
            {formattedPost.data.content.map(content => {
              return (
                <div key={content.heading}>
                  <div className={styles.heading}>{content.heading}</div>
                  <div className={styles.body}>
                    {content.body.map(item => (
                      <p key={item.text}>{item.text}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.uid'],
      pageSize: 5,
    }
  );

  const paths = posts.results.map(item => ({ params: { slug: item.uid } }));

  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post: Post = response;

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
