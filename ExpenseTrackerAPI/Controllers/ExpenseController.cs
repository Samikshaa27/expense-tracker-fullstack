using ExpenseTrackerAPI.Data;
using ExpenseTrackerAPI.DTOs;
using ExpenseTrackerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpenseTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExpenseController(AppDbContext context)
        {
            _context = context;
        }

        // ADD EXPENSE
        [HttpPost]
        public async Task<IActionResult> AddExpense(AddExpenseDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expense = new Expense
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Category = dto.Category,
                Date = DateTime.UtcNow,
                UserId = userId
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return Ok(expense);
        }
        // GET USER EXPENSES WITH PAGINATION + DATE FILTER
        [HttpGet]
        public async Task<IActionResult> GetExpenses(
            int page = 1,
            int pageSize = 5,
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var query = _context.Expenses
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .AsQueryable();

            // Apply date filters if provided
            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate.Value);

            var totalRecords = await query.CountAsync();

            var expenses = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalRecords,
                page,
                pageSize,
                data = expenses
            });
        }

        // UPDATE EXPENSE
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, AddExpenseDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense == null)
                return NotFound("Expense not found.");

            expense.Title = dto.Title;
            expense.Amount = dto.Amount;
            expense.Category = dto.Category;

            await _context.SaveChangesAsync();

            return Ok(expense);
        }

        // DELETE EXPENSE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense == null)
                return NotFound("Expense not found.");

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return Ok("Expense deleted successfully.");
        }
        // EXPENSE SUMMARY
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expenses = await _context.Expenses
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var total = expenses.Sum(e => e.Amount);
            var count = expenses.Count;

            return Ok(new
            {
                totalExpenses = total,
                totalTransactions = count
            });
        }
        [HttpGet("category-summary")]
        public async Task<IActionResult> GetCategorySummary()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var categorySummary = await _context.Expenses
                .Where(e => e.UserId == userId)
                .GroupBy(e => e.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Total = g.Sum(e => e.Amount)
                })
                .ToListAsync();

            return Ok(categorySummary);
        }
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expenses = await _context.Expenses
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var totalExpenses = expenses.Sum(e => e.Amount);
            var totalTransactions = expenses.Count;

            var topCategory = expenses
                .GroupBy(e => e.Category)
                .OrderByDescending(g => g.Sum(e => e.Amount))
                .Select(g => g.Key)
                .FirstOrDefault();

            return Ok(new
            {
                totalExpenses,
                totalTransactions,
                topCategory
            });
        }
    }
}