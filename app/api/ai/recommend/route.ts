import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import '@/lib/models/User';
import { Patient } from '@/lib/models/Patient';
import { Doctor } from '@/lib/models/Doctor';
import { AIConversation } from '@/lib/models/AIConversation';

/**
 * Uses Groq's free OpenAI-compatible API (api.groq.com).
 * Keys starting with gsk_ are Groq keys — set GROQ_API_KEY in .env.local.
 * Models are tried in order; falls back on 429 (rate limit) or model errors.
 */
const MODELS = [
  'llama-3.1-8b-instant',      // Fast, low latency — primary choice
  'llama3-8b-8192',            // Stable fallback
  'mixtral-8x7b-32768',        // Higher quality fallback
  'llama-3.3-70b-versatile',   // Best quality, heavier — last resort
];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<{ text: string | null; errorCode?: string }> {
  for (const model of MODELS) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: 0.65,
          max_tokens: 700,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        console.error('[MedAI] Invalid or expired API key');
        return { text: null, errorCode: 'AI_NOT_CONFIGURED' };
      }

      if (res.status === 429) {
        console.warn(`[MedAI] ${model}: rate limited, trying next model…`);
        continue;
      }

      if (!res.ok) {
        const body = await res.text();
        console.warn(`[MedAI] ${model} failed (${res.status}):`, body);
        continue;
      }

      const data = await res.json();
      const text: string | undefined = data.choices?.[0]?.message?.content;

      if (!text) {
        console.warn(`[MedAI] ${model}: empty response`);
        continue;
      }

      return { text };
    } catch (err) {
      console.warn(`[MedAI] ${model} threw:`, err);
    }
  }

  return { text: null, errorCode: 'AI_RATE_LIMITED' };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, patientId, conversationId } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI_NOT_CONFIGURED' }, { status: 503 });
    }

    await connectDB();

    // Patient is hardcoded to Caloocan (8th Ave area) — matches the frontend constant
    const PATIENT_LAT = 14.6560;
    const PATIENT_LNG = 120.9788;

    function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
      const R = 6371;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const [patient, doctors] = await Promise.all([
      Patient.findById(patientId).lean(),
      Doctor.find({})
        .select('firstname lastname specialty expertiseTags bio experience location')
        .lean(),
    ]);

    const p = patient as any;
    const bmiVal =
      p?.height && p?.weight
        ? ((p.weight / (p.height * p.height)) * 10000).toFixed(1)
        : null;
    const bmiStr = bmiVal ? `${bmiVal} (${bmiCategory(Number(bmiVal))})` : 'N/A';

    const doctorsList = (doctors as any[])
      .map(d => {
        const coords = d.location?.coordinates;
        const dist = coords
          ? `${haversineKm(PATIENT_LAT, PATIENT_LNG, coords.lat, coords.lng).toFixed(1)} km away`
          : 'distance unknown';
        const loc = d.location?.barangay
          ? `${d.location.barangay}, ${d.location.city ?? 'Caloocan'} — ${dist}`
          : dist;
        return (
          `• Dr. ${d.firstname} ${d.lastname} — ${d.specialty}` +
          (d.expertiseTags?.length ? ` [${d.expertiseTags.join(', ')}]` : '') +
          ` | 📍 ${loc}` +
          (d.experience ? ` | ${d.experience} yrs exp` : '')
        );
      })
      .join('\n');

    const systemPrompt = `You are MedAI, a warm and knowledgeable health assistant for a telehealth platform. Your job is to help patients understand their health needs and find the right specialist.

PATIENT HEALTH PROFILE:
• Location: Caloocan, Metro Manila
• Blood Type: ${p?.bloodType || 'Not recorded'}
• Height: ${p?.height || 'N/A'} cm | Weight: ${p?.weight || 'N/A'} kg | BMI: ${bmiStr}
• Allergies: ${p?.allergies?.length ? p.allergies.join(', ') : 'None reported'}
• Medical Conditions: ${p?.medicalHistory?.length ? p.medicalHistory.join(', ') : 'None reported'}

AVAILABLE SPECIALISTS (with distance from patient's location in Caloocan):
${doctorsList || 'No doctors currently listed.'}

GUIDELINES:
1. When asked about a SPECIFIC doctor: give a focused assessment covering (a) how their specialty and expertise match this patient's conditions, (b) whether their distance is convenient, and (c) an honest recommendation.
2. On general questions: proactively analyze the patient's health profile and recommend 2–3 relevant specialists from the list, prioritising both expertise match AND proximity.
3. For symptom questions, suggest which type of specialist would help and name the closest matching doctor.
4. Keep responses concise — 2–4 sentences per point, plain language.
5. Be warm and reassuring. Never diagnose — always recommend professional consultation.
6. If no matching specialist exists, say so honestly and suggest the nearest alternative.`;

    const groqMessages = (messages as any[]).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const { text, errorCode } = await callGroq(apiKey, systemPrompt, groqMessages);

    if (!text) {
      return NextResponse.json(
        { error: errorCode ?? 'AI_SERVICE_ERROR' },
        { status: errorCode === 'AI_RATE_LIMITED' ? 429 : errorCode === 'AI_NOT_CONFIGURED' ? 503 : 502 },
      );
    }

    // Persist the full updated conversation
    if (conversationId) {
      const allMessages = [
        ...(messages as any[]).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'assistant', content: text },
      ];
      // Derive a title from the first user message if it's still the default
      const firstUserMsg = (messages as any[]).find((m: any) => m.role === 'user');
      const autoTitle = firstUserMsg
        ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '…' : '')
        : undefined;
      await AIConversation.findByIdAndUpdate(conversationId, {
        messages: allMessages,
        lastMessageAt: new Date(),
        ...(autoTitle ? { title: autoTitle } : {}),
      });
    }

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('[MedAI] route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
