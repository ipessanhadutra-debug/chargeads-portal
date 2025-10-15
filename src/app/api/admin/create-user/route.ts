import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('URL:', supabaseUrl)
  console.log('SERVICE ROLE KEY exists:', !!serviceRoleKey)

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Key')
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { email, password, name, screens } = await req.json()

    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { error: dbError } = await supabaseAdmin.from('users').insert([
      { id: user.user.id, email, name, screens },
    ])

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API create-user error:', error)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
