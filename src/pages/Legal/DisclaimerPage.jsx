import LegalPage from './LegalPage.jsx'

const sections = [
  {
    heading: 'General Information',
    paragraphs: ['The information provided on this website is for general informational purposes only. While we strive for accuracy, FOMO Travel makes no guarantees about the completeness or reliability of any content.'],
  },
  {
    heading: 'Wildlife & Safari Risks',
    paragraphs: ['Safari activities involve inherent risks associated with wildlife, terrain, and weather conditions. Travelers participate at their own risk and are encouraged to follow all guide instructions.'],
  },
  {
    heading: 'External Links',
    paragraphs: ['Our website may contain links to third-party websites. FOMO Travel is not responsible for the content, accuracy, or practices of these external sites.'],
  },
  {
    heading: 'No Professional Advice',
    paragraphs: ['Content on this site does not constitute travel, medical, or legal advice. Please consult relevant professionals for guidance specific to your situation.'],
  },
]

export default function DisclaimerPage() {
  return <LegalPage title="Disclaimer" updated="August 16, 2026" sections={sections} />
}