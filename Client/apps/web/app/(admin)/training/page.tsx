import TrainingHeader from "@/components/admin/training-programs/TrainingHeader";
import TrainingPillarOverview from "@/components/admin/training-programs/TrainingPillarOverview";
import TrainingProgramsGrid from "@/components/admin/training-programs/TrainingProgramsGrid";
import TrainingFooterStats from "@/components/admin/training-programs/TrainingFooterStats";

export default function TrainingProgramsPage() {
  return (
    <div className="space-y-8">
      <TrainingHeader />

      <TrainingPillarOverview />

      <TrainingProgramsGrid />

      <TrainingFooterStats />
    </div>
  );
}