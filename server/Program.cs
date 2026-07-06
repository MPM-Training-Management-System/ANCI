using server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();




builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://anci-tms.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddScoped<JwtService>();
var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Frontend");
app.MapControllers();

app.Run();