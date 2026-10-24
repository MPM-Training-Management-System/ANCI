
using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using server.Interfaces;

namespace server.Services;

public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    private readonly ConcurrentDictionary<string, byte> _keys = new();

    private readonly ILogger<CacheService> _logger;

public CacheService(
    IMemoryCache cache,
    ILogger<CacheService> logger)
{
    _cache = cache;
    _logger = logger;
}

    public T? Get<T>(string key)
    {
        return _cache.Get<T>(key);
    }

    public bool TryGet<T>(string key, out T? value)
{
    var found = _cache.TryGetValue(key, out value);

    _logger.LogInformation(
        "CACHE {Result}: {CacheKey}",
        found ? "HIT" : "MISS",
        key);

    return found;
}

    public void Set<T>(
        string key,
        T value,
        TimeSpan expiration)
    {
        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration,
            Priority = CacheItemPriority.Normal
        };

        options.RegisterPostEvictionCallback(
            (evictedKey, _, _, _) =>
            {
                if (evictedKey is string cacheKey)
                {
                    _keys.TryRemove(cacheKey, out _);
                }
            });

        _keys.TryAdd(key, 0);
        _cache.Set(key, value, options);
    }

    public void Remove(string key)
    {
        _cache.Remove(key);
        _keys.TryRemove(key, out _);
    }

    public bool Contains(string key)
    {
        return _cache.TryGetValue(key, out _);
    }

    public void Clear()
{
    foreach (var key in _keys.Keys.ToArray())
    {
        _cache.Remove(key);
        _keys.TryRemove(key, out _);
    }

    _logger.LogInformation(
        "All registered application cache entries have been cleared.");
}

public void RemoveByPrefix(string prefix)
{
    var keysToRemove = _keys.Keys
        .Where(key => key.StartsWith(
            prefix,
            StringComparison.Ordinal))
        .ToArray();

    foreach (var key in keysToRemove)
    {
        Remove(key);
    }

    _logger.LogInformation(
        "Invalidated {Count} cache entries with prefix {Prefix}.",
        keysToRemove.Length,
        prefix);
}
}
