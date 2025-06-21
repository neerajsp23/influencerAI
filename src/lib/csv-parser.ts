import Papa from 'papaparse';

export interface InfluencerData {
  Username: string;
  'Full Name': string;
  Introduction: string;
  Verified: string;
  'Follower Count': string;
  'Creator City'?: string;
  'Engagement Rate': string;
  'Average Likes': string;
  Gender?: string;
  Language?: string;
  'Creator Country'?: string;
  Email?: string;
  Phone?: string;
  'Other Links'?: string;
  'Profile Url': string;
  'Image url': string;
}

export function parseCSV(csvText: string): InfluencerData[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim()
  });

  if (results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }

  const data: InfluencerData[] = results.data.map((row: any) => {
    const cleanedRow: any = {};
    
    // Process each field
    Object.keys(row).forEach(key => {
      const value = row[key] || '';
      
      // Only include non-empty values for optional fields
      if (['Creator City', 'Gender', 'Language', 'Creator Country', 'Email', 'Phone', 'Other Links'].includes(key)) {
        if (value && value !== 'null' && value !== '' && value.trim() !== '') {
          cleanedRow[key] = value.trim();
        }
      } else {
        cleanedRow[key] = value.trim();
      }
    });

    return cleanedRow as InfluencerData;
  });

  return data;
}

export function dataToString(data: InfluencerData[]): string {
  return data.map(influencer => {
    const fields = [
      `Username: ${influencer.Username}`,
      `Full Name: ${influencer['Full Name']}`,
      `Introduction: ${influencer.Introduction}`,
      `Verified: ${influencer.Verified}`,
      `Follower Count: ${influencer['Follower Count']}`,
      `Engagement Rate: ${influencer['Engagement Rate']}`,
      `Average Likes: ${influencer['Average Likes']}`,
      `Profile URL: ${influencer['Profile Url']}`,
      ...(influencer['Creator City'] ? [`City: ${influencer['Creator City']}`] : []),
      ...(influencer.Gender ? [`Gender: ${influencer.Gender}`] : []),
      ...(influencer.Language ? [`Language: ${influencer.Language}`] : []),
      ...(influencer['Creator Country'] ? [`Country: ${influencer['Creator Country']}`] : []),
      ...(influencer.Email ? [`Email: ${influencer.Email}`] : []),
      ...(influencer.Phone ? [`Phone: ${influencer.Phone}`] : []),
      ...(influencer['Other Links'] ? [`Other Links: ${influencer['Other Links']}`] : [])
    ];
    return fields.join(', ');
  }).join('\n');
} 