'use client';

import styles from '@greeny/story/Community.module.scss';
import { cancelLikePost, likePost } from '@/app/api/actions/postAction';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useModal from '@/hooks/useModal';
import { useRouter } from 'next/navigation';

type Props = {
  number: number;
  targetId: string;
  bookmarkId: number | undefined;
  content: string;
  onLikeClick?: () => void;
};

export default function Like({ number, targetId, bookmarkId, content, onLikeClick }: Props) {
  const isFilled = !!bookmarkId;
  const { data: session } = useSession();
  const { push } = useRouter();
  const { confirm } = useModal();

  const likePostWithId = async () => {
    if (!session) {
      return (await confirm('로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?')) && push('/login');
    }
    const res = await likePost.bind(null, targetId, content)();
    if (res.ok == 1 && onLikeClick) onLikeClick();
  };
  const cancelLikePostWithId = async () => {
    if (!bookmarkId) return;
    const res = await cancelLikePost.bind(null, bookmarkId.toString())();
    if (res.ok == 1 && onLikeClick) onLikeClick();
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    isFilled ? cancelLikePostWithId() : likePostWithId();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.icon_container}>
      <button type="submit">
        <Image src={`/images/LikeIcon_${isFilled ? 'sel' : 'nor'}.svg`} width={18} height={18} alt="좋아요" className={styles.icon} />
      </button>

      <span className={styles.number}>{number}</span>
    </form>
  );
}
