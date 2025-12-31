import type { BookingRequirement } from '../../../../types/settings';

export const DEFAULT_REQUIREMENTS: BookingRequirement[] = [
  {
    id: 'customer_name',
    field_name: 'Customer Name',
    required: true,
    field_type: 'text',
    status: 'required',
  },
  {
    id: 'phone_number',
    field_name: 'Phone Number',
    required: false,
    field_type: 'phone',
    status: 'recommended',
  },
  {
    id: 'email_address',
    field_name: 'Email Address',
    required: false,
    field_type: 'email',
    status: 'optional',
  },
  {
    id: 'service_address',
    field_name: 'Service Address',
    required: false,
    field_type: 'text',
    status: 'optional',
  },
  {
    id: 'photos_of_issue',
    field_name: 'Photos of Issue',
    required: false,
    field_type: 'file',
    status: 'optional',
  },
];
