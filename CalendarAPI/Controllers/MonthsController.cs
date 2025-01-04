using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CalendarAPI.Models;
using CalendarAPI.Services;
using MongoDB.Driver;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace CalendarAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MonthsController : ControllerBase
    {
        private readonly IMongoCollection<Month> _months;
        private readonly ILogger<MonthsController> _logger;

        public MonthsController(IMongoDatabase database, ILogger<MonthsController> logger)
        {
            _months = database.GetCollection<Month>("Months");
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Month>>> GetMonths()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var months = await _months.Find(m => m.UserId == userId)
                                    .SortBy(m => m.Order)
                                    .ToListAsync();
            return Ok(months);
        }

        [HttpPost]
        public async Task<ActionResult<Month>> CreateMonth(Month month)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            month.UserId = userId;
            
            // Sıralama için son ayın order'ını bul
            var lastMonth = await _months.Find(m => m.UserId == userId)
                                       .SortByDescending(m => m.Order)
                                       .FirstOrDefaultAsync();
            month.Order = (lastMonth?.Order ?? 0) + 1;
            
            await _months.InsertOneAsync(month);
            return CreatedAtAction(nameof(GetMonths), new { id = month.Id }, month);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMonth(string id, Month monthUpdate)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var month = await _months.Find(m => m.Id == id && m.UserId == userId)
                                    .FirstOrDefaultAsync();

            if (month == null)
            {
                return NotFound();
            }

            monthUpdate.UserId = userId;
            monthUpdate.UpdatedAt = DateTime.UtcNow;
            
            await _months.ReplaceOneAsync(m => m.Id == id && m.UserId == userId, monthUpdate);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMonth(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _months.DeleteOneAsync(m => m.Id == id && m.UserId == userId);

            if (result.DeletedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderMonths([FromBody] List<MonthOrderUpdate> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            foreach (var update in updates)
            {
                await _months.UpdateOneAsync(
                    m => m.Id == update.Id && m.UserId == userId,
                    Builders<Month>.Update.Set(m => m.Order, update.NewOrder)
                );
            }

            return Ok();
        }

        [HttpPost("initialize")]
        public async Task<ActionResult<IEnumerable<Month>>> InitializeMonths()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation($"Initializing months for user: {userId}");

                // Kullanıcının mevcut ayları var mı kontrol et
                var existingMonths = await _months.Find(m => m.UserId == userId).AnyAsync();
                if (existingMonths)
                {
                    _logger.LogInformation("Months already exist for user");
                    return Ok(await _months.Find(m => m.UserId == userId).ToListAsync());
                }

                // 13 ay oluştur
                var defaultMonths = new List<Month>();
                for (int i = 1; i <= 13; i++)
                {
                    defaultMonths.Add(new Month
                    {
                        UserId = userId,
                        Name = GetMonthName(i),
                        Days = 28,
                        Order = i,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                _logger.LogInformation($"Creating {defaultMonths.Count} months for user");
                await _months.InsertManyAsync(defaultMonths);
                
                return Ok(defaultMonths);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error initializing months: {ex.Message}");
                return StatusCode(500, new { message = "Aylar oluşturulurken bir hata oluştu" });
            }
        }

        private string GetMonthName(int order)
        {
            return order switch
            {
                1 => "Ocak",
                2 => "Şubat",
                3 => "Mart",
                4 => "Nisan",
                5 => "Mayıs",
                6 => "Haziran",
                7 => "Temmuz",
                8 => "Ağustos",
                9 => "Eylül",
                10 => "Ekim",
                11 => "Kasım",
                12 => "Aralık",
                13 => "On Üçüncü Ay",
                _ => $"Ay {order}"
            };
        }
    }

    public class MonthOrderUpdate
    {
        public string Id { get; set; }
        public int NewOrder { get; set; }
    }
} 