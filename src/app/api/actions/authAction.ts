// 서버 액션 정의
'use server';
import { signIn } from '@/auth';

// email/password 로그인
export async function signInWithCredentials(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email') || '',
      password: formData.get('password') || '',
      redirect: false,
    });
  } catch (err) {
    throw new Error('로그인 실패');
  }
}

export async function signInWithGoogle(formData: FormData) {
  await signIn('google', { redirectTo: '/' });
}

export async function signInWithGithub(formData: FormData) {
  await signIn('github', { redirectTo: '/' });
}
