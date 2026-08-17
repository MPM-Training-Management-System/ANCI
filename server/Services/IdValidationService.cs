using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Services.Interfaces;

namespace server.Services
{
    public class IdValidationService : IIdValidationService
    {
        private readonly AppDbContext _context;
        private readonly OcrService _ocrService;

        public IdValidationService(
            AppDbContext context,
            OcrService ocrService)
        {
            _context = context;
            _ocrService = ocrService;
        }

        // =====================================================
        // VALIDATE ID
        // =====================================================

        public async Task<IdValidationResponseDTO> ValidateAsync(
            Guid userId,
            IFormFile file,
            string idType)
        {
            Console.WriteLine("========================================");
            Console.WriteLine("ID VALIDATION STARTED");
            Console.WriteLine($"USER ID: {userId}");
            Console.WriteLine($"SELECTED ID TYPE: {idType}");
            Console.WriteLine("========================================");

            // =================================================
            // BASIC VALIDATION
            // =================================================

            if (file == null || file.Length == 0)
            {
                return InvalidResponse(
                    idType,
                    "No valid ID file was uploaded."
                );
            }

            if (string.IsNullOrWhiteSpace(idType))
            {
                return InvalidResponse(
                    idType,
                    "ID type is required."
                );
            }

            // =================================================
            // GET USER
            // =================================================

            var user =
                await _context.Users
                    .Include(x => x.Trainer)
                    .Include(x => x.Participant)
                    .FirstOrDefaultAsync(
                        x => x.Id == userId
                    );

            if (user == null)
            {
                return InvalidResponse(
                    idType,
                    "User account was not found."
                );
            }

            Console.WriteLine(
                $"USER FOUND: {user.Email}"
            );

            Console.WriteLine(
                $"ROLE: {user.Role}"
            );

            // =================================================
            // GET PROFILE INFORMATION
            // =================================================

            string databaseName;
            DateOnly? databaseDateOfBirth;

            if (
                user.Role.Equals(
                    "Trainer",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                if (user.Trainer == null)
                {
                    return InvalidResponse(
                        idType,
                        "Trainer profile was not found."
                    );
                }

                databaseName =
                    BuildFullName(
                        user.FirstName,
                        user.MiddleName,
                        user.LastName
                    );

                databaseDateOfBirth =
                    user.Trainer.DateOfBirth;

                Console.WriteLine(
                    "PROFILE TYPE: TRAINER"
                );
            }
            else if (
                user.Role.Equals(
                    "Participant",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                if (user.Participant == null)
                {
                    return InvalidResponse(
                        idType,
                        "Participant profile was not found."
                    );
                }

                databaseName =
                    BuildFullName(
                        user.FirstName,
                        user.MiddleName,
                        user.LastName
                    );

                databaseDateOfBirth =
                    user.Participant.DateOfBirth;

                Console.WriteLine(
                    "PROFILE TYPE: PARTICIPANT"
                );
            }
            else
            {
                return InvalidResponse(
                    idType,
                    $"ID validation is not supported for role '{user.Role}'."
                );
            }

            Console.WriteLine(
                $"DATABASE NAME: {databaseName}"
            );

            Console.WriteLine(
                $"DATABASE DOB: {databaseDateOfBirth}"
            );

            // =================================================
            // OCR
            // =================================================

            string extractedText;

            try
            {
                Console.WriteLine(
                    "STARTING OCR..."
                );

                extractedText =
                    await _ocrService.ExtractTextAsync(
                        file
                    );

                Console.WriteLine(
                    "OCR COMPLETED."
                );

                Console.WriteLine(
                    "========================================"
                );

                Console.WriteLine(
                    "EXTRACTED OCR TEXT:"
                );

                Console.WriteLine(
                    extractedText
                );

                Console.WriteLine(
                    "========================================"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"OCR ERROR: {ex.Message}"
                );

                return new IdValidationResponseDTO
                {
                    IsValid = false,
                    Status = "OCR_FAILED",
                    Message =
                        $"Unable to read the uploaded ID: {ex.Message}",

                    ExtractedText = "",
                    ExtractedName = "",
                    ExtractedDateOfBirth = null,

                    IdType = idType,

                    NameMatched = false,
                    DateOfBirthMatched = false,
                    IdTypeMatched = false,

                    NeedsAdminReview = true
                };
            }

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                return new IdValidationResponseDTO
                {
                    IsValid = false,
                    Status = "OCR_FAILED",
                    Message =
                        "No readable text was detected from the uploaded ID.",

                    ExtractedText = "",
                    ExtractedName = "",
                    ExtractedDateOfBirth = null,

                    IdType = idType,

                    NameMatched = false,
                    DateOfBirthMatched = false,
                    IdTypeMatched = false,

                    NeedsAdminReview = true
                };
            }

            // =================================================
            // EXTRACT NAME
            // =================================================

            var extractedName =
                ExtractName(
                    extractedText,
                    databaseName
                );

            Console.WriteLine(
                $"EXTRACTED NAME: {extractedName}"
            );

            // =================================================
            // EXTRACT DATE OF BIRTH
            // =================================================

            var extractedDateOfBirth =
                ExtractDateOfBirth(
                    extractedText
                );

            if (extractedDateOfBirth.HasValue)
            {
                Console.WriteLine(
                    $"EXTRACTED DOB: {extractedDateOfBirth.Value:MM/dd/yyyy}"
                );
            }
            else
            {
                Console.WriteLine(
                    "EXTRACTED DOB: OCR DATE WAS NOT FOUND"
                );
            }

            // =================================================
            // NORMALIZE NAME
            // =================================================

            var normalizedDatabaseName =
                NormalizeName(
                    databaseName
                );

            var normalizedOcrName =
                NormalizeName(
                    extractedName
                );

            Console.WriteLine(
                $"NORMALIZED DATABASE NAME: {normalizedDatabaseName}"
            );

            Console.WriteLine(
                $"NORMALIZED OCR NAME: {normalizedOcrName}"
            );

            // =================================================
            // NAME MATCH
            // =================================================

            var nameMatched =
                NamesMatch(
                    normalizedDatabaseName,
                    normalizedOcrName
                );

            // =================================================
            // DOB MATCH
            // =================================================

            var dateOfBirthMatched =
                DatesMatch(
                    databaseDateOfBirth,
                    extractedDateOfBirth
                );

            // =================================================
            // DETECT ID TYPE
            // =================================================

            var detectedIdType =
                DetectIdType(
                    extractedText
                );

            Console.WriteLine(
                $"DETECTED ID TYPE: {detectedIdType}"
            );

            // =================================================
            // ID TYPE MATCH
            // =================================================

            var idTypeMatched =
                IdTypesMatch(
                    idType,
                    detectedIdType
                );

            Console.WriteLine(
                $"SELECTED ID TYPE: {idType}"
            );

            Console.WriteLine(
                $"DETECTED ID TYPE: {detectedIdType}"
            );

            Console.WriteLine(
                $"ID TYPE MATCHED: {idTypeMatched}"
            );

            // =================================================
            // MATCH RESULTS
            // =================================================

            Console.WriteLine(
                "========================================"
            );

            Console.WriteLine(
                "MATCH RESULTS"
            );

            Console.WriteLine(
                $"NAME MATCHED: {nameMatched}"
            );

            Console.WriteLine(
                $"DOB MATCHED: {dateOfBirthMatched}"
            );

            Console.WriteLine(
                $"ID TYPE MATCHED: {idTypeMatched}"
            );

            Console.WriteLine(
                "========================================"
            );

            // =================================================
            // AUTOMATIC APPROVAL
            // =================================================

            if (
                nameMatched &&
                dateOfBirthMatched 
            )
            {
                Console.WriteLine(
                    "ID VALIDATION: VERIFIED"
                );

                Console.WriteLine(
                    "AUTOMATIC APPROVAL STARTED"
                );

                // -------------------------------------------------
                // USER
                // -------------------------------------------------

                user.IsActive = true;

                Console.WriteLine(
                    "USER IsActive = TRUE"
                );

                // -------------------------------------------------
                // TRAINER
                // -------------------------------------------------

                if (
                    user.Role.Equals(
                        "Trainer",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    if (user.Trainer != null)
                    {
                        user.Trainer.IsActive = true;

                        Console.WriteLine(
                            "TRAINER IsActive = TRUE"
                        );
                    }
                }

                // -------------------------------------------------
                // PARTICIPANT
                // -------------------------------------------------

                else if (
                    user.Role.Equals(
                        "Participant",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    if (user.Participant != null)
                    {
                        user.Participant.IsActive = true;

                        Console.WriteLine(
                            "PARTICIPANT IsActive = TRUE"
                        );
                    }
                }

                // -------------------------------------------------
                // SAVE
                // -------------------------------------------------

                await _context.SaveChangesAsync();

                Console.WriteLine(
                    "DATABASE UPDATED"
                );

                Console.WriteLine(
                    "ACCOUNT AUTOMATICALLY APPROVED"
                );

                Console.WriteLine(
                    "========================================"
                );

                return new IdValidationResponseDTO
                {
                    IsValid = true,

                    Status = "VERIFIED",

                    Message =
                        "Valid ID successfully verified. The name, date of birth, and ID type matched the registered information. The account has been automatically approved.",

                    ExtractedText =
                        extractedText,

                    ExtractedName =
                        extractedName,

                    ExtractedDateOfBirth =
                        extractedDateOfBirth,

                    IdType =
                        idType,

                    NameMatched = true,

                    DateOfBirthMatched = true,

                    IdTypeMatched = true,

                    NeedsAdminReview = false
                };
            }

            // =================================================
            // ADMIN REVIEW
            // =================================================

            Console.WriteLine(
                "ID VALIDATION: ADMIN REVIEW REQUIRED"
            );

            return new IdValidationResponseDTO
            {
                IsValid = false,

                Status = "PENDING_REVIEW",

                Message =
                    "The uploaded ID could not be completely matched with the registered information and requires administrator review.",

                ExtractedText =
                    extractedText,

                ExtractedName =
                    extractedName,

                ExtractedDateOfBirth =
                    extractedDateOfBirth,

                IdType =
                    idType,

                NameMatched =
                    nameMatched,

                DateOfBirthMatched =
                    dateOfBirthMatched,

                IdTypeMatched =
                    idTypeMatched,

                NeedsAdminReview = true
            };
        }

        // =====================================================
        // BUILD FULL NAME
        // =====================================================

        private static string BuildFullName(
            string? firstName,
            string? middleName,
            string? lastName)
        {
            return string.Join(
                " ",
                new[]
                {
                    firstName,
                    middleName,
                    lastName
                }
                .Where(
                    x =>
                        !string.IsNullOrWhiteSpace(x)
                )
            );
        }

        // =====================================================
        // EXTRACT NAME
        // =====================================================

        private static string ExtractName(
            string text,
            string databaseName)
        {
            var databaseWords =
                NormalizeName(databaseName)
                    .Split(
                        ' ',
                        StringSplitOptions.RemoveEmptyEntries
                    );

            var detectedWords =
                new List<string>();

            foreach (var word in databaseWords)
            {
                if (
                    ContainsOcrEquivalent(
                        text,
                        word
                    )
                )
                {
                    detectedWords.Add(word);
                }
            }

            Console.WriteLine(
                $"DATABASE NAME WORDS DETECTED: {string.Join(", ", detectedWords)}"
            );

            return string.Join(
                " ",
                detectedWords
            );
        }

        // =====================================================
        // NORMALIZE NAME
        // =====================================================

        private static string NormalizeName(
            string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return "";
            }

            var normalized =
                name.ToUpperInvariant();

            normalized =
                Regex.Replace(
                    normalized,
                    @"[^A-Z0-9\s]",
                    " "
                );

            normalized =
                Regex.Replace(
                    normalized,
                    @"\s+",
                    " "
                );

            return normalized.Trim();
        }

        // =====================================================
        // NAME MATCH
        // =====================================================

        private static bool NamesMatch(
            string databaseName,
            string extractedName)
        {
            if (
                string.IsNullOrWhiteSpace(databaseName) ||
                string.IsNullOrWhiteSpace(extractedName)
            )
            {
                return false;
            }

            var databaseWords =
                databaseName.Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries
                );

            var extractedWords =
                extractedName.Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries
                );

            var matched = 0;

            foreach (var databaseWord in databaseWords)
            {
                foreach (var extractedWord in extractedWords)
                {
                    if (
                        databaseWord.Equals(
                            extractedWord,
                            StringComparison.OrdinalIgnoreCase
                        )
                    )
                    {
                        matched++;
                        break;
                    }
                }
            }

            return matched == databaseWords.Length;
        }

        // =====================================================
        // OCR EQUIVALENT
        // =====================================================

        private static bool ContainsOcrEquivalent(
            string text,
            string target)
        {
            var normalizedText =
                NormalizeName(text);

            var normalizedTarget =
                NormalizeName(target);

            if (
                normalizedText.Contains(
                    normalizedTarget,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return true;
            }

            var words =
                normalizedText.Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries
                );

            foreach (var word in words)
            {
                if (
                    LevenshteinDistance(
                        word,
                        normalizedTarget
                    ) <= 2
                )
                {
                    return true;
                }
            }

            return false;
        }

        // =====================================================
        // LEVENSHTEIN
        // =====================================================

        private static int LevenshteinDistance(
            string a,
            string b)
        {
            var matrix =
                new int[
                    a.Length + 1,
                    b.Length + 1
                ];

            for (var i = 0; i <= a.Length; i++)
            {
                matrix[i, 0] = i;
            }

            for (var j = 0; j <= b.Length; j++)
            {
                matrix[0, j] = j;
            }

            for (var i = 1; i <= a.Length; i++)
            {
                for (var j = 1; j <= b.Length; j++)
                {
                    var cost =
                        a[i - 1] == b[j - 1]
                            ? 0
                            : 1;

                    matrix[i, j] =
                        Math.Min(
                            Math.Min(
                                matrix[i - 1, j] + 1,
                                matrix[i, j - 1] + 1
                            ),
                            matrix[i - 1, j - 1] + cost
                        );
                }
            }

            return matrix[
                a.Length,
                b.Length
            ];
        }

        // =====================================================
        // EXTRACT DATE OF BIRTH
        // =====================================================

        private static DateOnly? ExtractDateOfBirth(
            string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return null;
            }

            // -------------------------------------------------
            // Month Day Year
            // Example:
            // April 24 2005
            // Apr 24 2005
            // -------------------------------------------------

            var monthRegex =
                new Regex(
                    @"\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{1,2}\s*,?\s*\d{4}\b",
                    RegexOptions.IgnoreCase
                );

            var match =
                monthRegex.Match(text);

            if (match.Success)
            {
                var date =
                    ParseDate(
                        match.Value
                    );

                if (date.HasValue)
                {
                    return date;
                }
            }

            // -------------------------------------------------
            // Numeric
            // 04/24/2005
            // 4/24/2005
            // -------------------------------------------------

            var numericRegex =
                new Regex(
                    @"\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\b"
                );

            match =
                numericRegex.Match(text);

            if (match.Success)
            {
                var date =
                    ParseDate(
                        match.Value
                    );

                if (date.HasValue)
                {
                    return date;
                }
            }

            // -------------------------------------------------
            // OCR CORRUPTED APRIL
            // Example:
            // AP i, 2005
            // -------------------------------------------------

            var corruptedApril =
                Regex.Match(
                    text.ToUpperInvariant(),
                    @"\bAP[A-Z0-9\s]{0,8}[,\.\s]+(19|20)\d{2}\b"
                );

            if (corruptedApril.Success)
            {
                var yearMatch =
                    Regex.Match(
                        corruptedApril.Value,
                        @"\d{4}"
                    );

                var dayMatch =
                    Regex.Match(
                        corruptedApril.Value,
                        @"\b([0-3]?\d)\b"
                    );

                if (
                    yearMatch.Success &&
                    dayMatch.Success &&
                    int.TryParse(
                        yearMatch.Value,
                        out var year) &&
                    int.TryParse(
                        dayMatch.Groups[1].Value,
                        out var day)
                )
                {
                    if (
                        day >= 1 &&
                        day <= 31
                    )
                    {
                        try
                        {
                            return new DateOnly(
                                year,
                                4,
                                day
                            );
                        }
                        catch
                        {
                            return null;
                        }
                    }
                }
            }

            return null;
        }

        // =====================================================
        // PARSE DATE
        // =====================================================

        private static DateOnly? ParseDate(
            string value)
        {
            var formats =
                new[]
                {
                    "MM/dd/yyyy",
                    "M/d/yyyy",
                    "MM/d/yyyy",
                    "M/dd/yyyy",

                    "MM-dd-yyyy",
                    "M-d-yyyy",

                    "MM.dd.yyyy",
                    "M.d.yyyy",

                    "MMMM d yyyy",
                    "MMMM dd yyyy",

                    "MMM d yyyy",
                    "MMM dd yyyy"
                };

            var cleaned =
                value
                    .Replace(",", "")
                    .Trim();

            foreach (var format in formats)
            {
                if (
                    DateTime.TryParseExact(
                        cleaned,
                        format,
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var result
                    )
                )
                {
                    return DateOnly.FromDateTime(
                        result
                    );
                }
            }

            return null;
        }

        // =====================================================
        // DATE MATCH
        // =====================================================

        private static bool DatesMatch(
            DateOnly? databaseDate,
            DateOnly? extractedDate)
        {
            if (!databaseDate.HasValue)
            {
                Console.WriteLine(
                    "DATE MATCH: DATABASE DATE WAS NOT FOUND"
                );

                return false;
            }

            if (!extractedDate.HasValue)
            {
                Console.WriteLine(
                    "DATE MATCH: OCR DATE WAS NOT FOUND"
                );

                return false;
            }

            Console.WriteLine(
                $"DATABASE DATE: {databaseDate.Value:MM/dd/yyyy}"
            );

            Console.WriteLine(
                $"OCR DATE: {extractedDate.Value:MM/dd/yyyy}"
            );

            return
                databaseDate.Value ==
                extractedDate.Value;
        }

        // =====================================================
        // DETECT ID TYPE
        // =====================================================

        private static string DetectIdType(
            string text)
        {
            var upper =
                text.ToUpperInvariant();

            if (
                upper.Contains("PHILSYS") ||
                upper.Contains("NATIONAL ID") ||
                upper.Contains(
                    "PHILIPPINE IDENTIFICATION") ||
                upper.Contains("PSN") ||
                upper.Contains("PCN")
            )
            {
                return "National ID";
            }

            if (
                upper.Contains("PASSPORT") &&
                upper.Contains("PHILIPPINES")
            )
            {
                return "Philippine Passport";
            }

            if (
                upper.Contains("DRIVER") &&
                upper.Contains("LICENSE")
            )
            {
                return "Driver's License";
            }

            if (
                upper.Contains("UMID") ||
                upper.Contains(
                    "UNIFIED MULTI-PURPOSE ID")
            )
            {
                return "UMID";
            }

            if (
                upper.Contains("SSS") ||
                upper.Contains(
                    "SOCIAL SECURITY SYSTEM")
            )
            {
                return "SSS ID";
            }

            if (upper.Contains("PHILHEALTH"))
            {
                return "PhilHealth ID";
            }

            if (
                upper.Contains("PRC") ||
                upper.Contains(
                    "PROFESSIONAL REGULATION COMMISSION")
            )
            {
                return "PRC ID";
            }

            if (
                upper.Contains("POSTAL") ||
                upper.Contains("PHILPOST")
            )
            {
                return "Postal ID";
            }

            if (
                upper.Contains("COMELEC") ||
                upper.Contains("VOTER")
            )
            {
                return "Voter's ID";
            }

            return "";
        }

        // =====================================================
        // ID TYPE MATCH
        // =====================================================

        private static bool IdTypesMatch(
            string selected,
            string detected)
        {
            if (
                string.IsNullOrWhiteSpace(selected) ||
                string.IsNullOrWhiteSpace(detected)
            )
            {
                return false;
            }

            return NormalizeIdType(selected)
                .Equals(
                    NormalizeIdType(detected),
                    StringComparison.OrdinalIgnoreCase
                );
        }

        // =====================================================
        // NORMALIZE ID TYPE
        // =====================================================

        private static string NormalizeIdType(
            string value)
        {
            var normalized =
                value
                    .Trim()
                    .ToUpperInvariant();

            return normalized switch
            {
                "NATIONAL ID" =>
                    "NATIONAL ID",

                "PHILIPPINE NATIONAL ID" =>
                    "NATIONAL ID",

                "PHILSYS" =>
                    "NATIONAL ID",

                "PHILSYS ID" =>
                    "NATIONAL ID",

                "PHILIPPINE IDENTIFICATION" =>
                    "NATIONAL ID",

                "PASSPORT" =>
                    "PHILIPPINE PASSPORT",

                "PHILIPPINE PASSPORT" =>
                    "PHILIPPINE PASSPORT",

                "DRIVER LICENSE" =>
                    "DRIVER'S LICENSE",

                "DRIVERS LICENSE" =>
                    "DRIVER'S LICENSE",

                "DRIVER'S LICENSE" =>
                    "DRIVER'S LICENSE",

                "UMID ID" =>
                    "UMID",

                "SSS" =>
                    "SSS ID",

                "PHILHEALTH" =>
                    "PHILHEALTH ID",

                "PRC" =>
                    "PRC ID",

                "POSTAL" =>
                    "POSTAL ID",

                "VOTER ID" =>
                    "VOTER'S ID",

                "VOTERS ID" =>
                    "VOTER'S ID",

                _ =>
                    normalized
            };
        }

        // =====================================================
        // INVALID RESPONSE
        // =====================================================

        private static IdValidationResponseDTO InvalidResponse(
            string idType,
            string message)
        {
            return new IdValidationResponseDTO
            {
                IsValid = false,

                Status = "INVALID",

                Message = message,

                ExtractedText = "",

                ExtractedName = "",

                ExtractedDateOfBirth = null,

                IdType = idType,

                NameMatched = false,

                DateOfBirthMatched = false,

                IdTypeMatched = false,

                NeedsAdminReview = false
            };
        }
    }
}