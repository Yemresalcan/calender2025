using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CalendarAPI.Models
{
    public class Month
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("order")]
        public int Order { get; set; }

        [BsonElement("days")]
        public int Days { get; set; } = 30;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 