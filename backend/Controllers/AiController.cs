using ExpenseTrackerAPI.Data;
using ExpenseTrackerAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace ExpenseTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _openAiApiKey;

        public AiController(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            // Prioritize environment variables for production flexibility
            _openAiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                            ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
                            ?? configuration["OpenAI:ApiKey"] 
                            ?? string.Empty;
        }

        [HttpGet("financial-coach")]
        public async Task<IActionResult> GetFinancialCoach()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = int.Parse(userIdString);

            var expenses = await _context.Expenses.Where(e => e.UserId == userId).ToListAsync();
            var total = expenses.Sum(e => e.Amount);
            var count = expenses.Count;
            var topCategory = expenses
                .GroupBy(e => e.Category)
                .OrderByDescending(g => g.Sum(e => e.Amount))
                .Select(g => g.Key)
                .FirstOrDefault() ?? "None";

            string prompt = $"Analyze the following user spending data and provide short financial advice.\n\nTotal spent: {total}\nTop category: {topCategory}\nTransactions: {count}\n\nProvide 2-3 short suggestions to help the user manage their budget.";

            string advice = await GetAiResponse(prompt);

            return Ok(new { advice });
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = int.Parse(userIdString);

            var expenses = await _context.Expenses.Where(e => e.UserId == userId).ToListAsync();
            var total = expenses.Sum(e => e.Amount);
            var count = expenses.Count;
            var topCategory = expenses
                .GroupBy(e => e.Category)
                .OrderByDescending(g => g.Sum(e => e.Amount))
                .Select(g => g.Key)
                .FirstOrDefault() ?? "None";

            string prompt = $"User question: {request.Message}\n\nUser spending data:\nTotal spent: {total}\nTop category: {topCategory}\nTransactions: {count}\n\nAnswer the user's question based on this data.";

            string reply = await GetAiResponse(prompt, true);

            return Ok(new { reply });
        }

        private async Task<string> GetAiResponse(string prompt, bool isChat = false)
        {
            if (string.IsNullOrEmpty(_openAiApiKey) || _openAiApiKey == "your_openai_api_key_here")
            {
                if (isChat)
                {
                    return "AI is not configured. Please add your API key to environment variables (GEMINI_API_KEY or OPENAI_API_KEY).";
                }
                return "AI is not configured. Please add your API key to environment variables (GEMINI_API_KEY or OPENAI_API_KEY). Dummy advice: Keep tracking your expenses and stick to your budget!";
            }

            if (_openAiApiKey.StartsWith("AIza"))
            {
                // Process as Gemini API
                var geminiRequest = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[] { new { text = prompt } }
                        }
                    }
                };

                // Using gemini-1.5-flash as it is the most stable and widely available model
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_openAiApiKey}");
                requestMessage.Content = new StringContent(JsonSerializer.Serialize(geminiRequest), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(requestMessage);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Gemini API Error: {error}");
                    return $"Sorry, I couldn't generate a response at this time due to an API error (Status: {response.StatusCode}).";
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);
                try
                {
                    var result = document.RootElement.GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text").GetString();

                    return result?.Trim() ?? "No response generated.";
                }
                catch
                {
                    return "Sorry, I couldn't parse the AI response.";
                }
            }
            else
            {
                // Process as OpenAI API
                var aiRequest = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a helpful financial assistant." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 150
                };

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _openAiApiKey);
                requestMessage.Content = new StringContent(JsonSerializer.Serialize(aiRequest), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(requestMessage);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"OpenAI API Error: {error}");
                    return $"Sorry, I couldn't generate a response at this time due to an API error (Status: {response.StatusCode}).";
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);
                var result = document.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                return result?.Trim() ?? "No response generated.";
            }
        }
    }
}
