// File: src/lib/seoMetadata.ts
// SEO Metadata configuration for all pages

export const seoMetadata = {
  home: {
    title: "NITMiner Technologies - Blockchain Development, Smart Contract Audit & AI Solutions",
    description: "Expert blockchain development, smart contract testing, AI/ML solutions, mobile app development, and full-stack services. NITW incubated startup providing enterprise-grade Web3 solutions.",
    keywords: ["blockchain development", "smart contract audit", "solidity", "ethereum", "DeFi", "NFT", "Web3", "AI/ML", "full stack"],
    url: "https://nitminer.com",
  },
  services: {
    title: "Services - Blockchain Development, Smart Contract Audit & AI Solutions | NITMiner",
    description: "Explore NITMiner's comprehensive services: blockchain development, smart contract auditing, AI/ML solutions, mobile app development, full-stack services, and Web3 consulting for enterprises.",
    keywords: ["blockchain services", "smart contract audit", "Web3 consulting", "DeFi development", "AI/ML services", "full stack development"],
    url: "https://nitminer.com/services",
  },
  about: {
    title: "About Us - NITMiner Technologies | Blockchain & AI Innovation",
    description: "Learn about NITMiner Technologies, a NITW-incubated startup at the forefront of blockchain and AI innovation. Founded in 2022, we deliver cutting-edge Web3 solutions.",
    keywords: ["about NITMiner", "blockchain company", "AI innovation", "NITW incubated", "Web3 solutions"],
    url: "https://nitminer.com/about-us",
  },
  team: {
    title: "Team - Meet the NITMiner Technologies Experts",
    description: "Meet our team of blockchain developers, AI researchers, and full-stack engineers dedicated to building innovative Web3 solutions.",
    keywords: ["team", "engineers", "developers", "blockchain experts", "AI researchers"],
    url: "https://nitminer.com/team",
  },
  pricing: {
    title: "Pricing Plans - Affordable Blockchain & AI Development Services",
    description: "Transparent pricing for blockchain development, smart contract audit, and AI/ML services. Flexible plans starting at ₹24,999/month.",
    keywords: ["pricing", "plans", "blockchain pricing", "development cost", "service pricing"],
    url: "https://nitminer.com/pricing",
  },
  contact: {
    title: "Contact Us - NITMiner Technologies",
    description: "Get in touch with NITMiner Technologies for blockchain development, smart contract audit, or any Web3 inquiry. Based in Warangal, India.",
    keywords: ["contact", "support", "blockchain inquiry", "development quote", "consultation"],
    url: "https://nitminer.com/contact",
  },
  gallery: {
    title: "Gallery - NITMiner Technologies Projects & Innovation",
    description: "Explore our portfolio of completed blockchain projects, Web3 solutions, and AI implementations.",
    keywords: ["gallery", "projects", "portfolio", "case studies", "blockchain projects"],
    url: "https://nitminer.com/gallery",
  },
  careers: {
    title: "Careers - Join NITMiner Technologies Team",
    description: "Build your career with NITMiner Technologies. We're hiring blockchain developers, AI engineers, and full-stack developers.",
    keywords: ["careers", "jobs", "hiring", "blockchain jobs", "developer jobs"],
    url: "https://nitminer.com/careers",
  },
  trustinn: {
    title: "TrustInn Integration - Blockchain Tools by NITMiner",
    description: "Access TrustInn, our comprehensive blockchain analysis and testing platform integrated with NITMiner services.",
    keywords: ["TrustInn", "blockchain tools", "analysis", "testing platform"],
    url: "https://nitminer.com/trustinn",
  },
  publications: {
    title: "Publications & Research - NITMiner Technologies",
    description: "Explore our published research papers, whitepapers, and technical documentation on blockchain and AI.",
    keywords: ["publications", "research", "papers", "blockchain research", "AI research"],
    url: "https://nitminer.com/publications",
  },
  downloads: {
    title: "Downloads - Whitepapers & Resources | NITMiner",
    description: "Download whitepapers, guides, and resources about blockchain development, smart contracts, and Web3 solutions.",
    keywords: ["downloads", "whitepapers", "guides", "resources", "documentation"],
    url: "https://nitminer.com/downloads",
  },
  awards: {
    title: "Awards & Recognition - NITMiner Technologies",
    description: "Discover NITMiner's awards, recognitions, and industry accolades for innovation in blockchain and AI.",
    keywords: ["awards", "recognition", "achievements", "industry awards"],
    url: "https://nitminer.com/awards",
  },
};

export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NITMiner Technologies",
    "description": "Expert blockchain development, smart contract audit, AI/ML solutions, and Web3 services",
    "url": "https://nitminer.com",
    "logo": "https://nitminer.com/images/Logo/logo.png",
    "foundingDate": "2022",
    "foundingLocation": "Warangal, India",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7013306805",
      "contactType": "Customer Service",
      "email": "sanghu@nitw.ac.in",
    },
    "sameAs": [
      "https://www.linkedin.com/company/nitminer-technologies-private-limited/",
      "https://twitter.com/nitminer",
      "https://github.com/nitminer",
    ],
  },
  services: [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Blockchain Development",
      "description": "Custom blockchain solutions and smart contract development",
      "provider": {
        "@type": "Organization",
        "name": "NITMiner Technologies",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Smart Contract Audit",
      "description": "Security auditing and vulnerability assessment for smart contracts",
      "provider": {
        "@type": "Organization",
        "name": "NITMiner Technologies",
      },
    },
  ],
};
