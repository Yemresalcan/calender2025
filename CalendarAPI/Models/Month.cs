using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CalendarAPI.Models
{
    public class Month
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<Week> Weeks { get; set; } = new List<Week>();
        public string UserId { get; set; } = string.Empty;
    }
} 