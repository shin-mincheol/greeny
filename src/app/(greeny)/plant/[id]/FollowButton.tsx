'use client';
import { PlantBookmark } from '@/types/bookmark';
import styles from './MyPlantDetail.module.scss';
import { followPlant, unFollowPlant } from '@/app/api/actions/followAction';
import useModal from '@/hooks/useModal';
import { useRouter } from 'next/navigation';

export default function FollowButton({ id, bookmarkData }: { id: string; bookmarkData: PlantBookmark[] }) {
  const { confirm } = useModal();
  const { push } = useRouter();
  const isLoggedIn = !!bookmarkData;
  const isFollowed = isLoggedIn ? bookmarkData.some((num) => Number(id) === num.product._id) : false;
  const LikeId = isLoggedIn ? bookmarkData.find((num) => Number(id) === num.product._id) : undefined;

  const handleFollow = async () => {
    if (isLoggedIn) {
      isFollowed ? unFollowPlant(LikeId?._id) : followPlant(id);
    } else {
      (await confirm('로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?')) && push('/login');
    }
  };

  return (
    <button type="button" className={isFollowed ? styles.unFollowBtn : styles.followBtn} onClick={handleFollow}>
      {isFollowed ? '관찰 끊기' : '관찰 하기'}
    </button>
  );
}
