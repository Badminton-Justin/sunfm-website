import type { ServiceArea } from "@/lib/service-areas";

export default function ServiceAreaSchema({ area }: { area: ServiceArea }) {
  const baseUrl = "https://www.sunfm.fitness";
  const pageUrl = `${baseUrl}${area.urlPath}`;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${pageUrl}#business`,
    name: `SunFM — Personal Trainer in ${area.city}`,
    description: area.metaDescription,
    url: pageUrl,
    image: `${baseUrl}/images/jeffrey-headshot-final.jpg`,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1401 Parkmoor Ave, Suite 100",
      addressLocality: "San Jose",
      addressRegion: "CA",
      postalCode: "95126",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.3115,
      longitude: -121.9192,
    },
    telephone: "+1-408-761-4963",
    areaServed: {
      "@type": "City",
      name: area.city,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "San Francisco Bay Area",
      },
    },
    sameAs: [
      "https://www.instagram.com/jeffsunfitness/",
      "https://www.yelp.com/biz/sun-functional-movement-san-jose",
      "https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5",
    ],
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: `Personal Training in ${area.city}`,
    serviceType: "Personal Training",
    description: `One-on-one personal training for ${area.city} residents. ACE-certified trainer focused on functional strength, mobility, and longevity.`,
    provider: {
      "@id": `${pageUrl}#business`,
    },
    areaServed: {
      "@type": "City",
      name: area.city,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/#apply`,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Training formats",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "1:1 private training",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Semi-private (2-person) training",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Small group training",
          },
        },
      ],
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${area.city} Personal Trainer`,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: area.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
