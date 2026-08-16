using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services.Interfaces;

namespace server.Services
{
    public class ParticipantPolicyService
        : IParticipantPolicyService
    {
        private readonly AppDbContext _context;

        public ParticipantPolicyService(
            AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Passed, string Remarks)> CheckAsync(
            Guid userId)
        {
            var participant =
                await _context.Participants
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(
                        p => p.UserId == userId
                    );

            if (participant == null)
            {
                return (
                    false,
                    "Participant profile not found."
                );
            }

            var failedRules =
                new List<string>();

            // Email verification
            if (!participant.User.IsEmailVerified)
            {
                failedRules.Add(
                    "Email is not verified."
                );
            }

            // Personal information
            if (string.IsNullOrWhiteSpace(
                participant.FirstName))
            {
                failedRules.Add(
                    "First name is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(
                participant.LastName))
            {
                failedRules.Add(
                    "Last name is missing."
                );
            }

            if (participant.DateOfBirth == default)
            {
                failedRules.Add(
                    "Date of birth is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(
                participant.Gender))
            {
                failedRules.Add(
                    "Gender is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(
                participant.CivilStatus))
            {
                failedRules.Add(
                    "Civil status is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(
                participant.MobileNumber))
            {
                failedRules.Add(
                    "Mobile number is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(
                participant.HomeAddress))
            {
                failedRules.Add(
                    "Home address is missing."
                );
            }

            // Documents
            if (string.IsNullOrWhiteSpace(
                participant.ProfileImage))
            {
                failedRules.Add(
                    "Profile photo is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(
                participant.ValidId))
            {
                failedRules.Add(
                    "Valid ID is missing."
                );
            }

            if (failedRules.Count > 0)
            {
                return (
                    false,
                    string.Join(
                        " ",
                        failedRules
                    )
                );
            }

            return (
                true,
                "All automatic policy requirements passed."
            );
        }
    }
}