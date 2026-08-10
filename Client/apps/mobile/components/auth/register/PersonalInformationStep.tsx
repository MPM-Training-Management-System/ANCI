import {
  FormSection,
  Input,
} from "@repo/ui-mobile";

type RegisterFormData = {
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  CivilStatus: string;
  MobileNumber: string;
  HomeAddress: string;


};

interface Props {
  form: RegisterFormData;

  updateForm: (
    values: Partial<RegisterFormData>
  ) => void;
}

export default function PersonalInformationForm({
  form,
  updateForm,
}: Props) {
  return (
    <FormSection
      title="Personal Information"
      subtitle="Tell us about yourself."
    >
      <Input
        label="First Name"
        required
        value={form.FirstName}
        onChangeText={(value) =>
          updateForm({
            FirstName: value,
          })
        }
        placeholder="Juan"
      />

      <Input
        label="Middle Name"
        value={form.MiddleName}
        onChangeText={(value) =>
          updateForm({
            MiddleName: value,
          })
        }
        placeholder="Santos"
      />

      <Input
        label="Last Name"
        required
        value={form.LastName}
        onChangeText={(value) =>
          updateForm({
            LastName: value,
          })
        }
        placeholder="Dela Cruz"
      />

      <Input
        label="Date of Birth"
        required
        value={form.DateOfBirth}
        onChangeText={(value) =>
          updateForm({
            DateOfBirth: value,
          })
        }
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="Gender"
        required
        value={form.Gender}
        onChangeText={(value) =>
          updateForm({
            Gender: value,
          })
        }
        placeholder="Male / Female"
      />

      <Input
        label="Civil Status"
        required
        value={form.CivilStatus}
        onChangeText={(value) =>
          updateForm({
            CivilStatus: value,
          })
        }
        placeholder="Single"
      />
    </FormSection>
  );
}