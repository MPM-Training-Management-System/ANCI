using Microsoft.Extensions.Caching.Memory;
using server.Services.Interfaces;

namespace server.Services;

public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public CacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public T? Get<T>(string key)
    {
        return _cache.TryGetValue(key, out T? value)
            ? value
            : default;
    }

    public void Set<T>(
        string key,
        T value,
        TimeSpan expiration)
    {
        _cache.Set(
            key,
            value,
            expiration
        );
    }

    public void Remove(string key)
    {
        _cache.Remove(key);
    }
}