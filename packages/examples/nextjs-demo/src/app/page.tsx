import Image from 'next/image'
import styles from './page.module.css'
import SDKContainer from './SDKContainer'

export default function Home() {
  return (
    <main className={styles.main}>
      <SDKContainer></SDKContainer>
    </main>
  )
}
