
import { Checkbox, Body, VStack} from "@repo/ui-mobile";

interface AgreementSectionProps {
  agreeTerms: boolean;
  agreePrivacy: boolean;

  onAgreeTermsChange: (checked: boolean) => void;
  onAgreePrivacyChange: (checked: boolean) => void;
}

export default function AgreementSection({
  agreeTerms,
  agreePrivacy,
  onAgreeTermsChange,
  onAgreePrivacyChange,
}: AgreementSectionProps) {
  return (
    <VStack >

      <Body>
        Please read and accept the agreements below before creating your
        account.
      </Body>

      <Checkbox
        label="I agree to the Terms and Conditions"
        checked={agreeTerms}
        onCheckedChange={onAgreeTermsChange}
      />

      <Checkbox
        label="I agree to the Privacy Policy"
        checked={agreePrivacy}
        onCheckedChange={onAgreePrivacyChange}
      />

    </VStack>
  );
}