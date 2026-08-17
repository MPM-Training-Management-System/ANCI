using Tesseract;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace server.Services
{
    public class OcrService
    {
        private readonly IWebHostEnvironment _environment;

        public OcrService(
            IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> ExtractTextAsync(
            IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new Exception(
                    "No ID file was uploaded."
                );
            }

            var extension =
                Path.GetExtension(
                    file.FileName)
                    .ToLowerInvariant();

            var allowedExtensions =
                new[]
                {
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".webp"
                };

            if (!allowedExtensions.Contains(
                    extension))
            {
                throw new Exception(
                    "OCR currently supports JPG, JPEG, PNG, and WebP files."
                );
            }

            // =====================================================
            // DIRECTORIES
            // =====================================================

            var tempDirectory =
                Path.Combine(
                    _environment.ContentRootPath,
                    "temp"
                );

            Directory.CreateDirectory(
                tempDirectory
            );

            var originalPath =
                Path.Combine(
                    tempDirectory,
                    $"{Guid.NewGuid()}{extension}"
                );

            var processedPath =
                Path.Combine(
                    tempDirectory,
                    $"{Guid.NewGuid()}_processed.jpg"
                );

            try
            {
                // =================================================
                // SAVE ORIGINAL
                // =================================================

                await using (
                    var stream =
                        new FileStream(
                            originalPath,
                            FileMode.Create,
                            FileAccess.Write,
                            FileShare.None
                        )
                )
                {
                    await file.CopyToAsync(
                        stream
                    );
                }

                // =================================================
                // PREPROCESS IMAGE
                // =================================================

                Console.WriteLine(
                    "========================================"
                );

                Console.WriteLine(
                    "OCR IMAGE PREPROCESSING"
                );

                using (
                    var image =
                        await Image.LoadAsync(
                            originalPath
                        )
                )
                {
                    // ---------------------------------------------
                    // UPSCALE
                    // ---------------------------------------------
                    //
                    // Tesseract works better when text is larger.
                    //

                    image.Mutate(
                        x =>
                        {
                            x.Resize(
                                new ResizeOptions
                                {
                                    Mode =
                                        ResizeMode.Max,

                                    Size =
                                        new Size(
                                            2400,
                                            2400)
                                }
                            );

                            // -------------------------------------
                            // GRAYSCALE
                            // -------------------------------------

                            x.Grayscale();

                            // -------------------------------------
                            // CONTRAST
                            // -------------------------------------

                            x.Contrast(
                                1.5f
                            );

                            // -------------------------------------
                            // SHARPEN
                            // -------------------------------------

                            x.GaussianSharpen(
                                1.2f
                            );
                        }
                    );

                    await image.SaveAsJpegAsync(
                        processedPath,
                        new JpegEncoder
                        {
                            Quality = 95
                        }
                    );
                }

                Console.WriteLine(
                    "OCR IMAGE PREPROCESSING COMPLETED"
                );

                // =================================================
                // TESSDATA
                // =================================================

                var tessDataPath =
                    Path.Combine(
                        _environment.ContentRootPath,
                        "tessdata"
                    );

                if (!Directory.Exists(
                        tessDataPath))
                {
                    throw new Exception(
                        "OCR tessdata folder was not found."
                    );
                }

                var trainedData =
                    Path.Combine(
                        tessDataPath,
                        "eng.traineddata"
                    );

                if (!File.Exists(
                        trainedData))
                {
                    throw new Exception(
                        "eng.traineddata was not found inside the tessdata folder."
                    );
                }

                // =================================================
                // TESSERACT
                // =================================================

                using var engine =
                    new TesseractEngine(
                        tessDataPath,
                        "eng",
                        EngineMode.Default
                    );

                // =================================================
                // OCR ORIGINAL + PROCESSED
                // =================================================

                string processedText;

                using (
                    var image =
                        Pix.LoadFromFile(
                            processedPath
                        )
                )
                using (
                    var page =
                        engine.Process(
                            image,
                            PageSegMode.Auto
                        )
                )
                {
                    processedText =
                        page.GetText()
                        ?.Trim()
                        ?? "";
                }

                Console.WriteLine(
                    "========================================"
                );

                Console.WriteLine(
                    "OCR RESULT"
                );

                Console.WriteLine(
                    processedText
                );

                Console.WriteLine(
                    "========================================"
                );

                return processedText;
            }
            finally
            {
                // =================================================
                // CLEAN ORIGINAL
                // =================================================

                if (File.Exists(
                        originalPath))
                {
                    try
                    {
                        File.Delete(
                            originalPath
                        );
                    }
                    catch
                    {
                    }
                }

                // =================================================
                // CLEAN PROCESSED
                // =================================================

                if (File.Exists(
                        processedPath))
                {
                    try
                    {
                        File.Delete(
                            processedPath
                        );
                    }
                    catch
                    {
                    }
                }
            }
        }
    }
}