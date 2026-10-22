namespace server.Settings;

public sealed class RecoveryDatabaseSettings
{
    public const string SectionName = "RecoveryDatabase";

    public string ConnectionStringName { get; set; } =
        "RecoveryConnection";
}