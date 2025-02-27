'use client';

import styles from '@greeny/story/Community.module.scss';
import { addReply } from '@/app/api/actions/postAction';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useModal from '@/hooks/useModal';
import { useRouter } from 'next/navigation';
import { useReplyContext } from '@/contexts/ReplyContext';

type Props = {
  postId: string;
};

type Form = { content: string };

export default function ReplyInput({ postId }: Props) {
  const { data: session } = useSession();
  const { push } = useRouter();
  const { alert, confirm } = useModal();
  const { register, handleSubmit, reset } = useForm<Form>();
  const { setMutateType } = useReplyContext();
  const addReplyWithId: SubmitHandler<Form> = async (formData: Form) => {
    if (!session) {
      return (await confirm('로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?')) && push('/login');
    }

    const resJson = await addReply.bind(null, postId)(formData.content.trim());
    if (resJson.ok) {
      reset();
      setMutateType('add');
    }
  };

  return (
    <form onSubmit={handleSubmit(addReplyWithId)} className={styles.reply_form}>
      <input
        type="text"
        placeholder="댓글을 입력해주세요."
        {...register('content', {
          validate: async (input) => {
            if (input.trim().length === 0) {
              await alert('내용을 입력해주세요');
              return 'no content';
            }
          },
        })}
      />
      <button className={styles.btn_submit} type="submit">
        <Image src="/images/CommentAddIcon.svg" width={18} height={18} alt="send" />
      </button>
    </form>
  );
}
