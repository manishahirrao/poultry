import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { leadMagnetTemplateEmail, leadMagnetChecklistEmail } from '@/lib/email-templates/lead-magnet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, district, magnetType } = body;

    // Validate required fields
    if (!email || !magnetType) {
      return NextResponse.json(
        { error: 'Email and magnet type are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    // Insert or update lead
    const leadData = {
      email,
      district: district || null,
      magnet_type: magnetType,
      source: 'lead_magnet_landing',
      status: 'delivered',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingLead) {
      // Update existing lead
      await (supabase.from('leads') as any)
        .update(leadData)
        .eq('email', email);
    } else {
      // Insert new lead
      await (supabase.from('leads') as any)
        .insert(leadData);
    }

    // Send email (this would integrate with your email service)
    // For now, we'll log the email content
    const emailTemplate = magnetType === 'template' 
      ? leadMagnetTemplateEmail(email, district)
      : leadMagnetChecklistEmail(email, district);

    // TODO: Integrate with your email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'FlockIQ <leads@FlockIQ.ai>',
    //   to: email,
    //   subject: emailTemplate.subject,
    //   html: emailTemplate.htmlContent,
    //   text: emailTemplate.textContent,
    // });

    console.log('Email would be sent to:', email);
    console.log('Subject:', emailTemplate.subject);

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      downloadUrl: magnetType === 'template'
        ? '/lead-magnets/price-forecast-template.csv'
        : '/lead-magnets/price-swing-checklist.md',
    });

  } catch (error) {
    console.error('Lead magnet submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
