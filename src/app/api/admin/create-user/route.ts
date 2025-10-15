import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('URL:', supabaseUrl)
  console.log('SERVICE ROLE KEY exists:', !!serviceRoleKey)

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key')
    return NextResponse.json(
      { error: 'Server misconfiguration: missing Supabase environment variables.' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { email, password, name, screens } = await req.json()

    // 1️⃣ Create Auth user
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2️⃣ Insert into "users" table
    const { error: dbError } = await supabaseAdmin.from('users').insert([
      {
        id: user.user.id,
        email,
        name,
        screens,
      },
    ])

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API create-user unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
