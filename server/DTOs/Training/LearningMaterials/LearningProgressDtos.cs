namespace server.DTOs.Training.LearningMaterials;

// =========================================================
// LEARNING SECTION PROGRESS
// =========================================================

public class LearningSectionProgressDto
{
    public Guid SectionId { get; set; }

    public int SectionNumber { get; set; }

    public string Title { get; set; } = default!;

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime? LastReadAt { get; set; }
}


// =========================================================
// LEARNING MODULE PROGRESS
// =========================================================

public class LearningModuleProgressDto
{
    public Guid ModuleId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public int TotalSections { get; set; }

    public int CompletedSections { get; set; }

    public decimal ProgressPercentage { get; set; }

    public Guid? LastReadSectionId { get; set; }

    public IReadOnlyList<LearningSectionProgressDto> Sections { get; set; }
        = [];
}


// =========================================================
// LEARNING MATERIAL PROGRESS
// =========================================================

public class LearningMaterialProgressDto
{
    public Guid LearningMaterialId { get; set; }

    public int TotalModules { get; set; }

    public int CompletedModules { get; set; }

    public int TotalSections { get; set; }

    public int CompletedSections { get; set; }

    public decimal ProgressPercentage { get; set; }

    public Guid? LastReadModuleId { get; set; }

    public Guid? LastReadSectionId { get; set; }

    public IReadOnlyList<LearningModuleProgressDto> Modules { get; set; }
        = [];
}