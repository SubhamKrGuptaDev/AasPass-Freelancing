export type ContactRequestType = 'QUERY' | 'FEEDBACK' | 'COMPLAINT';

export type ContactRequestStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface ContactRequestPayload {
  type: ContactRequestType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  /** Honeypot: real users leave it empty. */
  website: string;
}

export interface ContactRequestResult {
  id: number | null;
  type: ContactRequestType;
  status: ContactRequestStatus;
  creationDateTime: string;
}

export const CONTACT_TYPE_OPTIONS: { value: ContactRequestType; label: string }[] = [
  { value: 'QUERY', label: 'Query / Doubt' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'COMPLAINT', label: 'Complaint' }
];
