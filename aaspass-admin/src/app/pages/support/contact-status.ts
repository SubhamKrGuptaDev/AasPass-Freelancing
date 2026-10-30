import { ChipStatus } from '../../components/status-chip/status-chip';
import { ContactRequestStatus, ContactRequestType } from '../../models/admin.models';

/** Maps a contact request status to its status-chip label. */
export function toChipStatus(s: ContactRequestStatus): ChipStatus {
  switch (s) {
    case 'IN_PROGRESS':
      return 'in progress';
    case 'RESOLVED':
      return 'resolved';
    default:
      return 'new';
  }
}

export const CONTACT_TYPE_LABELS: Record<ContactRequestType, string> = {
  QUERY: 'Query',
  FEEDBACK: 'Feedback',
  COMPLAINT: 'Complaint'
};
