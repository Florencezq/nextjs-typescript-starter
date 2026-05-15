'use server';

import { AuthError } from 'next-auth';
import { signIn } from 'app/auth';
import { createUser, getUser } from 'app/db';

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

export async function loginAction(
  email: string,
  password: string,
): Promise<AuthActionState> {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message: '邮箱或密码不正确。',
      };
    }

    return {
      ok: false,
      message: '登录失败，请稍后重试。',
    };
  }
}

export async function registerAction(
  email: string,
  password: string,
): Promise<AuthActionState> {
  const existing = await getUser(email);

  if (existing.length > 0) {
    return {
      ok: false,
      message: '这个邮箱已经注册，请直接登录。',
    };
  }

  try {
    await createUser(email, password);
    return loginAction(email, password);
  } catch {
    return {
      ok: false,
      message: '注册失败，请稍后重试。',
    };
  }
}
