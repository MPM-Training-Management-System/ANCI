using Microsoft.EntityFrameworkCore;
using server.Data;

namespace server.Algorithms
{
    public class ScheduleConflictChecker
    {
        private readonly AppDbContext _context;

        public ScheduleConflictChecker(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasConflictAsync(
            Guid trainerId,
            string venue,
            DateTime startDate,
            DateTime endDate,
            Guid? excludeScheduleId = null)
        {
            // =====================================
            // TRAINER CONFLICT
            // =====================================
            bool trainerConflict = await _context.TrainingSchedules.AnyAsync(x =>
                x.TrainerId == trainerId &&
                (excludeScheduleId == null || x.Id != excludeScheduleId) &&
                startDate < x.EndDate &&
                endDate > x.StartDate);

            if (trainerConflict)
            {
                return true;
            }

            // =====================================
            // VENUE CONFLICT
            // =====================================
            bool venueConflict = await _context.TrainingSchedules.AnyAsync(x =>
                x.Venue == venue &&
                (excludeScheduleId == null || x.Id != excludeScheduleId) &&
                startDate < x.EndDate &&
                endDate > x.StartDate);

            return venueConflict;
        }
    }
}