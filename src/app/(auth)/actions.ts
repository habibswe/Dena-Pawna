'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // When email enumeration protection is ON, Supabase returns a fake user object
  // for existing emails. We can detect this because the identities array will be empty.
  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
    return { error: 'A user with this email address already exists. Please log in.' }
  }

  if (!authData.user) {
    return { error: 'Failed to create user account. Please try again.' }
  }

  // Update profile with the name using admin client (bypasses RLS since user is not logged in yet)
  const adminClient = createAdminClient();
  await adminClient.from('profiles').update({ full_name: name }).eq('id', authData.user.id);

  // If session is null but we have a user, email confirmation is required
  if (authData.user && !authData.session) {
    return { success: true, message: 'Please check your email to confirm your account!' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
