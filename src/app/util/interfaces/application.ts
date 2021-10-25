export interface Application {
  id: string;
  applicationNumber: string;
  type: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantMiddleName: string;
  gender: string;
  dateOfBirth: string;
  vendorName: string;
  contactEmail: string;
  contactPhone: string;
  image: string;
  status: string;
  applicationDate: string;
  applicantName?: string;
  reviewedBy?: string;
  reviewDate?: string;
}
