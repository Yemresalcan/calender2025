var builder = WebApplication.CreateBuilder(args);

// MongoDB Configuration
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp => 
    new MongoClient(builder.Configuration["MongoDbSettings:ConnectionString"]));

builder.Services.AddScoped<IMonthService, MonthService>();

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173") // React uygulamanızın adresi
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

app.UseCors("AllowReactApp");
// ... diğer middleware'ler 