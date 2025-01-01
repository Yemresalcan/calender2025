using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CalendarAPI.Models;
using CalendarAPI.Services;

namespace CalendarAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonthsController : ControllerBase
    {
        private readonly IMonthService _monthService;

        public MonthsController(IMonthService monthService)
        {
            _monthService = monthService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Month>>> GetAll()
        {
            var userId = "test-user"; // Şimdilik sabit, sonra JWT'den alacağız
            return await _monthService.GetAllAsync(userId);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Month>> Get(string id)
        {
            var month = await _monthService.GetByIdAsync(id);
            if (month == null)
                return NotFound();
            return month;
        }

        [HttpPost]
        public async Task<ActionResult<Month>> Create(Month month)
        {
            month.UserId = "test-user"; // Şimdilik sabit
            await _monthService.CreateAsync(month);
            return CreatedAtAction(nameof(Get), new { id = month.Id }, month);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Month month)
        {
            var existingMonth = await _monthService.GetByIdAsync(id);
            if (existingMonth == null)
                return NotFound();
            
            await _monthService.UpdateAsync(id, month);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var month = await _monthService.GetByIdAsync(id);
            if (month == null)
                return NotFound();
            
            await _monthService.DeleteAsync(id);
            return NoContent();
        }
    }
} 