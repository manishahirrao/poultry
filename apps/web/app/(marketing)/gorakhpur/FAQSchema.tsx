// FlockIQ — FAQ JSON-LD Schema for Gorakhpur
// File: apps/web/app/(marketing)/gorakhpur/FAQSchema.tsx
// Version: v1.0 | May 2026
// Task Reference: C-03
// Requirements: FR-GORAKHPUR-001

export default function FAQSchema() {
  const faqData = [
    {
      '@type': 'Question',
      name: 'गोरखपुर मंडी में आज मुर्गी का भाव क्या है?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'आज गोरखपुर मंडी में ब्रॉयलर का भाव ₹168/kg है। हमारा AI model भविष्यवाणी करता है कि अगले 7 दिनों में भाव ₹161–₹175/kg के बीच रहेगा।',
      },
    },
    {
      '@type': 'Question',
      name: 'FlockIQ गोरखपुर में कैसे काम करता है?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'हम 47 सार्वजनिक डेटा स्रोतों से भाव जानकारी इकट्ठा करते हैं — AGMARKNET, NECC, IMD weather, और feed prices। हमारा AI model 95%+ directional accuracy के साथ 7 दिन का भाव अनुमान लगाता है।',
      },
    },
    {
      '@type': 'Question',
      name: 'गोरखपुर के किसानों को क्या फायदा है?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'गोरखपुर के 200+ किसान FlockIQ का इस्तेमाल कर रहे हैं। औसतन, हर किसान साल में ₹1–2 लाख बचाता है सही समय पर बेचकर। 14 दिन मुफ़्त trial करें और खुद देखें।',
      },
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
