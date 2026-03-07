import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'

export async function GET() {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId

  const quotes = await getPrisma().quote.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(quotes)
}

export async function POST(req: Request) {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId
  const body = await req.json()

  const quote = await getPrisma().quote.create({
    data: {
      organizationId,
      data: body.data,
    },
  })

  return NextResponse.json(quote, { status: 201 })
}
