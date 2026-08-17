namespace server.DTOs
{
    public class IdValidationResponseDTO
    {
        public bool IsValid { get; set; }

        public string Status { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public string ExtractedText { get; set; } = string.Empty;

        public string ExtractedName { get; set; } = string.Empty;

        public DateOnly? ExtractedDateOfBirth { get; set; }

        // User-selected ID type
        public string IdType { get; set; } = string.Empty;

        // OCR-detected ID type
        public string DetectedIdType { get; set; } = string.Empty;

        public bool NameMatched { get; set; }

        public bool DateOfBirthMatched { get; set; }

        public bool IdTypeMatched { get; set; }

        public bool NeedsAdminReview { get; set; }
    }
}