using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CalendarAPI.Models;
using CalendarAPI.Services;
using MongoDB.Driver;
using System.Security.Claims;

namespace CalendarAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MonthsController : ControllerBase
    {
        private readonly IMonthService _monthService;

        public MonthsController(IMonthService monthService)
        {
            _monthService = monthService;
        }

        private string GetUserId()
        {
            if (!User.Identity.IsAuthenticated)
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }

            return userId;
        }

        [HttpGet]
        public async Task<ActionResult<List<Month>>> GetAll()
        {
            try
            {
                var userId = GetUserId();
                return await _monthService.GetAllAsync(userId);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Month>> Get(string id)
        {
            try
            {
                var userId = GetUserId();
                var month = await _monthService.GetByIdAsync(id);
                
                if (month == null)
                    return NotFound();
                    
                if (month.UserId != userId)
                    return Unauthorized("You don't have permission to access this month");
                    
                return month;
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<Month>> Create(Month month)
        {
            try
            {
                var userId = GetUserId();
                month.UserId = userId;
                await _monthService.CreateAsync(month);
                return CreatedAtAction(nameof(Get), new { id = month.Id }, month);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Month month)
        {
            try
            {
                var userId = GetUserId();
                var existingMonth = await _monthService.GetByIdAsync(id);
                
                if (existingMonth == null)
                    return NotFound();
                    
                if (existingMonth.UserId != userId)
                    return Unauthorized("You don't have permission to update this month");
                    
                month.UserId = userId; // Ensure userId is preserved
                await _monthService.UpdateAsync(id, month);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var userId = GetUserId();
                var month = await _monthService.GetByIdAsync(id);
                
                if (month == null)
                    return NotFound();
                    
                if (month.UserId != userId)
                    return Unauthorized("You don't have permission to delete this month");
                    
                await _monthService.DeleteAsync(id);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
} 