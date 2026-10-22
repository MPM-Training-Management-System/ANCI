namespace server.Interfaces;

public interface ICacheService
{
    T? Get<T>(string key);

    bool TryGet<T>(
        string key,
        out T? value
    );

    void Set<T>(
        string key,
        T value,
        TimeSpan expiration
    );

    void Remove(string key);

    bool Contains(string key);

    void Clear();
}