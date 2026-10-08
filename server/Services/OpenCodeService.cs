using System.Diagnostics;
using server.Services.Interfaces;

namespace server.Services;

public class OpenCodeService : IOpenCodeService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenCodeService> _logger;

    public OpenCodeService(
        IConfiguration configuration,
        ILogger<OpenCodeService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    // ============================================================
    // TEXT ONLY
    // ============================================================

    public async Task<string> RunAsync(
        string prompt,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteOpenCodeAsync(
            prompt,
            Array.Empty<string>(),
            cancellationToken
        );
    }

    // ============================================================
    // TEXT + IMAGES
    // ============================================================

    public async Task<string> RunWithImagesAsync(
        string prompt,
        IReadOnlyList<string> imagePaths,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new ArgumentException(
                "OpenCode prompt cannot be empty.",
                nameof(prompt)
            );
        }

        if (imagePaths is null)
        {
            throw new ArgumentNullException(nameof(imagePaths));
        }

        var validImagePaths = imagePaths
            .Where(path => !string.IsNullOrWhiteSpace(path))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        foreach (var imagePath in validImagePaths)
        {
            if (!File.Exists(imagePath))
            {
                throw new FileNotFoundException(
                    $"OpenCode image attachment was not found: {imagePath}",
                    imagePath
                );
            }
        }

        return await ExecuteOpenCodeAsync(
            prompt,
            validImagePaths,
            cancellationToken
        );
    }

    // ============================================================
    // OPEN CODE EXECUTION
    // ============================================================

    private async Task<string> ExecuteOpenCodeAsync(
        string prompt,
        IReadOnlyList<string> imagePaths,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new ArgumentException(
                "OpenCode prompt cannot be empty.",
                nameof(prompt)
            );
        }

        // ========================================================
        // CONFIGURATION
        // ========================================================

        var configuredModel =
            _configuration["OpenCode:Model"];

        var model = string.IsNullOrWhiteSpace(configuredModel)
            ? "anciprovider01/deepseek-v4-flash"
            : configuredModel.Trim();

        var configuredPath =
            _configuration["OpenCode:Path"];

        var opencodePath =
            string.IsNullOrWhiteSpace(configuredPath)
                ? @"C:\nvm4w\nodejs\opencode.ps1"
                : configuredPath.Trim();

        // ========================================================
        // VALIDATE OPENCODE
        // ========================================================

        if (!File.Exists(opencodePath))
        {
            throw new InvalidOperationException(
                $"OpenCode executable was not found at: {opencodePath}"
            );
        }

        // ========================================================
        // LOG CONFIGURATION
        // ========================================================

        _logger.LogInformation(
            "Starting OpenCode. Model: {Model}, Path: {Path}, Images: {ImageCount}",
            model,
            opencodePath,
            imagePaths.Count
        );

        // ========================================================
        // PROCESS
        // ========================================================

        var psi = new ProcessStartInfo
        {
            FileName = "powershell.exe",

            UseShellExecute = false,

            RedirectStandardOutput = true,
            RedirectStandardError = true,

            CreateNoWindow = true,

            WorkingDirectory = Directory.GetCurrentDirectory()
        };

        // ========================================================
        // POWERSHELL ARGUMENTS
        // ========================================================

        psi.ArgumentList.Add("-NoProfile");
        psi.ArgumentList.Add("-NonInteractive");
        psi.ArgumentList.Add("-ExecutionPolicy");
        psi.ArgumentList.Add("Bypass");
        psi.ArgumentList.Add("-File");
        psi.ArgumentList.Add(opencodePath);

        // ========================================================
        // OPENCODE RUN
        // ========================================================

        psi.ArgumentList.Add("run");

        // ========================================================
        // MODEL
        // ========================================================

        psi.ArgumentList.Add("--model");
        psi.ArgumentList.Add(model);

        // ========================================================
        // IMAGE ATTACHMENTS
        // ========================================================

        foreach (var imagePath in imagePaths)
        {
            psi.ArgumentList.Add("--file");
            psi.ArgumentList.Add(imagePath);
        }

        // ========================================================
        // PROMPT
        // ========================================================

        psi.ArgumentList.Add(prompt);

        using var process = new Process
        {
            StartInfo = psi,
            EnableRaisingEvents = true
        };

        try
        {
            process.Start();

            // ====================================================
            // READ OUTPUT AND ERROR CONCURRENTLY
            // ====================================================

            var outputTask =
                process.StandardOutput.ReadToEndAsync();

            var errorTask =
                process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync(
                cancellationToken
            );

            var output = await outputTask;
            var error = await errorTask;

            // ====================================================
            // LOG RAW OUTPUT
            // ====================================================

            _logger.LogDebug(
                "OpenCode stdout: {Output}",
                output
            );

            if (!string.IsNullOrWhiteSpace(error))
            {
                _logger.LogWarning(
                    "OpenCode stderr: {Error}",
                    error
                );
            }

            // ====================================================
            // EXIT CODE
            // ====================================================

            if (process.ExitCode != 0)
            {
                var cleanError =
                    string.IsNullOrWhiteSpace(error)
                        ? "OpenCode returned a non-zero exit code without an error message."
                        : error.Trim();

                throw new InvalidOperationException(
                    $"OpenCode failed with exit code {process.ExitCode}. " +
                    $"Error: {cleanError}"
                );
            }

            // ====================================================
            // EMPTY RESPONSE
            // ====================================================

            if (string.IsNullOrWhiteSpace(output))
            {
                throw new InvalidOperationException(
                    "OpenCode returned an empty response."
                );
            }

            return output.Trim();
        }
        catch (OperationCanceledException)
        {
            try
            {
                if (!process.HasExited)
                {
                    process.Kill(true);
                }
            }
            catch
            {
                // Ignore cleanup errors.
            }

            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "OpenCode execution failed."
            );

            throw;
        }
    }
}