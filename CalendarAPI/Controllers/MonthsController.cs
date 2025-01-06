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
        private readonly IMongoDatabase _database;

        public MonthsController(IMongoDatabase database, ILogger<MonthsController> logger)
        {
            _months = database.GetCollection<Month>("Months");
            _logger = logger;
            _database = database;
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

                // 2025 yılı için her ayın ilk gününün haftanın hangi günü olduğunu hesapla
                var monthStartDays = new Dictionary<int, int>
                {
                    { 1, 3 },   // Ocak 2025 Çarşamba günü başlıyor
                    { 2, 6 },   // Şubat 2025 Cumartesi günü başlıyor
                    { 3, 6 },   // Mart 2025 Cumartesi günü başlıyor
                    { 4, 2 },   // Nisan 2025 Salı günü başlıyor
                    { 5, 4 },   // Mayıs 2025 Perşembe günü başlıyor
                    { 6, 0 },   // Haziran 2025 Pazar günü başlıyor
                    { 7, 2 },   // Temmuz 2025 Salı günü başlıyor
                    { 8, 5 },   // Ağustos 2025 Cuma günü başlıyor
                    { 9, 1 },   // Eylül 2025 Pazartesi günü başlıyor
                    { 10, 3 },  // Ekim 2025 Çarşamba günü başlıyor
                    { 11, 6 },  // Kasım 2025 Cumartesi günü başlıyor
                    { 12, 1 },  // Aralık 2025 Pazartesi günü başlıyor
                    { 13, 3 }   // 13. ay (Varsayılan olarak Çarşamba)
                };

                var defaultMonths = new List<Month>();
                for (int i = 1; i <= 13; i++)
                {
                    defaultMonths.Add(new Month
                    {
                        UserId = userId,
                        Name = GetMonthName(i),
                        Days = 28,
                        StartDay = monthStartDays[i], // 0: Pazar, 1: Pazartesi, ..., 6: Cumartesi
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

        [HttpPost("initialize-tasks")]
        public async Task<ActionResult<IEnumerable<WeeklyTask>>> InitializeWeeklyTasks()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new InvalidOperationException("User ID not found");

                var tasksCollection = _database.GetCollection<WeeklyTask>("WeeklyTasks");

                // Kullanıcının mevcut görevleri var mı kontrol et
                var existingTasks = await tasksCollection.Find(t => t.UserId == userId).AnyAsync();
                if (existingTasks)
                {
                    return Ok(await tasksCollection.Find(t => t.UserId == userId).ToListAsync());
                }

                var months = await _months.Find(m => m.UserId == userId)
                                        .SortBy(m => m.Order)
                                        .ToListAsync();

                var weeklyTasks = new List<WeeklyTask>();
                var currentDate = new DateTime(2025, 1, 25); // Başlangıç tarihi

                foreach (var month in months)
                {
                    // Her ay için 4 hafta oluştur
                    for (int week = 1; week <= 4; week++)
                    {
                        var endDate = currentDate.AddDays(6);
                        
                        weeklyTasks.Add(new WeeklyTask
                        {
                            UserId = userId,
                            MonthId = month.Id,
                            WeekNumber = week,
                            StartDate = currentDate.ToString("yyyy-MM-dd"),
                            EndDate = endDate.ToString("yyyy-MM-dd"),
                            TaskText = "Yeni görev ekleyin",
                            Days = Enumerable.Range((week - 1) * 7 + 1, 7).ToList(),
                            Color = "#FF6B6B"
                        });

                        currentDate = endDate.AddDays(1);
                    }
                }

                await tasksCollection.InsertManyAsync(weeklyTasks);
                return Ok(weeklyTasks);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error initializing weekly tasks: {ex.Message}");
                return StatusCode(500, new { message = "Görevler oluşturulurken bir hata oluştu" });
            }
        }

        [HttpGet("{monthId}/tasks")]
        public async Task<ActionResult<IEnumerable<WeeklyTask>>> GetWeeklyTasks(string monthId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var tasksCollection = _database.GetCollection<WeeklyTask>("WeeklyTasks");
                
                var tasks = await tasksCollection
                    .Find(t => t.UserId == userId && t.MonthId == monthId)
                    .ToListAsync();
                    
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting tasks: {ex.Message}");
                return StatusCode(500, new { message = "Görevler alınırken bir hata oluştu" });
            }
        }

        [HttpPost("tasks")]
        public async Task<ActionResult<WeeklyTask>> AddWeeklyTask([FromBody] WeeklyTaskCreate taskCreate)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new InvalidOperationException("User ID not found");
                var tasksCollection = _database.GetCollection<WeeklyTask>("WeeklyTasks");

                var task = new WeeklyTask
                {
                    MonthId = taskCreate.MonthId,
                    WeekNumber = taskCreate.WeekNumber,
                    StartDate = taskCreate.StartDate,
                    EndDate = taskCreate.EndDate,
                    Days = taskCreate.Days,
                    Color = taskCreate.Color,
                    TaskText = taskCreate.TaskText,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await tasksCollection.InsertOneAsync(task);
                return CreatedAtAction(nameof(GetWeeklyTasks), new { monthId = task.MonthId }, task);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding task: {ex.Message}");
                return StatusCode(500, new { message = "Görev eklenirken bir hata oluştu" });
            }
        }

        [HttpPut("tasks/{taskId}")]
        public async Task<IActionResult> UpdateWeeklyTask(string taskId, [FromBody] WeeklyTaskCreate taskUpdate)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new InvalidOperationException("User ID not found");
                var tasksCollection = _database.GetCollection<WeeklyTask>("WeeklyTasks");

                var existingTask = await tasksCollection.Find(t => t.Id == taskId && t.UserId == userId)
                    .FirstOrDefaultAsync();

                if (existingTask == null)
                {
                    return NotFound();
                }

                var updatedTask = new WeeklyTask
                {
                    Id = taskId,
                    UserId = userId,
                    MonthId = taskUpdate.MonthId,
                    WeekNumber = taskUpdate.WeekNumber,
                    StartDate = taskUpdate.StartDate,
                    EndDate = taskUpdate.EndDate,
                    Days = taskUpdate.Days,
                    Color = taskUpdate.Color,
                    TaskText = taskUpdate.TaskText,
                    CreatedAt = existingTask.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await tasksCollection.ReplaceOneAsync(
                    t => t.Id == taskId && t.UserId == userId,
                    updatedTask
                );

                if (result.ModifiedCount == 0)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating task: {ex.Message}");
                return StatusCode(500, new { message = "Görev güncellenirken bir hata oluştu" });
            }
        }

        [HttpDelete("tasks/{taskId}")]
        public async Task<IActionResult> DeleteWeeklyTask(string taskId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var tasksCollection = _database.GetCollection<WeeklyTask>("WeeklyTasks");

                var result = await tasksCollection.DeleteOneAsync(
                    t => t.Id == taskId && t.UserId == userId
                );

                if (result.DeletedCount == 0)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting task: {ex.Message}");
                return StatusCode(500, new { message = "Görev silinirken bir hata oluştu" });
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