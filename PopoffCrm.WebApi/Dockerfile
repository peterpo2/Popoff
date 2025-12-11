# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and restore
COPY PopoffCrm.sln ./
COPY PopoffCrm.Domain/PopoffCrm.Domain.csproj ./PopoffCrm.Domain/
COPY PopoffCrm.Application/PopoffCrm.Application.csproj ./PopoffCrm.Application/
COPY PopoffCrm.Infrastructure/PopoffCrm.Infrastructure.csproj ./PopoffCrm.Infrastructure/
COPY PopoffCrm.WebApi/PopoffCrm.WebApi.csproj ./PopoffCrm.WebApi/
RUN dotnet restore ./PopoffCrm.WebApi/PopoffCrm.WebApi.csproj

# Copy source and publish
COPY PopoffCrm.Domain ./PopoffCrm.Domain
COPY PopoffCrm.Application ./PopoffCrm.Application
COPY PopoffCrm.Infrastructure ./PopoffCrm.Infrastructure
COPY PopoffCrm.WebApi ./PopoffCrm.WebApi
RUN dotnet publish PopoffCrm.WebApi/PopoffCrm.WebApi.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "PopoffCrm.WebApi.dll"]
