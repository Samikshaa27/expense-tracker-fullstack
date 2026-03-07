using System.ComponentModel.DataAnnotations;

namespace ExpenseTrackerAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public List<Expense> Expenses { get; set; }
    }
}