"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { JetBrains_Mono, Inter } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, FileText, Folder, Layers, Target, LoaderCircle } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import "./basecamp.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const basecampData = [
  { id: 1, name: "The Industry Battlefield" },
  { id: 2, name: "The Company Identity" },
  { id: 3, name: "The Strategy" },
  { id: 4, name: "The Strategy in Action" },
  { id: 5, name: "The Machine" },
  { id: 6, name: "The Future Foresight" },
]

const basecamp2Clusters = [
  {
    id: 1,
    name: "CEO DREAM",
    requestName: "cluster 1: ceo dream",
    summary: {
      name: "Cluster 1: CEO DREAM Summary",
      requestName: "cluster 1: ceo dream summary",
    },
    subclusters: [
      { id: "1.1", name: "Vision", requestName: "subcluster 1.1: vision" },
      { id: "1.2", name: "SUCCESS", requestName: "subcluster 1.2: success" },
      { id: "1.3", name: "Risks and Challenges", requestName: "subcluster 1.3: risks and challenges" },
      {
        id: "1.4",
        name: "Personal Leadership and Legacy",
        requestName: "subcluster 1.4: personal leadership and legacy",
      },
    ],
  },
  {
    id: 2,
    name: "Clear and Embraced Dream for the Future of the Company",
    requestName: "cluster 2: clear and embraced dream",
    summary: {
      name: "Cluster 2: Shared Dream Summary",
      requestName: "cluster 2: shared dream summary",
    },
    subclusters: [
      { id: "2.1", name: "Clear and Known", requestName: "subcluster 2.1: clear and known" },
      { id: "2.2", name: "Powerful", requestName: "subcluster 2.2: powerful" },
      {
        id: "2.3",
        name: "Participates in Day-to-Day Life of the Company (Alive)",
        requestName: "subcluster 2.3: alive",
      },
      { id: "2.4", name: "It is Believable", requestName: "subcluster 2.4: believable" },
    ],
  },
  {
    id: 3,
    name: "Well Defined and Alive Values and Behaviors",
    requestName: "cluster 3: well defined and alive values and behaviors",
    summary: {
      name: "Cluster 3: Values & Behaviors Summary",
      requestName: "cluster 3: values & behaviors summary",
    },
    subclusters: [
      {
        id: "3.1",
        name: "Clear Values and Behaviors are Articulated (Exist)",
        requestName: "subcluster 3.1: clear values and behaviors are articulated (exist)",
      },
      {
        id: "3.2",
        name: "Values are alive in the organization",
        requestName: "subcluster 3.2: values are alive in the organization",
      },
      {
        id: "3.3",
        name: "Values are Known to People/Partners Outside the Organization",
        requestName: "subcluster 3.3: values are known to people/partners outside the organization",
      },
      {
        id: "3.4",
        name: "Values are Visible in the Behavior of People",
        requestName: "subcluster 3.4: values are visible in the behavior of people",
      },
      { id: "3.5", name: "Inspiring", requestName: "subcluster 3.5: inspiring" },
    ],
  },
  {
    id: 4,
    name: "Clear Targets and Priorities Throughout the Organization",
    requestName: "cluster 4: clear targets and priorities",
    summary: {
      name: "Cluster 4: Clear Targets and Priorities Summary",
      requestName: "cluster 4: clear targets and priorities summary",
    },
    subclusters: [
      { id: "4.1", name: "CLEAR", requestName: "subcluster 4.1: clear" },
      { id: "4.2", name: "Aligned", requestName: "subcluster 4.2: aligned" },
      { id: "4.3", name: "Visible", requestName: "subcluster 4.3: visible" },
      { id: "4.4", name: "Believable", requestName: "subcluster 4.4: believable" },
      { id: "4.5", name: "Actionable", requestName: "subcluster 4.5: actionable" },
    ],
  },
  {
    id: 5,
    name: "Good Trust Within the Company",
    requestName: "cluster 5: good trust within the company",
    summary: {
      name: "Cluster 5: Good Trust Within the Company Summary",
      requestName: "cluster 5: good trust within the company summary",
    },
    subclusters: [
      { id: "5.1", name: "Credibility", requestName: "subcluster 5.1: credibility" },
      { id: "5.2", name: "Respect", requestName: "subcluster 5.2: respect" },
      { id: "5.3", name: "Fairness", requestName: "subcluster 5.3: fairness" },
      { id: "5.4", name: "Camaraderie", requestName: "subcluster 5.4: camaraderie" },
      { id: "5.5", name: "Pride", requestName: "subcluster 5.5: pride" },
    ],
  },
  {
    id: 6,
    name: "The Smell of the Place",
    requestName: "cluster 6: the smell of the place",
    summary: {
      name: "Cluster 6: The Smell of the Place Summary",
      requestName: "cluster 6: the smell of the place summary",
    },
    subclusters: [
      { id: "6.1", name: "Discipline", requestName: "subcluster 6.1: discipline" },
      { id: "6.2", name: "Trust", requestName: "subcluster 6.2: trust" },
      { id: "6.3", name: "STRETCH", requestName: "subcluster 6.3: stretch" },
    ],
  },
  {
    id: 7,
    name: "Alignment and Adaptability",
    requestName: "cluster 7: alignment and adaptability",
    summary: {
      name: "Cluster 7: Alignment & Adaptability Summary",
      requestName: "cluster 7: alignment & adaptability summary",
    },
    subclusters: [{ id: "7.1", name: "Identity in Action", requestName: "subcluster 7.1: identity in action" }],
  },
  {
    id: 8,
    name: "Employee Ownership and Empowerment",
    requestName: "cluster 8: employee ownership and empowerment",
    summary: {
      name: "Cluster 8: Employee Ownership & Empowerment Summary",
      requestName: "cluster 8: employee ownership & empowerment summary",
    },
    subclusters: [
      { id: "8.1", name: "Employee Ownership", requestName: "subcluster 8.1: employee ownership" },
      { id: "8.2", name: "Employee Empowerment", requestName: "subcluster 8.2: employee empowerment" },
    ],
  },
  {
    id: 9,
    name: "Identity Sentiment",
    requestName: "cluster 9: identity sentiment",
    summary: {
      name: "Cluster 9: Identity Sentiment Summary",
      requestName: "cluster 9: identity sentiment summary",
    },
    subclusters: [{ id: "9.1", name: "Identity Sentiment", requestName: "subcluster 9.1: identity sentiment" }],
  },
  {
    id: 10,
    name: "5 Dysfunctions of a Team",
    requestName: "cluster 10: 5 dysfunctions of a team",
    summary: null, // No summary provided for this cluster
    subclusters: [
      { id: "10.1", name: "Absence of Trust", requestName: "subcluster 10.1: absence of trust" },
      { id: "10.2", name: "Fear of Conflict", requestName: "subcluster 10.2: fear of conflict" },
      { id: "10.3", name: "Lack of Commitment", requestName: "subcluster 10.3: lack of commitment" },
      { id: "10.4", name: "Avoidance of Accountability", requestName: "subcluster 10.4: avoidance of accountability" },
      { id: "10.5", name: "Inattention to Results", requestName: "subcluster 10.5: inattention to results" },
    ],
  },
  {
    id: 11,
    name: "FIT",
    requestName: "cluster 11: fit",
    summary: {
      name: "Cluster 11: FIT Summary",
      requestName: "cluster 11: fit summary",
    },
    subclusters: [{ id: "11.1", name: "CEO", requestName: "subcluster 11.1: ceo" }],
  },
]

const basecamp3Clusters = [
  {
    id: 1,
    name: "Industry Dependency",
    requestName: "cluster 1: industry dependency",
    summary: {
      name: "Cluster 1: Industry Dependency Summary",
      requestName: "cluster 1: industry dependency summary",
    },
    subclusters: [
      { id: "1.1", name: "Dependence on Information", requestName: "subcluster 1.1: dependence on information" },
      { id: "1.2", name: "Dependence on Technology", requestName: "subcluster 1.2: dependence on technology" },
      { id: "1.3", name: "Dependence on Company Size", requestName: "subcluster 1.3: dependence on company size" },
      { id: "1.4", name: "Entry/Exit Barriers", requestName: "subcluster 1.4: entry/exit barriers" },
    ],
  },
  {
    id: 2,
    name: "Market Dynamics",
    requestName: "cluster 2: market dynamics",
    summary: {
      name: "Cluster 2: Market Dynamics Summary",
      requestName: "cluster 2: market dynamics summary",
    },
    subclusters: [
      {
        id: "2.1",
        name: "Competitiveness, Entry/Exit Dynamics",
        requestName: "subcluster 2.1: competitiveness, entry/exit dynamics",
      },
    ],
  },
  {
    id: 3,
    name: "Market Analysis",
    requestName: "cluster 3: market analysis",
    summary: {
      name: "Cluster 3: Market Analysis Summary",
      requestName: "cluster 3: market analysis summary",
    },
    subclusters: [
      { id: "3.1", name: "Market Size and Dynamics", requestName: "subcluster 3.1: market size and dynamics" },
      { id: "3.2", name: "Competitiveness", requestName: "subcluster 3.2: competitiveness" },
      { id: "3.3", name: "Buyer and Supplier Power", requestName: "subcluster 3.3: buyer and supplier power" },
    ],
  },
  {
    id: 4,
    name: "Market Risks and Opportunities",
    requestName: "cluster 4: market risks and opportunities",
    summary: {
      name: "Cluster 4: Market Risks and Opportunities Summary",
      requestName: "cluster 4: market risks and opportunities summary",
    },
    subclusters: [
      {
        id: "4.1",
        name: "Existing Market Opportunities",
        requestName: "subcluster 4.1: existing market opportunities",
      },
      { id: "4.2", name: "Main Market Risks", requestName: "subcluster 4.2: main market risks" },
      {
        id: "4.3",
        name: "Driving Forces and Core Competencies",
        requestName: "subcluster 4.3: driving forces and core competencies",
      },
    ],
  },
  {
    id: 5,
    name: "Current Market Position",
    requestName: "cluster 5: current market position",
    summary: {
      name: "Cluster 5: Current Market Position Summary",
      requestName: "cluster 5: current market position summary",
    },
    subclusters: [
      { id: "5.1", name: "Market Share", requestName: "subcluster 5.1: market share" },
      { id: "5.2", name: "Brand Power", requestName: "subcluster 5.2: brand power" },
      { id: "5.3", name: "Profit Pool Share", requestName: "subcluster 5.3: profit pool share" },
      { id: "5.4", name: "Sustainability of Position", requestName: "subcluster 5.4: sustainability of position" },
    ],
  },
  {
    id: 6,
    name: "Capability to Understand the Market",
    requestName: "cluster 6: capability to understand the market",
    summary: {
      name: "Cluster 6: Capability to Understand the Market Summary",
      requestName: "cluster 6: capability to understand the market summary",
    },
    subclusters: [
      { id: "6.1", name: "Data Availability", requestName: "subcluster 6.1: data availability" },
      { id: "6.2", name: "Resource Allocation", requestName: "subcluster 6.2: resource allocation" },
      { id: "6.3", name: "Use of Data Analyses", requestName: "subcluster 6.3: use of data analyses" },
    ],
  },
  {
    id: 7,
    name: "Strategic Clarity",
    requestName: "cluster 7: strategic clarity",
    summary: {
      name: "Cluster 7: Strategic Clarity Summary",
      requestName: "cluster 7: strategic clarity summary",
    },
    subclusters: [
      { id: "7.1", name: "Strategic Planning Process", requestName: "subcluster 7.1: strategic planning process" },
    ],
  },
  {
    id: 8,
    name: "Market and Industry Alignment",
    requestName: "cluster 8: market and industry alignment",
    summary: {
      name: "Cluster 8: Market and Industry Alignment Summary",
      requestName: "cluster 8: market and industry alignment summary",
    },
    subclusters: [
      {
        id: "8.1",
        name: "Understanding Market and Industry Dynamics",
        requestName: "subcluster 8.1: understanding market and industry dynamics",
      },
    ],
  },
  {
    id: 9,
    name: "Value Proposition",
    requestName: "cluster 9: value proposition",
    summary: {
      name: "Cluster 9: Value Proposition Summary",
      requestName: "cluster 9: value proposition summary",
    },
    subclusters: [
      {
        id: "9.1",
        name: "Definition and Differentiation",
        requestName: "subcluster 9.1: definition and differentiation",
      },
      {
        id: "9.2",
        name: "Alignment Across the Organization",
        requestName: "subcluster 9.2: alignment across the organization",
      },
    ],
  },
  {
    id: 10,
    name: "Customer Segmentation and Targeting",
    requestName: "cluster 10: customer segmentation and targeting",
    summary: {
      name: "Cluster 10: Customer Segmentation and Targeting Summary",
      requestName: "cluster 10: customer segmentation and targeting summary",
    },
    subclusters: [
      { id: "10.1", name: "Market Segmentation", requestName: "subcluster 10.1: market segmentation" },
      { id: "10.2", name: "Target Customer Insights", requestName: "subcluster 10.2: target customer insights" },
    ],
  },
  {
    id: 11,
    name: "Performance Measurement",
    requestName: "cluster 11: performance measurement",
    summary: {
      name: "Cluster 11: Performance Measurement Summary",
      requestName: "cluster 11: performance measurement summary",
    },
    subclusters: [
      { id: "11.1", name: "KPIs and Monitoring", requestName: "subcluster 11.1: kpis and monitoring" },
      { id: "11.2", name: "Feedback Integration", requestName: "subcluster 11.2: feedback integration" },
    ],
  },
  {
    id: 12,
    name: "Alignment and Execution",
    requestName: "cluster 12: alignment and execution",
    summary: {
      name: "Cluster 12: Alignment and Execution Summary",
      requestName: "cluster 12: alignment and execution summary",
    },
    subclusters: [
      { id: "12.1", name: "Leadership Accountability", requestName: "subcluster 12.1: leadership accountability" },
      { id: "12.2", name: "Strategic Alignment", requestName: "subcluster 12.2: strategic alignment" },
    ],
  },
  {
    id: 13,
    name: "Innovation and Agility",
    requestName: "cluster 13: innovation and agility",
    summary: {
      name: "Cluster 13: Innovation and Agility Summary",
      requestName: "cluster 13: innovation and agility summary",
    },
    subclusters: [
      { id: "13.1", name: "Encouraging Innovation", requestName: "subcluster 13.1: encouraging innovation" },
      { id: "13.2", name: "Strategic Agility", requestName: "subcluster 13.2: strategic agility" },
    ],
  },
  {
    id: 14,
    name: "Sentiment and Open Feedback",
    requestName: "cluster 14: sentiment and open feedback",
    summary: {
      name: "Cluster 14: Sentiment and Open Feedback Summary",
      requestName: "cluster 14: sentiment and open feedback summary",
    },
    subclusters: [{ id: "14.1", name: "Strategic Sentiment", requestName: "subcluster 14.1: strategic sentiment" }],
  },
]

const basecamp4Clusters = [
  {
    id: 1,
    name: "Product and service portfolio alignment",
    requestName: "cluster 1: product and service portfolio alignment",
    summary: {
      name: "Cluster 1: Product and Service Portfolio Alignment Summary",
      requestName: "cluster 1: product and service portfolio alignment summary",
    },
    subclusters: [
      { id: "1.1", name: "Portfolio review", requestName: "subcluster 1.1: portfolio review" },
      {
        id: "1.2",
        name: "Product development and innovation",
        requestName: "subcluster 1.2: product development and innovation",
      },
    ],
  },
  {
    id: 2,
    name: "Route-to-market (rtm) strategy",
    requestName: "cluster 2: route-to-market (rtm) strategy",
    summary: {
      name: "Cluster 2: Route-to-Market Strategy Summary",
      requestName: "cluster 2: route-to-market strategy summary",
    },
    subclusters: [
      { id: "2.1", name: "Channel optimization", requestName: "subcluster 2.1: channel optimization" },
      {
        id: "2.2",
        name: "Channel performance metrics",
        requestName: "subcluster 2.2: channel performance metrics",
      },
    ],
  },
  {
    id: 3,
    name: "Pricing strategy",
    requestName: "cluster 3: pricing strategy",
    summary: {
      name: "Cluster 3: Pricing Strategy Summary",
      requestName: "cluster 3: pricing strategy summary",
    },
    subclusters: [
      { id: "3.1", name: "Pricing policies", requestName: "subcluster 3.1: pricing policies" },
      { id: "3.2", name: "Dynamic pricing", requestName: "subcluster 3.2: dynamic pricing" },
    ],
  },
  {
    id: 4,
    name: "Brand and marketing strategy",
    requestName: "cluster 4: brand and marketing strategy",
    summary: {
      name: "Cluster 4: Brand and Marketing Strategy Summary",
      requestName: "cluster 4: brand and marketing strategy summary",
    },
    subclusters: [
      { id: "4.1", name: "Campaign alignment", requestName: "subcluster 4.1: campaign alignment" },
      { id: "4.2", name: "Customer targeting", requestName: "subcluster 4.2: customer targeting" },
    ],
  },
  {
    id: 5,
    name: "Customer service strategy",
    requestName: "cluster 5: customer service strategy",
    summary: {
      name: "Cluster 5: Customer Service Strategy Summary",
      requestName: "cluster 5: customer service strategy summary",
    },
    subclusters: [
      { id: "5.1", name: "Service integration", requestName: "subcluster 5.1: service integration" },
      { id: "5.2", name: "Service innovation", requestName: "subcluster 5.2: service innovation" },
    ],
  },
  {
    id: 6,
    name: "Use of technology and data",
    requestName: "cluster 6: use of technology and data",
    summary: {
      name: "Cluster 6: Use of Technology and Data Summary",
      requestName: "cluster 6: use of technology and data summary",
    },
    subclusters: [
      { id: "6.1", name: "Technology integration", requestName: "subcluster 6.1: technology integration" },
      { id: "6.2", name: "Data utilization", requestName: "subcluster 6.2: data utilization" },
    ],
  },
  {
    id: 7,
    name: "Performance metrics and kpis",
    requestName: "cluster 7: performance metrics and kpis",
    summary: {
      name: "Cluster 7: Performance Metrics and KPIs Summary",
      requestName: "cluster 7: performance metrics and kpis summary",
    },
    subclusters: [
      { id: "7.1", name: "Metrics alignment", requestName: "subcluster 7.1: metrics alignment" },
      { id: "7.2", name: "Metrics effectiveness", requestName: "subcluster 7.2: metrics effectiveness" },
    ],
  },
  {
    id: 8,
    name: "Inter-company integration",
    requestName: "cluster 8: inter-company integration",
    summary: {
      name: "Cluster 8: Inter-Company Integration Summary",
      requestName: "cluster 8: inter-company integration summary",
    },
    subclusters: [
      {
        id: "8.1",
        name: "Integration tools and processes",
        requestName: "subcluster 8.1: integration tools and processes",
      },
    ],
  },
]

const basecamp6Clusters = [
  {
    id: 1,
    name: "Innovation & Creativity",
    requestName: "cluster 1: innovation & creativity",
    summary: {
      name: "Cluster 1: Innovation & Creativity Summary",
      requestName: "cluster 1: innovation & creativity summary",
    },
    subclusters: [
      { id: "1.1", name: "Encouraging Innovation", requestName: "subcluster 1.1: encouraging innovation" },
      { id: "1.2", name: "Investing in R&D", requestName: "subcluster 1.2: investing in r&d" },
    ],
  },
  {
    id: 2,
    name: "Agility & Adaptability",
    requestName: "cluster 2: agility & adaptability",
    summary: {
      name: "Cluster 2: Agility & Adaptability Summary",
      requestName: "cluster 2: agility & adaptability summary",
    },
    subclusters: [
      { id: "2.1", name: "Speed of Decision-Making", requestName: "subcluster 2.1: speed of decision-making" },
      { id: "2.2", name: "Change Readiness", requestName: "subcluster 2.2: change readiness" },
    ],
  },
  {
    id: 3,
    name: "Technology Adoption",
    requestName: "cluster 3: technology adoption",
    summary: {
      name: "Cluster 3: Technology Adoption Summary",
      requestName: "cluster 3: technology adoption summary",
    },
    subclusters: [
      { id: "3.1", name: "Digital Transformation", requestName: "subcluster 3.1: digital transformation" },
      {
        id: "3.2",
        name: "Leveraging Data, AI & AI Agents",
        requestName: "subcluster 3.2: leveraging data, ai & ai agents",
      },
    ],
  },
  {
    id: 4,
    name: "Strategic Foresight",
    requestName: "cluster 4: strategic foresight",
    summary: {
      name: "Cluster 4: Strategic Foresight Summary",
      requestName: "cluster 4: strategic foresight summary",
    },
    subclusters: [
      { id: "4.1", name: "Scenario Planning", requestName: "subcluster 4.1: scenario planning" },
      { id: "4.2", name: "Ecosystem Awareness", requestName: "subcluster 4.2: ecosystem awareness" },
    ],
  },
  {
    id: 5,
    name: "Workforce Evolution",
    requestName: "cluster 5: workforce evolution",
    summary: {
      name: "Cluster 5: Workforce Evolution Summary",
      requestName: "cluster 5: workforce evolution summary",
    },
    subclusters: [
      { id: "5.1", name: "Upskilling & Reskilling", requestName: "subcluster 5.1: upskilling & reskilling" },
      { id: "5.2", name: "Talent Acquisition", requestName: "subcluster 5.2: talent acquisition" },
    ],
  },
  {
    id: 6,
    name: "Cultural Resilience",
    requestName: "cluster 6: cultural resilience",
    summary: {
      name: "Cluster 6: Cultural Resilience Summary",
      requestName: "cluster 6: cultural resilience summary",
    },
    subclusters: [
      { id: "6.1", name: "Encouraging Experimentation", requestName: "subcluster 6.1: encouraging experimentation" },
      { id: "6.2", name: "Open-Mindedness", requestName: "subcluster 6.2: open-mindedness" },
    ],
  },
  {
    id: 7,
    name: "Integration with External Trends",
    requestName: "cluster 7: integration with external trends",
    summary: {
      name: "Cluster 7: Integration with External Trends Summary",
      requestName: "cluster 7: integration with external trends summary",
    },
    subclusters: [
      {
        id: "7.1",
        name: "Market Awareness & Collaboration",
        requestName: "subcluster 7.1: market awareness & collaboration",
      },
      { id: "7.2", name: "Collaborative Ecosystem", requestName: "subcluster 7.2: collaborative ecosystem" },
    ],
  },
]

const dummyClusters = [
  {
    id: 1,
    name: "Cluster Alpha",
    summary: "Placeholder summary.",
    subclusters: [{ id: "A.1", name: "Subcluster A1" }],
  },
]

// Function to parse briefing content into structured sections
const parseBriefContent = (content: string) => {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Extract score information
  const scoreMatch = content.match(/\b(Critical|Danger|Healthy)\b/gi);
  let detectedScore = null;
  if (scoreMatch) {
    detectedScore = scoreMatch[0].toLowerCase();
  }

  // Define the 7 sections we're looking for
  const sectionPatterns = [
    { key: 'humanProblem', title: 'The Human Problem', pattern: /(?:1\.\s*)?(?:The\s+)?Human\s+Problem:?\s*(.+?)(?=(?:\d+\.\s*(?:The\s+)?(?:Core\s+Idea|Desired\s+Feeling|Unified\s+Visual|Narrative\s+Arc|Revealing\s+the\s+Truth|Intensity\s+Level))|$)/is },
    { key: 'coreIdea', title: 'The Core Idea', pattern: /(?:2\.\s*)?(?:The\s+)?Core\s+Idea:?\s*(.+?)(?=(?:\d+\.\s*(?:The\s+)?(?:Desired\s+Feeling|Unified\s+Visual|Narrative\s+Arc|Revealing\s+the\s+Truth|Intensity\s+Level))|$)/is },
    { key: 'desiredFeeling', title: 'The Desired Feeling', pattern: /(?:3\.\s*)?(?:The\s+)?Desired\s+Feeling:?\s*(.+?)(?=(?:\d+\.\s*(?:The\s+)?(?:Unified\s+Visual|Narrative\s+Arc|Revealing\s+the\s+Truth|Intensity\s+Level))|$)/is },
    { key: 'unifiedVisual', title: 'The Unified Visual System', pattern: /(?:4\.\s*)?(?:The\s+)?Unified\s+Visual\s+System:?\s*(.+?)(?=(?:\d+\.\s*(?:The\s+)?(?:Narrative\s+Arc|Revealing\s+the\s+Truth|Intensity\s+Level))|$)/is },
    { key: 'narrativeArc', title: 'The Narrative Arc', pattern: /(?:5\.\s*)?(?:The\s+)?Narrative\s+Arc:?\s*(.+?)(?=(?:\d+\.\s*(?:The\s+)?(?:Revealing\s+the\s+Truth|Intensity\s+Level))|$)/is },
    { key: 'revealingTruth', title: 'Revealing the Truth (Data & Visualization)', pattern: /(?:6\.\s*)?(?:Revealing\s+the\s+Truth|Data\s*&?\s*Visualization):?\s*(.+?)(?=(?:\d+\.\s*(?:The\s+)?Intensity\s+Level)|$)/is },
    { key: 'intensityLevel', title: 'Intensity Level (1-10)', pattern: /(?:7\.\s*)?Intensity\s+Level\s*\(1-10\):?\s*(.+?)$/is }
  ];

  const sections = {};
  let hasValidSections = false;

  sectionPatterns.forEach(({ key, title, pattern }) => {
    const match = content.match(pattern);
    if (match && match[1]) {
      let sectionContent = match[1].trim();
      
      // Enhanced score highlighting with subsections - handle various patterns
      // Pattern 1: "Critical):" or "Danger):" or "Healthy):" (with parenthesis)
      sectionContent = sectionContent.replace(/\b(Critical)\):\s*/g, '<div class="score-subsection score-critical-section"><span class="score-label-critical">🔴 CRITICAL:</span> ');
      sectionContent = sectionContent.replace(/\b(Danger)\):\s*/g, '<div class="score-subsection score-danger-section"><span class="score-label-danger">🟠 DANGER:</span> ');
      sectionContent = sectionContent.replace(/\b(Healthy)\):\s*/g, '<div class="score-subsection score-healthy-section"><span class="score-label-healthy">🟢 HEALTHY:</span> ');
      
      // Pattern 2: "Critical:" or "Danger:" or "Healthy:" (without parenthesis)
      sectionContent = sectionContent.replace(/\b(Critical):\s*/g, '<div class="score-subsection score-critical-section"><span class="score-label-critical">🔴 CRITICAL:</span> ');
      sectionContent = sectionContent.replace(/\b(Danger):\s*/g, '<div class="score-subsection score-danger-section"><span class="score-label-danger">🟠 DANGER:</span> ');
      sectionContent = sectionContent.replace(/\b(Healthy):\s*/g, '<div class="score-subsection score-healthy-section"><span class="score-label-healthy">🟢 HEALTHY:</span> ');
      
      // Close score subsection divs before next score or at specific patterns
      sectionContent = sectionContent.replace(/(<div class="score-subsection[^>]*>.*?)(?=<div class="score-subsection|$)/gs, '$1</div>');
      
      // Handle standalone score mentions that aren't part of subsections
      sectionContent = sectionContent.replace(/\b(Critical)(?![:\)])/g, '<span class="score-critical">$1</span>');
      sectionContent = sectionContent.replace(/\b(Danger)(?![:\)])/g, '<span class="score-danger">$1</span>');
      sectionContent = sectionContent.replace(/\b(Healthy)(?![:\)])/g, '<span class="score-healthy">$1</span>');
      
      sections[key] = {
        title,
        content: sectionContent
      };
      hasValidSections = true;
    }
  });

  // If no structured sections found, return the raw content with score highlighting
  if (!hasValidSections) {
    let highlightedContent = content;
    // Enhanced score highlighting with subsections for raw content - handle various patterns
    // Pattern 1: "Critical):" or "Danger):" or "Healthy):" (with parenthesis)
    highlightedContent = highlightedContent.replace(/\b(Critical)\):\s*/g, '<div class="score-subsection score-critical-section"><span class="score-label-critical">🔴 CRITICAL:</span> ');
    highlightedContent = highlightedContent.replace(/\b(Danger)\):\s*/g, '<div class="score-subsection score-danger-section"><span class="score-label-danger">🟠 DANGER:</span> ');
    highlightedContent = highlightedContent.replace(/\b(Healthy)\):\s*/g, '<div class="score-subsection score-healthy-section"><span class="score-label-healthy">🟢 HEALTHY:</span> ');
    
    // Pattern 2: "Critical:" or "Danger:" or "Healthy:" (without parenthesis)
    highlightedContent = highlightedContent.replace(/\b(Critical):\s*/g, '<div class="score-subsection score-critical-section"><span class="score-label-critical">🔴 CRITICAL:</span> ');
    highlightedContent = highlightedContent.replace(/\b(Danger):\s*/g, '<div class="score-subsection score-danger-section"><span class="score-label-danger">🟠 DANGER:</span> ');
    highlightedContent = highlightedContent.replace(/\b(Healthy):\s*/g, '<div class="score-subsection score-healthy-section"><span class="score-label-healthy">🟢 HEALTHY:</span> ');
    
    // Close score subsection divs before next score or at end
    highlightedContent = highlightedContent.replace(/(<div class="score-subsection[^>]*>.*?)(?=<div class="score-subsection|$)/g, '$1</div>');
    
    // Handle standalone score mentions that aren't part of subsections
    highlightedContent = highlightedContent.replace(/\b(Critical)(?![:\)])/g, '<span class="score-critical">$1</span>');
    highlightedContent = highlightedContent.replace(/\b(Danger)(?![:\)])/g, '<span class="score-danger">$1</span>');
    highlightedContent = highlightedContent.replace(/\b(Healthy)(?![:\)])/g, '<span class="score-healthy">$1</span>');
    
    return { rawContent: highlightedContent, score: detectedScore };
  }

  return { sections, score: detectedScore };
};



export default function BasecampPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [selectedBrief, setSelectedBrief] = useState({
    type: "overall",
    displayName: "Overall Basecamp Brief",
    requestName: "overall basecamp brief",
  })
  const [briefContent, setBriefContent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)


  const basecamp = basecampData.find((b) => b.id.toString() === id)

  let clusters = dummyClusters
  let isLiveBasecamp = false
  if (id === "2") {
    clusters = basecamp2Clusters
    isLiveBasecamp = true
  } else if (id === "3") {
    clusters = basecamp3Clusters
    isLiveBasecamp = true
  } else if (id === "4") {
    clusters = basecamp4Clusters
    isLiveBasecamp = true
  } else if (id === "6") {
    clusters = basecamp6Clusters
    isLiveBasecamp = true
  }

  const fetchBrief = async (brief) => {
    console.log(`[BRIEF REQUEST] Initiated for: ${brief.displayName}`)

    if (!isLiveBasecamp) {
      setSelectedBrief(brief)
      setBriefContent(`// Briefing for '${brief.displayName}' is not available for this basecamp.`)
      return
    }

    setSelectedBrief(brief)
    setIsLoading(true)
    setBriefContent(null)
    setError(null)

    const baseUrl = "https://n8n-reports.fasttrack-diagnostic.com/webhook/5777c5d8-9bab-4929-90e6-aca6dc5adfe2"
    const queryParams = new URLSearchParams({
      basecamp_id: id,
      basecamp_name: basecamp.name,
      brief_name: brief.requestName,
    })

    try {
      const fullUrl = `${baseUrl}?${queryParams.toString()}`
      console.log(`[BRIEF REQUEST] Sending GET request to: ${fullUrl}`)
      const response = await fetch(fullUrl)
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`)
      }
              const data = await response.text()
        setBriefContent(data)
    } catch (e) {
      console.error(`[BRIEF REQUEST FAILED] Could not fetch '${brief.displayName}'. Error:`, e)
      setError(e.message)
    } finally {
      console.log(`[BRIEF REQUEST] Finished attempt for: ${brief.displayName}`)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initialBrief = {
      type: "overall",
      displayName: "Overall Basecamp Brief",
      requestName: "overall basecamp brief",
    }
    if (isLiveBasecamp) {
      fetchBrief(initialBrief)
    } else {
      setSelectedBrief(initialBrief)
      setBriefContent(`// Select an intelligence asset to view details.`)
    }
  }, [id])

  if (!basecamp) {
    return (
      <div className="basecamp-page-body flex items-center justify-center">
        <h1 className="text-2xl text-red-500">ERROR: Basecamp data not found.</h1>
      </div>
    )
  }

  return (
    <main className={`${inter.className} basecamp-page-body`}>
      <header className="basecamp-header">
        <Button variant="outline" className="nav-button bg-transparent" onClick={() => router.push("/battlefield-map")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Tactical Map
        </Button>
        <div className="header-title-container">
          <h1 className={`${jetbrainsMono.className} basecamp-title`}>
            <span className="basecamp-id">BASECAMP 0{basecamp.id}</span>
            {basecamp.name}
          </h1>
        </div>
        <div className={`${jetbrainsMono.className} timestamp`}>DATASTREAM: LIVE</div>
      </header>

      <div className="basecamp-container-grid">
        <motion.div
          className="navigation-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={`${jetbrainsMono.className} panel-title`}>INTELLIGENCE ASSETS</h2>
          <Button
            className={cn("overall-brief-button", selectedBrief.type === "overall" && "active")}
            onClick={() =>
              fetchBrief({
                type: "overall",
                displayName: "Overall Basecamp Brief",
                requestName: "overall basecamp brief",
              })
            }
          >
            <Layers className="mr-2 h-4 w-4" />
            Overall Basecamp Brief
          </Button>

          <Accordion type="single" collapsible className="w-full">
            {clusters.map((cluster) => (
              <AccordionItem key={cluster.id} value={`item-${cluster.id}`} className="cluster-item">
                <AccordionTrigger
                  className={cn(
                    "cluster-trigger",
                    selectedBrief.type === "cluster" && selectedBrief.displayName.includes(cluster.name) && "active",
                  )}
                  onClick={() =>
                    fetchBrief({
                      type: "cluster",
                      displayName: `Cluster ${cluster.id}: ${cluster.name}`,
                      requestName: cluster.requestName,
                    })
                  }
                >
                  <div className="flex items-center text-left">
                    <Folder className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{`Cluster ${cluster.id}: ${cluster.name}`}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="subcluster-list">
                    {cluster.subclusters.map((subcluster) => (
                      <li
                        key={subcluster.id}
                        className={cn(
                          "subcluster-item",
                          selectedBrief.type === "subcluster" &&
                            selectedBrief.displayName.includes(subcluster.name) &&
                            "active",
                        )}
                        onClick={() =>
                          fetchBrief({
                            type: "subcluster",
                            displayName: `Subcluster ${subcluster.id}: ${subcluster.name}`,
                            requestName: subcluster.requestName,
                          })
                        }
                      >
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{`Subcluster ${subcluster.id}: ${subcluster.name}`}</span>
                      </li>
                    ))}
                    {cluster.summary && (
                      <li
                        className={cn(
                          "subcluster-item",
                          "summary-item",
                          selectedBrief.type === "cluster_summary" &&
                            selectedBrief.displayName.includes(cluster.name) &&
                            "active",
                        )}
                        onClick={() =>
                          fetchBrief({
                            type: "cluster_summary",
                            displayName: cluster.summary.name,
                            requestName: cluster.summary.requestName,
                          })
                        }
                      >
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{cluster.summary.name}</span>
                      </li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          className="briefing-display-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="briefing-header">
            <Target className="w-6 h-6 text-red-500" />
            <h2 className={`${jetbrainsMono.className} panel-title`}>CURRENT BRIEFING</h2>
          </div>
          <div className="briefing-content">
            <motion.div
              key={selectedBrief.displayName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="briefing-selection-text">
                <span className="text-amber-400">SELECTED ASSET:</span> {selectedBrief.displayName}
              </p>
              <div className="placeholder-text">
                {isLoading && (
                  <div className="loading-state">
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                    <p>ACCESSING DATASTREAM...</p>
                    <div className="terminal-loading">
                      <span className="terminal-prompt">root@basecamp:~$</span>
                      <span className="loading-dots">retrieving_classified_intel</span>
                    </div>
                  </div>
                )}
                {error && <p className="error-text">ERROR: Failed to retrieve brief. {error}</p>}
                {briefContent && (() => {
                  const parsedBrief = parseBriefContent(briefContent);
                  
                  if (parsedBrief?.rawContent) {
                    return (
                      <div className={`brief-display ${parsedBrief.score ? `score-${parsedBrief.score}` : ''}`}>
                        {parsedBrief.score && (
                          <div className={`score-badge score-${parsedBrief.score}`}>
                            <span className="score-label">THREAT LEVEL:</span>
                            <span className="score-value">{parsedBrief.score.toUpperCase()}</span>
                          </div>
                        )}
                        <pre className="brief-text" dangerouslySetInnerHTML={{ __html: parsedBrief.rawContent }}></pre>
                      </div>
                    );
                  }
                  
                  if (parsedBrief?.sections && Object.keys(parsedBrief.sections).length > 0) {
                    return (
                      <div className={`brief-display ${parsedBrief.score ? `score-${parsedBrief.score}` : ''}`}>
                        {parsedBrief.score && (
                          <div className={`score-badge score-${parsedBrief.score}`}>
                            <span className="score-label">THREAT LEVEL:</span>
                            <span className="score-value">{parsedBrief.score.toUpperCase()}</span>
                          </div>
                        )}
                        <div className="structured-brief">
                          {Object.entries(parsedBrief.sections).map(([key, section]) => (
                            <div key={key} className="brief-section" data-section={key}>
                              <div className={`${jetbrainsMono.className} section-header`}>
                                <div className="section-indicator">●</div>
                                <h3 className="section-title">{section.title}</h3>
                              </div>
                              <div className="section-content" dangerouslySetInnerHTML={{ __html: section.content }}>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return <pre className="brief-text">{briefContent}</pre>;
                })()}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
