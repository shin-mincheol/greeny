import styles from './page.module.scss';
import { auth } from '@/auth';
import Tab from '@components/Tab';
import { CoreErrorRes, SingleItem } from '@/types/response';
import { UserInfo } from '@/types/user';
import { Metadata } from 'next';
import PlantList from './PlantList';
import PostList from './PostList';
import Profile from './Profile';

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;
const DBNAME = process.env.NEXT_PUBLIC_DB_NAME;

export const metadata: Metadata = {
  title: 'Profile',
  openGraph: {
    title: 'Profile',
    description: 'User 프로필 페이지',
    images: 'images/MetaImage.png',
    url: '/profile',
  },
};

export default async function Page() {
  const session = await auth();

  const urlParam = session!.user!.id;
  const response = await fetch(`${SERVER}/users/${urlParam}`, {
    headers: {
      'client-id': `${DBNAME}`,
    },
  });
  const loginUserData: SingleItem<UserInfo> | CoreErrorRes = await response.json();

  const myPlant = await PlantList(urlParam!, true);
  const myPost = await PostList(urlParam!, true);

  return (
    <div className={styles.page_container}>
      <Profile userInfo={loginUserData} userId={session!.user?.id!} isMovable />
      <div className={styles.tab_container}>
        <Tab first={myPlant} second={myPost} firstSrOnly="식물" secondSrOnly="포스트" />
      </div>
    </div>
  );
}
