import styles from './header.module.scss';
import Link from 'next/link';
export default function Header() {
  return (
    <header className={styles.headerContent}>
      <div>
        <Link href="/" prefetch>
          <img src="/images/logo.png" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
