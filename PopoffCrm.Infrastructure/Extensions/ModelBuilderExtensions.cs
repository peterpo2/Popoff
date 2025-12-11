using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Infrastructure.Extensions;

public static class ModelBuilderExtensions
{
    public static void ApplyGlobalFilters<T>(this ModelBuilder modelBuilder, Expression<Func<T, bool>> filter) where T : AuditedEntity
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(T).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType);
                var body = ReplacingExpressionVisitor.Replace(filter.Parameters[0], parameter, filter.Body);
                var lambda = Expression.Lambda(body, parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }
}
