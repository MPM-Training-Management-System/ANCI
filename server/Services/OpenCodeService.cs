using System.Diagnostics;
using server.Services.Interfaces;

namespace server.Services;

public class OpenCodeService : IOpenCodeService
{
    private readonly IConfiguration _configuration;

    public OpenCodeService(IConfiguration configuration)
    {
        _configuration = configuration;
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
            [],
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
            throw new ArgumentNullException(
                nameof(imagePaths)
            );
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

        var model =
            _configuration["OpenCode:Model"]
            ?? "anciprovider01/deepseek-v4-flash";

        var opencodePath =
            _configuration["OpenCode:Path"]
            ?? @"C:\nvm4w\nodejs\opencode.ps1";

        if (!File.Exists(opencodePath))
        {
            throw new InvalidOperationException(
                $"OpenCode executable was not found at: {opencodePath}"
            );
        }

        var psi = new ProcessStartInfo
        {
            FileName = "powershell.exe",

            UseShellExecute = false,

            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,

            CreateNoWindow = true,

            WorkingDirectory =
                Directory.GetCurrentDirectory()
        };

        // ========================================================
        // POWERSHELL
        // ========================================================

        psi.ArgumentList.Add("-NoProfile");
        psi.ArgumentList.Add("-ExecutionPolicy");
        psi.ArgumentList.Add("Bypass");
        psi.ArgumentList.Add("-File");
        psi.ArgumentList.Add(opencodePath);

        // ========================================================
        // OPENCODE RUN
        // ========================================================

        psi.ArgumentList.Add("run");

        // Model
        psi.ArgumentList.Add("-m");
        psi.ArgumentList.Add(model);

        // ========================================================
        // IMAGE ATTACHMENTS
        // ========================================================

        foreach (var imagePath in imagePaths)
        {
            psi.ArgumentList.Add("-f");
            psi.ArgumentList.Add(imagePath);
        }

        using var process = new Process
        {
            StartInfo = psi
        };

        try
        {
            process.Start();

            // ====================================================
            // SEND PROMPT THROUGH STDIN
            // ====================================================

            await process.StandardInput.WriteAsync(
                prompt.AsMemory(),
                cancellationToken
            );

            await process.StandardInput.FlushAsync(
                cancellationToken
            );

            process.StandardInput.Close();

            // ====================================================
            // READ OUTPUT
            // ====================================================

            var outputTask =
                process.StandardOutput.ReadToEndAsync(
                    cancellationToken
                );

            var errorTask =
                process.StandardError.ReadToEndAsync(
                    cancellationToken
                );

            await process.WaitForExitAsync(
                cancellationToken
            );

            var output =
                await outputTask;

            var error =
                await errorTask;

            // ====================================================
            // ERROR HANDLING
            // ====================================================

            if (process.ExitCode != 0)
            {
                throw new InvalidOperationException(
                    $"OpenCode failed with exit code " +
                    $"{process.ExitCode}. " +
                    $"Error: {error}"
                );
            }

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
                // Ignore cleanup errors after cancellation.
            }

            throw;
        }
    }
}