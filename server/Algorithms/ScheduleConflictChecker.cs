using server.Data;
using Microsoft.EntityFrameworkCore;

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
            int trainerId,
            string venue,
            DateTime startDate,
            DateTime endDate,
            int? excludeScheduleId = null)
        {
            // Trainer Conflict
            bool trainerConflict = await _context.TrainingSchedules.AnyAsync(x =>
                x.TrainerId == trainerId &&
                (excludeScheduleId == null || x.Id != excludeScheduleId) &&
                startDate < x.EndDate &&
                endDate > x.StartDate);

            if (trainerConflict)
                return true;

            // Venue Conflict
            bool venueConflict = await _context.TrainingSchedules.AnyAsync(x =>
                x.Venue == venue &&
                (excludeScheduleId == null || x.Id != excludeScheduleId) &&
                startDate < x.EndDate &&
                endDate > x.StartDate);

            return venueConflict;
        }
    }
}