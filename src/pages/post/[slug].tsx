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
  return (
    <>
      <head>
        <title>Home | Ignews</title>
      </head>
      {!post.first_publication_date ? (
        <div className={styles.loading}>
          <Loader type="TailSpin" height={48} width={48} color="#ff57b2" />
          Carregando...
        </div>
      ) : (
        <main className={styles.container}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <div className={styles.post}>
            <div className={styles.title}>{post.data.title}</div>
            <div className={styles.infos}>
              <div className={styles.info}>
                <AiOutlineCalendar />
                {post.first_publication_date}
              </div>
              <div className={styles.info}>
                <AiOutlineUser />
                {post.data.author}
              </div>
              <div className={styles.info}>
                <AiOutlineClockCircle />
                4min
              </div>
            </div>

            <div className={styles.content}>
              {post.data.content.map(content => {
                return (
                  <div key={content.heading}>
                    <div className={styles.heading}>{content.heading}</div>
                    <div className={styles.body}>
                      {content.body.map(item => (
                        <p>{item.text}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}
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
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  console.log('response', response);
  let post = {};

  if (response) {
    post = {
      first_publication_date: new Date(
        response.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        title: response.data.title,
        banner: {
          url: response.data.banner.url,
        },
        author: response.data.author,
        content: response.data.content,
      },
    };
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
