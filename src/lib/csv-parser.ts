export interface InfluencerData {
  Name: string;
  Followers: string;
  'Engagement Rate': string;
  Category: string;
  'Creator City'?: string;
  Gender?: string;
  Language?: string;
  'Creator Country'?: string;
  Email?: string;
  Phone?: string;
  'Other Links'?: string;
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
      `Name: ${influencer.Name}`,
      `Followers: ${influencer.Followers}`,
      `Engagement Rate: ${influencer['Engagement Rate']}`,
      `Category: ${influencer.Category}`,
      ...(influencer['Creator City'] ? [`City: ${influencer['Creator City']}`] : []),
      ...(influencer.Gender ? [`Gender: ${influencer.Gender}`] : []),
      ...(influencer.Language ? [`Language: ${influencer.Language}`] : []),
      ...(influencer['Creator Country'] ? [`Country: ${influencer['Creator Country']}`] : []),
      ...(influencer.Email ? [`Email: ${influencer.Email}`] : []),
      ...(influencer.Phone ? [`Phone: ${influencer.Phone}`] : []),
      ...(influencer['Other Links'] ? [`Links: ${influencer['Other Links']}`] : [])
    ];
    return fields.join(', ');
  }).join('\n');
} 