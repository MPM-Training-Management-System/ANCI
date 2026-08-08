"use client";

import { useState } from "react";

import {
  Modal,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Stepper
} from "@repo/ui/index";
import { participantApi } from "@/lib/api";
import { RegisterParticipantRequest } from "@repo/types";
import { notify } from "@repo/hooks";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddUserModal({
  open,
  onClose,
}: AddUserModalProps) {
  const [form, setForm] = useState<RegisterParticipantRequest>({
  profileImage: undefined,

  FirstName: "",
  MiddleName: "",
  LastName: "",

  DateOfBirth: "",

  Gender: "",
  CivilStatus: "",

  MobileNumber: "",
  Email: "",

  Username: "",

  HomeAddress: "",

  EmergencyContactName: "",
  EmergencyRelationship: "",
  EmergencyContactNumber: "",

  Password: "",
});

const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

 const handleSubmit = async () => {
  if (form.Password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const response = await participantApi.register(form);  
    console.log("FORM:", form);
    notify.success("CRegister Successfull")

    onClose();
  } catch (error) {
    console.error(error);
    alert("Unable to register participant.");
  }
};
  return (
    <Modal
  open={open}
  onClose={onClose}
  title="Add User"
  description="Complete all required information."
  size="lg"
  footer={
    <>
      {step > 1 && (
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
        >
          Back
        </Button>
      )}

      {step < 4 ? (
        <Button
          onClick={() => setStep(step + 1)}
        >
          Next
        </Button>
      ) : (
        <Button onClick={handleSubmit}>
          Register User
        </Button>
      )}
    </>
  }
>
    <Stepper
  currentStep={step}
  steps={[
    "Personal",
    "Contact",
    "Emergency",
    "Account",
  ]}
/>
{step === 1 && (
  <div className="mt-8 grid grid-cols-2 gap-5">

    <Input
  title="First Name"
  placeholder="Enter first name"
  value={form.FirstName}
  onChange={(e) =>
    setForm({
      ...form,
      FirstName: e.target.value,
    })
  }
/>
    <Input
  title="Middle Name"
  placeholder="Enter middle name"
  value={form.MiddleName}
  onChange={(e) =>
    setForm({
      ...form,
      MiddleName: e.target.value,
    })
  }
/>

    <Input
  title="Last Name"
  placeholder="Enter last name"
  value={form.LastName}
  onChange={(e) =>
    setForm({
      ...form,
      LastName: e.target.value,
    })
  }
/>

    <Input
  title="Date of Birth"
  type="date"
  value={form.DateOfBirth}
  onChange={(e) =>
    setForm({
      ...form,
      DateOfBirth: e.target.value,
    })
  }
/>

    <Select
  value={form.Gender}
  onValueChange={(value) =>
    setForm({
      ...form,
      Gender: value,
    })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select Gender" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="Male">Male</SelectItem>
    <SelectItem value="Female">Female</SelectItem>
  </SelectContent>
</Select>

   <Select
  value={form.CivilStatus}
  onValueChange={(value) =>
    setForm({
      ...form,
      CivilStatus: value,
    })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select Civil Status" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="Single">Single</SelectItem>
    <SelectItem value="Married">Married</SelectItem>
    <SelectItem value="Widowed">Widowed</SelectItem>
    <SelectItem value="Separated">Separated</SelectItem>
  </SelectContent>
</Select>

  </div>
  
)}
{step === 2 && (
  <div className="mt-8 space-y-5">

   <Input
  title="Mobile Number"
  placeholder="09XXXXXXXXX"
  value={form.MobileNumber}
  onChange={(e) =>
    setForm({
      ...form,
      MobileNumber: e.target.value,
    })
  }
/>

<Input
  title="Email"
  type="email"
  placeholder="example@email.com"
  value={form.Email}
  onChange={(e) =>
    setForm({
      ...form,
      Email: e.target.value,
    })
  }
/>

<Input
  title="Home Address"
  placeholder="Enter home address"
  value={form.HomeAddress}
  onChange={(e) =>
    setForm({
      ...form,
      HomeAddress: e.target.value,
    })
  }
/>

  </div>
)}
{step === 3 && (
  <div className="mt-8 space-y-5">

   <Input
  title="Emergency Contact Name"
  placeholder="Emergency Contact Name"
  value={form.EmergencyContactName}
  onChange={(e)=>
    setForm({
      ...form,
      EmergencyContactName:e.target.value
    })
  }
/>

<Input
  title="Relationship"
  placeholder="Relationship"
  value={form.EmergencyRelationship}
  onChange={(e)=>
    setForm({
      ...form,
      EmergencyRelationship:e.target.value
    })
  }
/>

<Input
  title="Contact Number"
  placeholder="Contact Number"
  value={form.EmergencyContactNumber}
  onChange={(e)=>
    setForm({
      ...form,
      EmergencyContactNumber:e.target.value
    })
  }
/>

  </div>
)}
{step === 4 && (
  <div className="mt-8 space-y-5">
<Input
  title="Profile Image"
  type="file"
  accept="image/*"
  onChange={(e) =>
    setForm({
      ...form,
      profileImage: e.target.files?.[0],
    })
  }
/>
    <Input
  title="Username"
  placeholder="Username"
  value={form.Username}
  onChange={(e)=>
    setForm({
      ...form,
      Username:e.target.value
    })
  }
/>

<Input
  title="Password"
  type="password"
  placeholder="Passsword"
  value={form.Password}
  onChange={(e)=>
    setForm({
      ...form,
      Password:e.target.value
    })
  }
/>

<Input
  title="Confirm Password"
  type="password"
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e)=>
    setConfirmPassword(e.target.value)
  }
/>

  </div>
)}
    
    </Modal>
  );
}