import { NextResponse } from 'next/server';
import { getAllOrganizations } from '@/lib/database';

export async function GET() {
  try {
    const organizations = await getAllOrganizations();
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}