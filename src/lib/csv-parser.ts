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
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data: InfluencerData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Only include non-empty values for optional fields
      if (['Creator City', 'Gender', 'Language', 'Creator Country', 'Email', 'Phone', 'Other Links'].includes(header)) {
        if (value && value !== 'null' && value !== '') {
          row[header] = value;
        }
      } else {
        row[header] = value;
      }
    });

    data.push(row as InfluencerData);
  }

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