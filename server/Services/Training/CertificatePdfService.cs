using System.Globalization;
using Microsoft.AspNetCore.Hosting;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;
using server.Services.Interfaces;

namespace server.Services;

public class CertificatePdfService : ICertificatePdfService
{
    private const string Navy = "#1F3555";
    private const string Gray = "#4A5568";

    // File names inside server/wwwroot/images/
    private const string BackgroundFile = "certificate-bg.png";
    private const string LogoFile = "ANCILOGO.png";
    private const string LaurelFile = "laurel.png";

    private readonly IWebHostEnvironment _env;

    public CertificatePdfService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<Stream> GenerateAsync(
        string participantName,
        string trainingName,
        string batchCode,
        string certificateNumber,
        DateTime issuedAt,
        string verificationCode,
        string certificateType)
    {
        var stream = new MemoryStream();

        var isCompletion = string.Equals(
            certificateType, "Completion", StringComparison.OrdinalIgnoreCase);

        var title = isCompletion
            ? "CERTIFICATE OF COMPLETION"
            : "CERTIFICATE OF PARTICIPATION";

        var verificationUrl =
            $"https://www.acenextgen.me/verify-certificate/{Uri.EscapeDataString(verificationCode)}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrData = qrGenerator.CreateQrCode(verificationUrl, QRCodeGenerator.ECCLevel.Q);
        var qrBytes = new PngByteQRCode(qrData).GetGraphic(8);

        var bgBytes = await LoadImageAsync(BackgroundFile);
        var logoBytes = await LoadImageAsync(LogoFile);
        var laurelBytes = await LoadImageAsync(LaurelFile);

        const string firstSignatoryName = "PTR. Antonio T. Ortega";
        const string firstSignatoryPosition = "President, ACE NextGen Consultancy Inc.";
        const string secondSignatoryName = "Dr. Danilo J. Carandang";
        const string secondSignatoryPosition = "Chairman, ACE NextGen Consultancy Inc.";

        var actionText = isCompletion
            ? "for successfully completing the"
            : "for actively participating in the";

        var bodyText = isCompletion
            ? "has successfully completed the required training sessions, learning activities, and assessments for the above-mentioned training program under the specified batch. This certificate is awarded in recognition of the participant’s successful completion of the training requirements of ACE NextGen Consultancy Inc."
            : "has actively participated in the above-mentioned training program under the specified batch. This certificate is awarded in recognition of the participant’s commitment to learning and professional development with ACE NextGen Consultancy Inc.";

        var dateText =
            $"Given this {issuedAt.Day}{GetOrdinalSuffix(issuedAt.Day)} day of {issuedAt.ToString("MMMM", CultureInfo.InvariantCulture)}, {issuedAt.Year}.";

        Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(0);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(s => s.FontFamily("Lato").FontColor(Navy));

                page.Content().Layers(layers =>
                {
                    // BACKGROUND DESIGN (navy corners + red bars)
                    layers.Layer().Image(bgBytes).FitUnproportionally();

                    // LOGO (top-left)
                   layers.Layer()
    .PaddingTop(40)
    .AlignCenter()
    .AlignTop()
    .Width(60)
    .Height(60)
    .Image(logoBytes)
    .FitArea();

                    // MAIN CONTENT
                    layers.PrimaryLayer()
                        .PaddingLeft(60)
                        .PaddingRight(60)
                        .PaddingTop(120)
                        .PaddingBottom(40)
                        .Column(column =>
                        {
                            column.Item().PaddingHorizontal(80).AlignCenter()
                                .Text(title).FontSize(30).Bold()
                                .LetterSpacing(0.08f).FontColor(Navy).AlignCenter();

                            column.Item().PaddingTop(4).AlignCenter()
                                .Text("THIS IS TO CERTIFY THAT")
                                .FontSize(14).Bold().LetterSpacing(0.1f);

                            column.Item().PaddingTop(8).AlignCenter()
                                .Text(participantName.ToUpperInvariant())
                                .FontSize(26).SemiBold();

                            column.Item().PaddingTop(2).AlignCenter()
                                .Width(520).LineHorizontal(2).LineColor(Navy);

                            column.Item().PaddingTop(8).AlignCenter()
                                .Text(actionText).FontSize(12);

                            column.Item().AlignCenter()
                                .Text(trainingName.ToUpperInvariant())
                                .FontSize(15).Bold();

                            column.Item().AlignCenter()
                                .Text($"Training Batch: {batchCode}").FontSize(10);

                            column.Item().PaddingTop(10).PaddingHorizontal(20).AlignCenter()
                                .Text(bodyText).FontSize(11).AlignCenter();

                            column.Item().PaddingTop(10).AlignCenter()
                                .Text(dateText).FontSize(14).Bold();

                            // QR CODE
                            column.Item().PaddingTop(8).AlignCenter()
                                .Width(64).Height(64).Image(qrBytes);

                            column.Item().PaddingTop(2).AlignCenter()
                                .Text("Scan to verify").FontSize(7).FontColor(Gray);

                            column.Item().AlignCenter()
                                .Text($"Certificate No.: {certificateNumber}   |   Verification Code: {verificationCode}")
                                .FontSize(7).FontColor(Gray);

                            // SIGNATORIES + LAUREL
                            column.Item().PaddingTop(4).Row(row =>
                            {
                                row.RelativeItem().PaddingTop(28).Column(sig =>
                                {
                                    sig.Item().AlignCenter().Width(170)
                                        .LineHorizontal(0.8f).LineColor(Navy);
                                    sig.Item().PaddingTop(3).AlignCenter()
                                        .Text(firstSignatoryName).FontSize(10).Bold();
                                    sig.Item().AlignCenter()
                                        .Text(firstSignatoryPosition).FontSize(10);
                                });

                                row.ConstantItem(90).Height(58)
                                    .Image(laurelBytes).FitArea();

                                row.RelativeItem().PaddingTop(28).Column(sig =>
                                {
                                    sig.Item().AlignCenter().Width(170)
                                        .LineHorizontal(0.8f).LineColor(Navy);
                                    sig.Item().PaddingTop(3).AlignCenter()
                                        .Text(secondSignatoryName).FontSize(10).Bold();
                                    sig.Item().AlignCenter()
                                        .Text(secondSignatoryPosition).FontSize(10);
                                });
                            });
                        });
                });
            });
        }).GeneratePdf(stream);

        stream.Position = 0;
        return stream;
    }

    private async Task<byte[]> LoadImageAsync(string fileName)
    {
        var webRoot = _env.WebRootPath
            ?? Path.Combine(_env.ContentRootPath, "wwwroot");

        var path = Path.Combine(webRoot, "images", fileName);

        if (!File.Exists(path))
            throw new FileNotFoundException(
                $"Certificate image not found: {path}");

        return await File.ReadAllBytesAsync(path);
    }

    private static string GetOrdinalSuffix(int day)
    {
        if (day % 100 is 11 or 12 or 13)
            return "th";

        return (day % 10) switch
        {
            1 => "st",
            2 => "nd",
            3 => "rd",
            _ => "th"
        };
    }
}
