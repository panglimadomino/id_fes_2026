export type EventRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  reg_open_at: string | null;
  reg_close_at: string | null;
  allow_public_registration: boolean;
};

export type RegistrationPayload = {
  eventSlug: string;
  teamName: string;
  provinsi: string;
  kabKota: string;
  athlete1: {
    fullName: string;
    wa: string;
    gender: "LAKI-LAKI" | "PEREMPUAN";
    dob: string;
    age: number;
  };
  athlete2: {
    fullName: string;
    wa: string;
    gender: "LAKI-LAKI" | "PEREMPUAN";
    dob: string;
    age: number;
  };
};
