using server.Models;

namespace server.Algorithms
{
    public static class UserSearchAlgorithm
    {
        public static IEnumerable<UserModel> Search(
            IEnumerable<UserModel> users,
            string? keyword,
            string? role)
        {
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim().ToLower();

                users = users.Where(u =>
                    u.Username.ToLower().Contains(keyword) ||
                    u.FullName.ToLower().Contains(keyword) ||
                    u.Email.ToLower().Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                users = users.Where(u =>
                    u.Role.Equals(role,
                        StringComparison.OrdinalIgnoreCase));
            }

            return users;
        }
    }
}