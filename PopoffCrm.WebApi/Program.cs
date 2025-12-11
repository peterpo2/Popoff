using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PopoffCrm.Infrastructure;
using PopoffCrm.WebApi.Settings;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Bind settings from configuration/environment variables (see docker-compose and .env.example)
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<AppUrlsSettings>(builder.Configuration.GetSection(AppUrlsSettings.SectionName));

builder.Services.AddOptions<GoogleAuthSettings>()
    .Bind(builder.Configuration.GetSection(GoogleAuthSettings.SectionName))
    .PostConfigure(options =>
    {
        var clientId = builder.Configuration["GOOGLE_CLIENT_ID"];
        var clientSecret = builder.Configuration["GOOGLE_CLIENT_SECRET"];
        var allowedDomain = builder.Configuration["GOOGLE_ALLOWED_DOMAIN"];

        if (!string.IsNullOrWhiteSpace(clientId))
        {
            options.ClientId = clientId;
        }

        if (!string.IsNullOrWhiteSpace(clientSecret))
        {
            options.ClientSecret = clientSecret;
        }

        if (!string.IsNullOrWhiteSpace(allowedDomain))
        {
            options.AllowedDomain = allowedDomain;
        }
    });

var appUrlsSettings = builder.Configuration.GetSection(AppUrlsSettings.SectionName).Get<AppUrlsSettings>() ?? new();
var allowedOrigins = new List<string>(appUrlsSettings.AllowedOrigins
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

if (allowedOrigins.Count == 0)
{
    // Default to the local frontend during development; when the public domain is ready
    // (e.g., https://crm.popoff.com) add it to AppUrls__AllowedOrigins so the hosted
    // frontend can call the API via CORS.
    allowedOrigins.Add("http://localhost:3000");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "Popoff CRM API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme"
    });
    options.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

// Example of how Google OAuth could be enabled in the future without altering the
// existing JWT setup:
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer()
// .AddGoogle(options =>
// {
//     var googleOptions = builder.Configuration.GetSection(GoogleAuthSettings.SectionName).Get<GoogleAuthSettings>() ?? new();
//     options.ClientId = googleOptions.ClientId;
//     options.ClientSecret = googleOptions.ClientSecret;
// });

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtSettings>>((options, jwtOptions) =>
    {
        var jwtSettings = jwtOptions.Value;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
