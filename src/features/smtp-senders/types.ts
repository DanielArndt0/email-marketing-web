export type SmtpTestStatus = "success" | "failed" | "error" | string;

export type SmtpSender = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestStatus: SmtpTestStatus | null;
  lastTestError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SmtpSenderListQuery = {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
};

export type SmtpSenderListResponse = {
  items: SmtpSender[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CreateSmtpSenderInput = {
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | null;
  host: string;
  port: number;
  secure: boolean;
  username?: string | null;
  password?: string | null;
  isActive?: boolean;
};

export type UpdateSmtpSenderInput = Partial<CreateSmtpSenderInput>;

export type TestSmtpSenderInput = {
  to?: string;
};

export type TestSmtpSenderResponse = {
  status: string;
  message: string;
  testedAt: string;
};

export type DeleteSmtpSenderResponse = {
  status: string;
  id: string;
};
